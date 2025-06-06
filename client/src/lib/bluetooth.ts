import './bluetooth-types';

export interface BluetoothDevice {
  id: string;
  name: string;
  rssi?: number;
  device?: any;
}

export interface BluetoothMessage {
  type: 'TX' | 'RX' | 'SYS';
  content: string;
  timestamp: Date;
  deviceName?: string;
}

export class BluetoothService {
  private device: any = null;
  private server: any = null;
  private service: any = null;
  private characteristic: any = null;
  private onMessageCallback?: (message: BluetoothMessage) => void;

  async requestDevice(): Promise<BluetoothDevice> {
    // Check for Web Bluetooth API support
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth API no está soportada en este navegador. Usa Chrome o Edge.');
    }

    // Check if running in secure context
    if (!window.isSecureContext) {
      throw new Error('Web Bluetooth API requiere HTTPS. Asegúrate de estar en un contexto seguro.');
    }

    try {
      console.log('Requesting Bluetooth device...');
      
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'ESP32' },
          { namePrefix: 'Arduino' },
          { namePrefix: 'HC-' }
        ],
        // Alternativa para pruebas:
        // acceptAllDevices: true,
        optionalServices: [
          '0000ffe0-0000-1000-8000-00805f9b34fb', // UART Service
          '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service
          '12345678-1234-1234-1234-123456789abc'  // Custom service
        ]
      });

      console.log('Device selected:', device.name, device.id);

      return {
        id: device.id,
        name: device.name || 'Dispositivo Desconocido',
        device: device
      };
    } catch (error) {
      console.error('Bluetooth request error:', error);
      
      if ((error as Error).name === 'NotFoundError') {
        throw new Error('No se encontraron dispositivos Bluetooth compatibles. Verifica que:\n' +
          '• Tu dispositivo ESP32/Arduino esté encendido y en modo emparejamiento\n' +
          '• El Bluetooth esté habilitado en tu computadora\n' +
          '• Estés usando Chrome o Edge\n' +
          '• La aplicación esté ejecutándose en HTTPS');
      } else if ((error as Error).name === 'NotAllowedError') {
        throw new Error('Permisos de Bluetooth denegados. Habilita los permisos en la configuración del navegador.');
      } else {
        throw new Error('Error al solicitar dispositivo Bluetooth: ' + (error as Error).message);
      }
    }
  }

  async connect(deviceInfo: BluetoothDevice): Promise<void> {
    if (!deviceInfo.device) {
      throw new Error('Invalid device');
    }

    try {
      this.device = deviceInfo.device;
      this.server = await this.device.gatt?.connect();
      
      if (!this.server) {
        throw new Error('Failed to connect to GATT server');
      }

      // Try to connect to UART service
      try {
        this.service = await this.server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        this.characteristic = await this.service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
      } catch {
        // Fallback to generic service discovery
        const services = await this.server.getPrimaryServices();
        if (services.length > 0) {
          this.service = services[0];
          const characteristics = await this.service.getCharacteristics();
          this.characteristic = characteristics.find((c: any) => c.properties.write) || characteristics[0];
        }
      }

      if (!this.characteristic) {
        throw new Error('No suitable characteristic found');
      }

      // Set up notifications if supported
      if (this.characteristic.properties.notify) {
        await this.characteristic.startNotifications();
        this.characteristic.addEventListener('characteristicvaluechanged', this.handleNotification.bind(this));
      }

      this.onMessage({
        type: 'SYS',
        content: `Connected to ${deviceInfo.name}`,
        timestamp: new Date(),
        deviceName: deviceInfo.name
      });

    } catch (error) {
      throw new Error('Failed to connect: ' + (error as Error).message);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.characteristic?.properties.notify) {
        await this.characteristic.stopNotifications();
      }
      
      if (this.server) {
        this.server.disconnect();
      }

      this.device = null;
      this.server = null;
      this.service = null;
      this.characteristic = null;

      this.onMessage({
        type: 'SYS',
        content: 'Disconnected',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.characteristic) {
      throw new Error('Not connected to device');
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(message + '\n');
      await this.characteristic.writeValue(data);

      this.onMessage({
        type: 'TX',
        content: message,
        timestamp: new Date()
      });
    } catch (error) {
      throw new Error('Failed to send message: ' + (error as Error).message);
    }
  }

  private handleNotification(event: Event): void {
    const target = event.target as any;
    const value = target.value;
    
    if (value) {
      const decoder = new TextDecoder();
      const message = decoder.decode(value).trim();
      
      if (message) {
        this.onMessage({
          type: 'RX',
          content: message,
          timestamp: new Date()
        });
      }
    }
  }

  onMessage(message: BluetoothMessage): void {
    if (this.onMessageCallback) {
      this.onMessageCallback(message);
    }
  }

  setMessageCallback(callback: (message: BluetoothMessage) => void): void {
    this.onMessageCallback = callback;
  }

  isConnected(): boolean {
    return this.server?.connected || false;
  }

  getDeviceName(): string {
    return this.device?.name || 'Unknown Device';
  }
}

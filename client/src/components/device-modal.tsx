import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Bluetooth, RefreshCw, Signal } from 'lucide-react';
import { BluetoothDevice } from '@/lib/bluetooth';

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (device: BluetoothDevice) => void;
  onRequestDevice: () => Promise<BluetoothDevice | null>;
  isConnecting: boolean;
}

export function DeviceModal({ 
  isOpen, 
  onClose, 
  onConnect, 
  onRequestDevice, 
  isConnecting 
}: DeviceModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);
  const [discoveredDevices, setDiscoveredDevices] = useState<BluetoothDevice[]>([]);

  const handleScan = async () => {
    setIsScanning(true);
    setDiscoveredDevices([]);
    
    try {
      const device = await onRequestDevice();
      if (device) {
        setDiscoveredDevices([device]);
        setSelectedDevice(device);
      }
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = () => {
    if (selectedDevice) {
      onConnect(selectedDevice);
    }
  };

  const handleClose = () => {
    setSelectedDevice(null);
    setDiscoveredDevices([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bluetooth className="h-5 w-5 text-primary" />
            Bluetooth Devices
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isScanning ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-muted-foreground">Scanning for devices...</span>
              </div>
            </div>
          ) : discoveredDevices.length > 0 ? (
            <div className="space-y-2">
              {discoveredDevices.map((device) => (
                <div
                  key={device.id}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedDevice?.id === device.id
                      ? 'bg-primary/20 border-2 border-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  onClick={() => setSelectedDevice(device)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-sm text-muted-foreground">{device.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Signal className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-muted-foreground">
                        {device.rssi ? `${device.rssi} dBm` : 'Strong'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bluetooth className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No devices discovered yet</p>
              <p className="text-sm">Click "Scan" to search for devices</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleScan}
              disabled={isScanning || isConnecting}
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Scan'}
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!selectedDevice || isConnecting}
              className="flex-1"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

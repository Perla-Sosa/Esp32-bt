import { useState, useCallback, useRef } from 'react';
import { BluetoothService, BluetoothDevice, BluetoothMessage } from '@/lib/bluetooth';

export function useBluetooth() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [messages, setMessages] = useState<BluetoothMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const bluetoothService = useRef(new BluetoothService());

  const addMessage = useCallback((message: BluetoothMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const requestDevice = useCallback(async (): Promise<BluetoothDevice | null> => {
    try {
      setError(null);
      const device = await bluetoothService.current.requestDevice();
      return device;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, []);

  const connect = useCallback(async (device: BluetoothDevice) => {
    try {
      setIsConnecting(true);
      setError(null);
      
      bluetoothService.current.setMessageCallback(addMessage);
      await bluetoothService.current.connect(device);
      
      setIsConnected(true);
      setConnectedDevice(device);
    } catch (err) {
      setError((err as Error).message);
      setIsConnected(false);
      setConnectedDevice(null);
    } finally {
      setIsConnecting(false);
    }
  }, [addMessage]);

  const disconnect = useCallback(async () => {
    try {
      await bluetoothService.current.disconnect();
      setIsConnected(false);
      setConnectedDevice(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    try {
      setError(null);
      await bluetoothService.current.sendMessage(message);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isConnected,
    isConnecting,
    connectedDevice,
    messages,
    error,
    requestDevice,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    clearError
  };
}

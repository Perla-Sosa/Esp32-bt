import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bluetooth, Wifi, WifiOff, Settings } from 'lucide-react';
import { useBluetooth } from '@/hooks/use-bluetooth';
import { NumericKeypad } from './numeric-keypad';
import { TerminalOutput } from './terminal-output';
import { DeviceModal } from './device-modal';
import { BluetoothDiagnostics } from './bluetooth-diagnostics';

export function BluetoothTerminal() {
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const { toast } = useToast();
  
  const {
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
  } = useBluetooth();

  const handleToggleConnection = () => {
    if (isConnected) {
      disconnect();
    } else {
      setIsDeviceModalOpen(true);
    }
  };

  const handleDeviceConnect = async (device: any) => {
    await connect(device);
    setIsDeviceModalOpen(false);
  };

  const handleKeyPress = async (key: string) => {
    try {
      await sendMessage(key);
    } catch (err) {
      toast({
        title: "Send Failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleCustomCommand = async (command: string) => {
    try {
      await sendMessage(command);
    } catch (err) {
      toast({
        title: "Send Failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleRequestDevice = async () => {
    try {
      const device = await requestDevice();
      if (!device) {
        throw new Error('No device selected');
      }
      return device;
    } catch (err) {
      toast({
        title: "Device Request Failed",
        description: (err as Error).message,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Show error toast
  if (error) {
    toast({
      title: "Bluetooth Error",
      description: error,
      variant: "destructive",
    });
    clearError();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bluetooth className="text-primary text-xl" />
          <h1 className="text-lg font-medium">Bluetooth Serial Terminal</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500 animate-pulse" />
            )}
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Diagnóstico
          </Button>
          
          <Button
            onClick={handleToggleConnection}
            disabled={isConnecting}
            className={isConnected ? 
              'bg-destructive hover:bg-destructive/90' : 
              'bg-primary hover:bg-primary/90'
            }
          >
            <Bluetooth className="mr-2 h-4 w-4" />
            {isConnecting ? 'Connecting...' : (isConnected ? 'Disconnect' : 'Connect')}
          </Button>
        </div>
      </header>

      {showDiagnostics && (
        <div className="border-b border-border p-4">
          <BluetoothDiagnostics />
        </div>
      )}

      <div className="flex-1 flex">
        <NumericKeypad
          onKeyPress={handleKeyPress}
          onClearTerminal={clearMessages}
          onCustomCommand={() => {
            toast({
              title: "Custom Command",
              description: "Use the input field at the bottom of the terminal",
            });
          }}
          disabled={!isConnected}
        />
        
        <TerminalOutput
          messages={messages}
          deviceName={connectedDevice?.name || ''}
          onSendCustomCommand={handleCustomCommand}
          disabled={!isConnected}
        />
      </div>

      <DeviceModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        onConnect={handleDeviceConnect}
        onRequestDevice={handleRequestDevice}
        isConnecting={isConnecting}
      />
    </div>
  );
}

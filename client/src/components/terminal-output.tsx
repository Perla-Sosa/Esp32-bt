import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Terminal, ArrowDown } from 'lucide-react';
import { BluetoothMessage } from '@/lib/bluetooth';

interface TerminalOutputProps {
  messages: BluetoothMessage[];
  deviceName: string;
  onSendCustomCommand: (command: string) => void;
  disabled: boolean;
}

export function TerminalOutput({ 
  messages, 
  deviceName, 
  onSendCustomCommand, 
  disabled 
}: TerminalOutputProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRef.current) {
      const command = inputRef.current.value.trim();
      if (command) {
        onSendCustomCommand(command);
        inputRef.current.value = '';
      }
    }
  };

  const handleSendCommand = () => {
    if (inputRef.current) {
      const command = inputRef.current.value.trim();
      if (command) {
        onSendCustomCommand(command);
        inputRef.current.value = '';
      }
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'TX':
        return 'text-green-400';
      case 'RX':
        return 'text-blue-400';
      case 'SYS':
        return 'text-yellow-400';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="text-primary" />
          <h2 className="text-lg font-medium">Serial Monitor</h2>
          <span className="text-sm text-muted-foreground">
            {deviceName || 'No device connected'}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Baud: 115200</span>
          <Button variant="ghost" size="sm">
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-6 font-mono text-sm bg-background"
      >
        {messages.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            <Terminal className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No messages yet</p>
            <p className="text-xs">Connect to a device to start communication</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="mb-2 flex items-start gap-3">
              <span className="text-muted-foreground text-xs mt-1 w-20">
                {message.timestamp.toLocaleTimeString('en-US', { hour12: false })}
              </span>
              <span className="text-muted-foreground text-xs mt-1 w-8">
                {message.type}
              </span>
              <span className={getMessageColor(message.type)}>
                {message.content}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="bg-card border-t border-border p-4">
        <div className="flex gap-3">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type custom command..."
            className="flex-1 font-mono bg-background"
            onKeyPress={handleInputKeyPress}
            disabled={disabled}
          />
          <Button 
            onClick={handleSendCommand}
            disabled={disabled}
            className="bg-primary hover:bg-primary/90"
          >
            <Terminal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

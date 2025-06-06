import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Keyboard, Fan, Terminal } from 'lucide-react';

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  onClearTerminal: () => void;
  onCustomCommand: () => void;
  disabled: boolean;
}

const keyMappings = {
  '1': 'LED_ON',
  '2': 'LED_OFF',
  '3': 'MOTOR_FWD',
  '4': 'MOTOR_REV',
  '5': 'SERVO_0',
  '6': 'SERVO_90',
  '7': 'SENSOR_READ',
  '8': 'PWM_SET',
  '9': 'STATUS',
  '0': 'STOP_ALL'
};

export function NumericKeypad({ 
  onKeyPress, 
  onClearTerminal, 
  onCustomCommand, 
  disabled 
}: NumericKeypadProps) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="w-80 bg-card border-r border-border p-6 flex flex-col">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        <Keyboard className="mr-2 text-primary" />
        Numeric Keypad
      </h2>
      
      <div className="grid grid-cols-3 gap-3 mb-6">
        {keys.slice(0, 9).map((key) => (
          <Button
            key={key}
            variant="outline"
            size="lg"
            className="keypad-btn h-16 text-xl font-mono bg-muted hover:bg-muted/80 border-border"
            onClick={() => onKeyPress(key)}
            disabled={disabled}
          >
            {key}
          </Button>
        ))}
        <Button
          variant="outline"
          size="lg"
          className="keypad-btn h-16 text-xl font-mono bg-muted hover:bg-muted/80 border-border col-start-2"
          onClick={() => onKeyPress('0')}
          disabled={disabled}
        >
          0
        </Button>
      </div>
      
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          onClick={onClearTerminal}
        >
          <Fan className="mr-2 h-4 w-4" />
          Clear Terminal
        </Button>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={onCustomCommand}
          disabled={disabled}
        >
          <Terminal className="mr-2 h-4 w-4" />
          Custom Command
        </Button>
      </div>

      <Card className="mt-6 p-4 bg-muted">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Key Mappings
        </h3>
        <div className="text-xs text-muted-foreground space-y-1 font-mono">
          {Object.entries(keyMappings).map(([key, command]) => (
            <div key={key} className="flex justify-between">
              <span>{key}</span>
              <span>→</span>
              <span>{command}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

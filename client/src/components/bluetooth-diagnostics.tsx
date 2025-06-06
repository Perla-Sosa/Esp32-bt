import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Wifi, Globe, Shield, Bluetooth } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  icon: React.ReactNode;
}

export function BluetoothDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // Check browser support
    if (navigator.bluetooth) {
      results.push({
        name: 'Soporte Web Bluetooth',
        status: 'success',
        message: 'Tu navegador soporta Web Bluetooth API',
        icon: <CheckCircle className="h-4 w-4" />
      });
    } else {
      results.push({
        name: 'Soporte Web Bluetooth',
        status: 'error',
        message: 'Tu navegador no soporta Web Bluetooth. Usa Chrome o Edge.',
        icon: <AlertCircle className="h-4 w-4" />
      });
    }

    // Check secure context
    if (window.isSecureContext) {
      results.push({
        name: 'Contexto Seguro (HTTPS)',
        status: 'success',
        message: 'La aplicación se ejecuta en un contexto seguro',
        icon: <Shield className="h-4 w-4" />
      });
    } else {
      results.push({
        name: 'Contexto Seguro (HTTPS)',
        status: 'error',
        message: 'La aplicación requiere HTTPS para acceder a Bluetooth',
        icon: <AlertCircle className="h-4 w-4" />
      });
    }

    // Check URL
    const isReplit = window.location.hostname.includes('replit');
    const isLocalhost = window.location.hostname === 'localhost';
    const isHttps = window.location.protocol === 'https:';

    if (isReplit && isHttps) {
      results.push({
        name: 'Entorno de Desarrollo',
        status: 'warning',
        message: 'Ejecutándose en Replit. Para mejor compatibilidad, despliega la aplicación.',
        icon: <Globe className="h-4 w-4" />
      });
    } else if (isLocalhost) {
      results.push({
        name: 'Entorno de Desarrollo',
        status: 'warning',
        message: 'Ejecutándose en localhost. Web Bluetooth puede tener limitaciones.',
        icon: <Globe className="h-4 w-4" />
      });
    } else {
      results.push({
        name: 'Entorno de Desarrollo',
        status: 'success',
        message: 'Ejecutándose en dominio de producción',
        icon: <Globe className="h-4 w-4" />
      });
    }

    // Check Bluetooth availability
    if (navigator.bluetooth) {
      try {
        const availability = await navigator.bluetooth.getAvailability();
        if (availability) {
          results.push({
            name: 'Bluetooth del Sistema',
            status: 'success',
            message: 'Bluetooth está disponible en tu sistema',
            icon: <Bluetooth className="h-4 w-4" />
          });
        } else {
          results.push({
            name: 'Bluetooth del Sistema',
            status: 'error',
            message: 'Bluetooth no está disponible. Verifica que esté habilitado.',
            icon: <AlertCircle className="h-4 w-4" />
          });
        }
      } catch (error) {
        results.push({
          name: 'Bluetooth del Sistema',
          status: 'warning',
          message: 'No se pudo verificar la disponibilidad de Bluetooth',
          icon: <AlertCircle className="h-4 w-4" />
        });
      }
    }

    // Check user agent
    const isChrome = navigator.userAgent.includes('Chrome');
    const isEdge = navigator.userAgent.includes('Edge');
    const isFirefox = navigator.userAgent.includes('Firefox');
    const isSafari = navigator.userAgent.includes('Safari') && !isChrome;

    if (isChrome || isEdge) {
      results.push({
        name: 'Navegador Compatible',
        status: 'success',
        message: `Usando ${isChrome ? 'Chrome' : 'Edge'} - Compatible con Web Bluetooth`,
        icon: <CheckCircle className="h-4 w-4" />
      });
    } else if (isFirefox) {
      results.push({
        name: 'Navegador Compatible',
        status: 'error',
        message: 'Firefox no soporta Web Bluetooth. Usa Chrome o Edge.',
        icon: <AlertCircle className="h-4 w-4" />
      });
    } else if (isSafari) {
      results.push({
        name: 'Navegador Compatible',
        status: 'error',
        message: 'Safari no soporta Web Bluetooth. Usa Chrome o Edge.',
        icon: <AlertCircle className="h-4 w-4" />
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-500/20 text-green-500">OK</Badge>;
      case 'error': return <Badge className="bg-red-500/20 text-red-500">Error</Badge>;
      case 'warning': return <Badge className="bg-yellow-500/20 text-yellow-500">Advertencia</Badge>;
      default: return null;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Diagnóstico Bluetooth</h3>
        <Button onClick={runDiagnostics} disabled={isRunning} size="sm">
          <Wifi className="h-4 w-4 mr-2" />
          {isRunning ? 'Verificando...' : 'Verificar'}
        </Button>
      </div>

      <div className="space-y-3">
        {diagnostics.map((diagnostic, index) => (
          <div key={index} className="flex items-start justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <div className={getStatusColor(diagnostic.status)}>
                {diagnostic.icon}
              </div>
              <div>
                <div className="font-medium text-sm">{diagnostic.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {diagnostic.message}
                </div>
              </div>
            </div>
            {getStatusBadge(diagnostic.status)}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-muted rounded-lg">
        <h4 className="text-sm font-medium mb-2">Información del Sistema</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>URL: {window.location.href}</div>
          <div>Protocolo: {window.location.protocol}</div>
          <div>Navegador: {navigator.userAgent.split(' ').slice(-2).join(' ')}</div>
          <div>Contexto Seguro: {window.isSecureContext ? 'Sí' : 'No'}</div>
        </div>
      </div>
    </Card>
  );
}
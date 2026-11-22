'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { checkCameraPermission } from '@/lib/camera';

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (result: string) => void;
  /** Which camera to prefer: back ('environment') or front ('user') */
  facingMode?: 'environment' | 'user';
}

export function BarcodeScanner({
  open,
  onOpenChange,
  onScan,
  facingMode = 'environment',
}: BarcodeScannerProps) {
  const scannerRef = useRef<any>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Check camera on mount/open
  useEffect(() => {
    if (open) {
      checkCameraPermission().then(({ available, error }) => {
        setCameraAvailable(available);
        if (!available) {
          setCameraError(error);
        }
      });
    }
  }, [open]);

  // Initialize scanner when camera is available
  useEffect(() => {
    if (!open || !cameraAvailable || !videoContainerRef.current) return;

    let html5QrCode: any = null;
    let running = true;

    const initScanner = async () => {
      setScanning(true);
      try {
        // Dynamically import html5-qrcode
        const { Html5Qrcode } = await import('html5-qrcode');
        html5QrCode = new Html5Qrcode('qr-scanner-video');

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            // Detected!
            setDetected(true);
            setTimeout(() => {
              setDetected(false);
              // Stop scanning temporarily
              if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                  onScan(decodedText);
                  onOpenChange(false);
                }).catch(() => {
                  onScan(decodedText);
                  onOpenChange(false);
                });
              }
            }, 300);
          },
          (_failure: string) => {
            // Decode failure — ignore, keep scanning
          }
        );

        scannerRef.current = html5QrCode;
      } catch (err: any) {
        console.error('Scanner init error:', err);
        setCameraError(`Impossible d'initialiser le scanner: ${err.message || 'Erreur inconnue'}`);
        setCameraAvailable(false);
        setScanning(false);
      }
    };

    initScanner();

    return () => {
      running = false;
      stopScanner();
    };
  }, [open, cameraAvailable]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
    setScanning(false);
    setDetected(false);
  }, []);

  const handleCancel = useCallback(async () => {
    await stopScanner();
    setManualCode('');
    onOpenChange(false);
  }, [stopScanner, onOpenChange]);

  const handleManualSubmit = useCallback(() => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      onOpenChange(false);
    }
  }, [manualCode, onScan, onOpenChange]);

  const handleSwitchCamera = useCallback(async () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    setSwitching(true);
    await stopScanner();

    // Re-initialize with new camera
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const newScanner = new Html5Qrcode('qr-scanner-video');

      await newScanner.start(
        { facingMode: newFacing },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          setDetected(true);
          setTimeout(() => {
            setDetected(false);
            if (newScanner.isScanning) {
              newScanner.stop().then(() => {
                onScan(decodedText);
                onOpenChange(false);
              });
            }
          }, 300);
        },
        () => {}
      );

      scannerRef.current = newScanner;
      setCameraError(null);
    } catch (err: any) {
      setCameraError('Changement de caméra échoué');
    } finally {
      setSwitching(false);
      setScanning(true);
    }
  }, [facingMode, stopScanner, onScan, onOpenChange]);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      stopScanner();
      setManualCode('');
      setDetected(false);
    }
  }, [open, stopScanner]);

  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!o) handleCancel();
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Scanner un code-barres / QR</DialogTitle>
          <DialogDescription>
            Pointez la caméra vers un code-barres ou QR code pour scanner automatiquement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera viewfinder */}
          {cameraAvailable && !cameraError && (
            <div className="relative">
              <div
                ref={videoContainerRef}
                id="qr-scanner-video"
                className={`rounded-lg overflow-hidden border-4 transition-colors duration-300 ${
                  detected
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-primary/50'
                }`}
                style={{ minHeight: 250 }}
              />
              {/* Scanning overlay */}
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Camera className="h-8 w-8" />
                    <p>Démarrage du scanner...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Camera error or not available */}
          {cameraError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
              <div className="flex items-start gap-2 text-destructive">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">Caméra non disponible</p>
                  <p className="text-sm text-muted-foreground">{cameraError}</p>
                </div>
              </div>

              {/* Try again or switch camera */}
              {cameraAvailable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwitchCamera}
                  disabled={switching}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {switching ? 'Changement...' : 'Changer de caméra'}
                </Button>
              )}
            </div>
          )}

          {/* Manual input fallback */}
          <div className="space-y-2">
            <Label htmlFor="manual-code">
              Ou saisir le code manuellement
            </Label>
            <div className="flex gap-2">
              <Input
                id="manual-code"
                placeholder="QR code ou code-barres..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleManualSubmit();
                }}
              />
              <Button
                onClick={handleManualSubmit}
                disabled={!manualCode.trim()}
              >
                Rechercher
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

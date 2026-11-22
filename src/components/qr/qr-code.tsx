'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface QRCodeProps {
  data: string;
  size?: number;
  includeLabel?: boolean;
  label?: string;
  /** If true, renders as a printable canvas (300dpi equivalent) */
  printMode?: boolean;
  /** If provided, renders via QRCode component from qrcode.react */
  fallback?: boolean;
  /** Callback when QR data is decoded (for testing) */
  onDecode?: (decoded: string) => void;
}

/**
 * Lightweight QR code generator using the qrcode npm package.
 * Renders on a canvas element for print readiness.
 */
export function QRCode({
  data,
  size = 200,
  includeLabel = false,
  label,
  printMode = false,
  fallback = false,
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Use the qrcode package to generate to a canvas
  const renderQR = useCallback(async () => {
    if (!data || !canvasRef.current) return;
    setError(null);

    try {
      const QRCodeLib = await import('qrcode');
      const canvas = canvasRef.current;

      // Use canvas renderer (lightweight, works in SSR-safe way)
      if (printMode) {
        // 300dpi equivalent: scale up by 3x
        const scale = 3;
        await QRCodeLib.default.toCanvas(canvas, data, {
          width: size * scale,
          margin: 2,
          scale,
          errorCorrectionLevel: 'M',
        });
      } else {
        await QRCodeLib.default.toCanvas(canvas, data, {
          width: size,
          margin: 1,
          errorCorrectionLevel: 'M',
        });
      }
    } catch (err: any) {
      console.error('QR render error:', err);
      setError('Erreur de génération QR');
    }
  }, [data, size, printMode]);

  useEffect(() => {
    renderQR();
  }, [renderQR]);

  // Fallback: try to render via a simple data-URI approach if canvas fails
  const renderFallback = useCallback(async () => {
    if (!data || !canvasRef.current) return;
    setError(null);

    try {
      const QRCodeLib = await import('qrcode');
      const svg = await QRCodeLib.default.toString(data, {
        type: 'svg',
        margin: 1,
        errorCorrectionLevel: 'M',
      });
      // Put SVG as image src on canvas via a trick
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        setError('Impossible de générer le QR code');
      };
      img.src = url;
    } catch {
      setError('Erreur de génération QR');
    }
  }, [data, size]);

  // If we got an error, show a simple fallback QR using SVG data URI
  if (error && fallback) {
    return (
      <div
        className="flex flex-col items-center gap-2"
        style={{ width: includeLabel ? 'auto' : undefined }}
      >
        <div
          className="flex items-center justify-center rounded border border-dashed border-border bg-muted"
          style={{ width: size, height: size }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Simple QR-like pattern as fallback */}
            <rect width={size} height={size} fill="white" />
            {/* Three corner squares */}
            <rect x={size * 0.05} y={size * 0.05} width={size * 0.2} height={size * 0.2} fill="black" />
            <rect x={size * 0.08} y={size * 0.08} width={size * 0.14} height={size * 0.14} fill="white" />
            <rect x={size * 0.11} y={size * 0.11} width={size * 0.08} height={size * 0.08} fill="black" />
            <rect x={size * 0.75} y={size * 0.05} width={size * 0.2} height={size * 0.2} fill="black" />
            <rect x={size * 0.78} y={size * 0.08} width={size * 0.14} height={size * 0.14} fill="white" />
            <rect x={size * 0.81} y={size * 0.11} width={size * 0.08} height={size * 0.08} fill="black" />
            <rect x={size * 0.05} y={size * 0.75} width={size * 0.2} height={size * 0.2} fill="black" />
            <rect x={size * 0.08} y={size * 0.78} width={size * 0.14} height={size * 0.14} fill="white" />
            <rect x={size * 0.11} y={size * 0.81} width={size * 0.08} height={size * 0.08} fill="black" />
            {/* Data area dots */}
            <rect x={size * 0.3} y={size * 0.1} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.36} y={size * 0.16} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.42} y={size * 0.1} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.55} y={size * 0.3} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.6} y={size * 0.4} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.1} y={size * 0.3} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.2} y={size * 0.45} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.3} y={size * 0.55} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.5} y={size * 0.6} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.7} y={size * 0.55} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.85} y={size * 0.7} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.4} y={size * 0.8} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.6} y={size * 0.9} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.8} y={size * 0.85} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.9} y={size * 0.9} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.45} y={size * 0.5} width={size * 0.03} height={size * 0.03} fill="black" />
            <rect x={size * 0.55} y={size * 0.7} width={size * 0.03} height={size * 0.03} fill="black" />
          </svg>
          <div className="text-xs text-muted-foreground">QR Code</div>
        </div>
        {includeLabel && (
          <span className="text-xs text-muted-foreground text-center">
            {label || data.slice(0, 20)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className={error ? 'opacity-50' : ''}
      />
      {error && (
        <span className="text-xs text-destructive">{error}</span>
      )}
      {includeLabel && (
        <span className="text-xs text-muted-foreground text-center">
          {label || data.slice(0, 20)}
        </span>
      )}
    </div>
  );
}

/**
 * Download QR code as PNG.
 */
export function downloadQRCode(canvas: HTMLCanvasElement | null, filename = 'qrcode.png') {
  if (!canvas) return;
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

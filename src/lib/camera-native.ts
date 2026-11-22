/**
 * Native camera wrapper for barcode/QR scanning.
 * Uses Capacitor Camera plugin on mobile, falls back to browser
 * camera API (navigator.mediaDevices) on web/desktop.
 */

import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';

type CaptureResult = {
  dataUrl?: string;
  path?: string;
  format: 'jpeg' | 'png';
  width: number;
  height: number;
};

type ScanResult = {
  format: string;
  data: string;
};

// Detect if running inside Capacitor
function isNative(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!(window as any).Capacitor?.isNativePlatform?.()
  );
}

// Ask camera permission on web
async function requestCameraPermission(): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });
    return stream;
  } catch {
    return null;
  }
}

/**
 * Capture a photo using the device rear camera.
 * On mobile: uses Capacitor Camera plugin.
 * On web: prompts for camera permission and captures a frame.
 */
export async function capturePhoto(): Promise<CaptureResult | null> {
  if (isNative()) {
    try {
      const { Camera, CameraResultType, CameraDirection, CameraSource } = await import('@capacitor/camera');
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        direction: CameraDirection.Rear,
      });
      return {
        dataUrl: image.webPath || image.dataUrl || undefined,
        format: image.format as 'jpeg' | 'png',
        width: 0,
        height: 0,
      };
    } catch (err) {
      console.error('[CameraNative] Capacitor capture failed:', err);
      return null;
    }
  }

  // Web fallback
  const stream = await requestCameraPermission();
  if (!stream) return null;

  const canvas = document.createElement('canvas');
  const videoEl = document.createElement('video');
  videoEl.srcObject = stream;
  videoEl.play();

  await new Promise<void>((resolve) => {
    videoEl.oncanplay = () => resolve();
  });

  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(videoEl, 0, 0);

  stream.getTracks().forEach((t) => t.stop());

  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  return {
    dataUrl,
    format: 'jpeg',
    width: canvas.width,
    height: canvas.height,
  };
}

/**
 * Scan a barcode or QR code using the native Capacitor ML Kit BarcodeScanner.
 * On native: uses the dedicated barcode scanner plugin.
 * On web: returns null to signal that scanning needs the html5-qrcode web scanner.
 */
export async function scanBarcode(): Promise<ScanResult | null> {
  if (isNative()) {
    try {
      // Start the scanner
      const results = await BarcodeScanner.scan({
        formats: [
          BarcodeFormat.QrCode,
          BarcodeFormat.Ean13,
          BarcodeFormat.Ean8,
          BarcodeFormat.Code128,
          BarcodeFormat.Code39,
          BarcodeFormat.Code93,
          BarcodeFormat.Codabar,
          BarcodeFormat.Itf,
          BarcodeFormat.UpcA,
          BarcodeFormat.UpcE,
          BarcodeFormat.DataMatrix,
          BarcodeFormat.Pdf417,
          BarcodeFormat.Aztec,
        ],
      });

      if (results.barcodes.length > 0) {
        const bc = results.barcodes[0];
        return {
          format: bc.format ?? 'unknown',
          data: bc.rawValue ?? '',
        };
      }
      return null;
    } catch (err) {
      console.error('[CameraNative] BarcodeScanner failed:', err);
      return null;
    }
  }

  // Web fallback — captured photo is decoded client-side via html5-qrcode
  return null;
}

export { isNative };

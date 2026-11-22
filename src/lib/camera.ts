'use client';

/**
 * Check if the camera is available and permissions granted.
 * Returns a promise that resolves to an object with availability info.
 */
export async function checkCameraPermission(): Promise<{
  available: boolean;
  error: string | null;
}> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      available: false,
      error: 'La caméra n\'est pas supportée sur cet appareil.',
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Permissions granted — stop the stream immediately
    stream.getTracks().forEach((track) => track.stop());
    return { available: true, error: null };
  } catch (err: any) {
    let errorMsg: string;
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      errorMsg = 'Accès caméra refusé. Autorisez la caméra dans les paramètres du navigateur.';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      errorMsg = 'Aucune caméra détectée sur cet appareil.';
    } else if (err.name === 'NotReadableError' || err.name === 'AccessError') {
      errorMsg = 'La caméra est utilisée par une autre application.';
    } else {
      errorMsg = `Impossible d'accéder à la caméra : ${err.message || 'Erreur inconnue'}.`;
    }
    return { available: false, error: errorMsg };
  }
}

/**
 * Try to get a video stream for scanning.
 * Returns the stream or null on failure.
 */
export async function getCameraStream(
  facingMode: 'user' | 'environment' = 'environment'
): Promise<MediaStream | null> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return null;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
    });
    return stream;
  } catch {
    return null;
  }
}

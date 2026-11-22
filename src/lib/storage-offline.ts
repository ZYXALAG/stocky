/**
 * Offline-first storage layer.
 * Uses Capacitor Storage on native, falls back to localStorage on web.
 * Provides a FIFO queue for pending stock movements that sync when back online.
 */

type StockMovement = {
  id: string;
  type: 'IN' | 'OUT' | 'TRANSFER';
  productId?: string;
  quantity: number;
  location?: string;
  notes?: string;
  timestamp: number;
};

type PendingOperation = {
  id: string;
  kind: 'movement';
  payload: StockMovement;
  createdAt: number;
  retries: number;
};

const MOVEMENTS_KEY = 'stocky_pending_movements';
const CACHED_CATEGORIES_KEY = 'stocky_cached_categories';
const CACHED_TEMPLATES_KEY = 'stocky_cached_templates';

// ---- Storage abstraction (Capacitor → localStorage fallback) ----

async function getItem(key: string): Promise<string | null> {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    const { value } = await Preferences.get({ key });
    return value;
  } catch {
    // Capacitor not available (web) or error — fall back
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({ key, value });
    return;
  } catch {
    // Capacitor not available — fall back
  }
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage full or unavailable — ignore
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.remove({ key });
    return;
  } catch {
    // Capacitor not available — fall back
  }
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// ---- Pending movements queue ----

export async function getPendingMovements(): Promise<StockMovement[]> {
  const raw = await getItem(MOVEMENTS_KEY);
  if (!raw) return [];
  try {
    const ops: PendingOperation[] = JSON.parse(raw);
    return ops.filter((o) => o.kind === 'movement').map((o) => o.payload);
  } catch {
    return [];
  }
}

export async function enqueueMovement(movement: StockMovement): Promise<void> {
  const raw = await getItem(MOVEMENTS_KEY);
  let ops: PendingOperation[] = [];
  try {
    ops = raw ? JSON.parse(raw) : [];
  } catch {
    // corrupt — start fresh
  }

  ops.push({
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    kind: 'movement',
    payload: movement,
    createdAt: Date.now(),
    retries: 0,
  });

  await setItem(MOVEMENTS_KEY, JSON.stringify(ops));
}

export async function clearPendingMovements(): Promise<void> {
  await removeItem(MOVEMENTS_KEY);
}

export async function removeQueuedMovement(opId: string): Promise<void> {
  const raw = await getItem(MOVEMENTS_KEY);
  if (!raw) return;
  try {
    const ops: PendingOperation[] = JSON.parse(raw);
    const filtered = ops.filter((o) => o.id !== opId);
    await setItem(MOVEMENTS_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

// ---- Cached data ----

export async function cacheData(key: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  await setItem(key, json);
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const raw = await getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function clearCachedCategories(): Promise<void> {
  await removeItem(CACHED_CATEGORIES_KEY);
}

export async function clearCachedTemplates(): Promise<void> {
  await removeItem(CACHED_TEMPLATES_KEY);
}

// ---- Cleanup ----

export async function clearAllOfflineData(): Promise<void> {
  await clearPendingMovements();
  await clearCachedCategories();
  await clearCachedTemplates();
}

export { getItem, setItem, removeItem };

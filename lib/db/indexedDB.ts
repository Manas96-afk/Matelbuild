const DB_NAME = 'buildora_db';
const DB_VERSION = 1;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('IndexedDB is not available on the server'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('drawings')) {
        db.createObjectStore('drawings');
      }
      if (!db.objectStoreNames.contains('analyses')) {
        db.createObjectStore('analyses');
      }
      if (!db.objectStoreNames.contains('digital_models')) {
        db.createObjectStore('digital_models');
      }
    };
  });
}

export async function getValue<T>(storeName: string, key: string): Promise<T | null> {
  if (typeof window === 'undefined') return null;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve((request.result as T) || null);
    });
  } catch (error) {
    console.error(`IndexedDB getValue error for store ${storeName}, key ${key}:`, error);
    throw error;
  }
}

export async function setValue<T>(storeName: string, key: string, value: T): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value, key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error(`IndexedDB setValue error for store ${storeName}, key ${key}:`, error);
    throw error;
  }
}

export async function deleteValue(storeName: string, key: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error(`IndexedDB deleteValue error for store ${storeName}, key ${key}:`, error);
    throw error;
  }
}

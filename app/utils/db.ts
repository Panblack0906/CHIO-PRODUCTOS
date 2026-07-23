// Simple IndexedDB Key-Value Store to bypass 5MB localStorage limits
const DB_NAME = 'ChioProductosDB_v2';
const STORE_NAME = 'keyvalue';
const DB_VERSION = 1;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function setDBItem(key: string, value: any): Promise<void> {
  try {
    const db = await getDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('IndexedDB save failed, falling back to localStorage if possible:', e);
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (localError) {
      console.error('localStorage fallback also failed:', localError);
    }
  }
}

export async function getDBItem<T>(key: string, fallbackValue: T): Promise<T> {
  try {
    const db = await getDB();
    return new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => {
        if (request.result !== undefined) {
          resolve(request.result as T);
        } else {
          // try localStorage fallback
          const local = localStorage.getItem(key);
          if (local) {
            try {
              resolve(JSON.parse(local) as T);
            } catch {
              resolve(local as unknown as T);
            }
          } else {
            resolve(fallbackValue);
          }
        }
      };
      request.onerror = () => {
        const local = localStorage.getItem(key);
        if (local) {
          try {
            resolve(JSON.parse(local) as T);
          } catch {
            resolve(local as unknown as T);
          }
        } else {
          resolve(fallbackValue);
        }
      };
    });
  } catch (e) {
    const local = localStorage.getItem(key);
    if (local) {
      try {
        return JSON.parse(local) as T;
      } catch {
        return local as unknown as T;
      }
    }
    return fallbackValue;
  }
}

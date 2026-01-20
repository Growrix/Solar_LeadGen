'use client';

import React from 'react';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function getStorage(): StorageLike | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function usePersistentState<T extends Json>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(() => {
    const storage = getStorage();
    if (!storage) return initialValue;
    const raw = storage.getItem(key);
    if (!raw) return initialValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initialValue;
    }
  });

  React.useEffect(() => {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore storage quota errors
    }
  }, [key, value]);

  return [value, setValue];
}

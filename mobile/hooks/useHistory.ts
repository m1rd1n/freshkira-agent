import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { HistoryItem } from '../types';

const STORAGE_KEY = '@freshkira/history';
const MAX_ITEMS = 50;

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // storage read failure — start with empty history
    }
  }, []);

  const saveItem = useCallback(async (item: HistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, MAX_ITEMS);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const clearAll = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, saveItem, deleteItem, clearAll, loadHistory };
}

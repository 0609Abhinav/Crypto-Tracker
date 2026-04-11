import { useState, useCallback } from "react";

export const useLocalStorage = (key, initialValue) => {
  const [stored, setStored] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStored((prev) => {
        const v = value instanceof Function ? value(prev) : value;
        localStorage.setItem(key, JSON.stringify(v));
        return v;
      });
    } catch (err) {
      console.error(err);
    }
  }, [key]);

  return [stored, setValue];
};

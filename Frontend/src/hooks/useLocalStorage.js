import { useState } from "react";

export const useLocalStorage = (key, initialValue) => {
  const [stored, setStored] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const v = value instanceof Function ? value(stored) : value;
      setStored(v);
      localStorage.setItem(key, JSON.stringify(v));
    } catch (err) {
      console.error(err);
    }
  };

  return [stored, setValue];
};

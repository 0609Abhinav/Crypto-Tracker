import { useLocalStorage } from "./useLocalStorage";

const MAX = 6;

export const useRecentlyViewed = () => {
  const [recent, setRecent] = useLocalStorage("recently_viewed", []);

  const addCoin = (coin) => {
    setRecent((prev) => {
      const filtered = prev.filter((c) => c.id !== coin.id);
      return [{ id: coin.id, name: coin.name, symbol: coin.symbol, image: coin.image, price: coin.price, change: coin.change }, ...filtered].slice(0, MAX);
    });
  };

  const clearRecent = () => setRecent([]);

  return { recent, addCoin, clearRecent };
};

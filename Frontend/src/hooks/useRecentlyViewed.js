import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocalStorage } from "./useLocalStorage";
import { addRecentToDB, clearRecentFromDB } from "../store/prefsSlice";

const MAX = 6;

export const useRecentlyViewed = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const dbRecent = useSelector((s) => s.prefs.recentlyViewed);
  const prefsLoaded = useSelector((s) => s.prefs.loaded);

  const [localRecent, setLocalRecent] = useLocalStorage("recently_viewed", []);

  // Use DB data when logged in and loaded, otherwise localStorage
  const recent = user && prefsLoaded ? dbRecent : localRecent;

  const addCoin = useCallback((coin) => {
    const entry = {
      id: coin.id, name: coin.name, symbol: coin.symbol,
      image: coin.image, price: coin.price, change: coin.change,
    };
    if (user) {
      // Sync to DB — prefsSlice updates Redux state on success
      dispatch(addRecentToDB(entry));
    } else {
      // Guest — localStorage only
      setLocalRecent((prev) => {
        const filtered = prev.filter((c) => c.id !== coin.id);
        return [entry, ...filtered].slice(0, MAX);
      });
    }
  }, [user, dispatch, setLocalRecent]);

  const clearRecent = useCallback(() => {
    if (user) {
      dispatch(clearRecentFromDB());
    } else {
      setLocalRecent([]);
    }
  }, [user, dispatch, setLocalRecent]);

  return { recent, addCoin, clearRecent };
};

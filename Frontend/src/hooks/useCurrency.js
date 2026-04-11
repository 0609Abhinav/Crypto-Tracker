import { useSelector, useDispatch } from "react-redux";
import { setCurrency, CURRENCIES } from "../store/currencySlice";

export { CURRENCIES };

export const useCurrency = () => {
  const dispatch = useDispatch();
  const currency = useSelector((s) => s.currency.current);
  return {
    currency,
    setCurrency: (c) => dispatch(setCurrency(c)),
    currencies: CURRENCIES,
  };
};

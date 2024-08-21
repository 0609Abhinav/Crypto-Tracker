import React from "react";
import { MdOutlineStarRate, MdOutlineStar } from "react-icons/md";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { handleAddCoins, handleremovecoin } from "../store/watchlistSlice";

const Card = ({ item, checker }) => {
  const data = useSelector((store) => store.watchlistSlice);
  const dispatch = useDispatch();

  const isPresent = (element, array) =>
    array.some((obj) => JSON.stringify(obj) === JSON.stringify(element));

  const starRenderingLogic = isPresent(item, data);

  function addCoin() {
    dispatch(handleAddCoins(item));
  }

  function removeCoin() {
    dispatch(handleremovecoin(item));
  }

  // Log the item to verify its structure
  console.log(item);

  return (
    <div className="w-full mt-5 bg-gradient-to-br from-blue-100 via-cyan-200 to-blue-300 border shadow-lg rounded-xl p-6 bg-gray-100 hover:scale-105 hover:shadow-2xl transition-transform duration-300 ease-in-out">
      <div className="flex gap-6 items-center">
        <abbr className="w-16" title="Click here to know more.">
          <Link to={`/coin/${item.id}`}>
            <img
              src={checker === "top15" ? item.thumb : item.image}
              alt="Crypto symbol"
              className="rounded-full border-2 border-blue-400"
            />
          </Link>
        </abbr>
        <div className="flex flex-col w-full">
          <h2 className="text-2xl font-bold text-blue-800">{item.name}</h2>
          <h2 className="text-lg font-semibold text-gray-500 uppercase">
            {item.symbol}
          </h2>
        </div>
        {!starRenderingLogic ? (
          <MdOutlineStarRate
            onClick={addCoin}
            className="text-[50px] text-yellow-500 cursor-pointer hover:text-yellow-600 transition-colors"
          />
        ) : (
          <MdOutlineStar
            onClick={removeCoin}
            className="text-[50px] text-yellow-500 cursor-pointer hover:text-yellow-600 transition-colors"
          />
        )}
      </div>

      <div className="flex items-center gap-6 mt-4">
        {checker !== "top15" && (
          <h3
            className={`border px-3 py-2 text-lg rounded-3xl font-semibold ${
              item.price_change_24h > 0
                ? "border-green-400 text-green-600"
                : "border-red-400 text-red-600"
            } shadow-sm`}
          >
            &#x24;
            {item.price_change_24h
              ? (Math.round(item.price_change_24h * 1e5) / 1e5).toFixed(6)
              : "N/A"}
          </h3>
        )}
        <div
          className={`border p-3 rounded-full ${
            checker === "top15"
              ? item.data.price_change_percentage_24h?.usd > 0
                ? "border-green-400 text-green-600"
                : "border-red-400 text-red-600"
              : item.ath_change_percentage > 0
              ? "border-green-400 text-green-600"
              : "border-red-400 text-red-600"
          } shadow-md`}
        >
          {checker === "top15" ? (
            item.data.price_change_percentage_24h?.usd > 0 ? (
              <FaArrowTrendUp size={24} />
            ) : (
              <FaArrowTrendDown size={24} />
            )
          ) : item.price_change_percentage_24h > 0 ? (
            <FaArrowTrendUp size={24} />
          ) : (
            <FaArrowTrendDown size={24} />
          )}
        </div>
      </div>

      <h3 className="text-3xl font-bold text-blue-700 mt-4">
        &#x24;
        {checker === "top15"
          ? item.data.price
            ? (Math.round(item.data.price * 1000) / 1000).toFixed(3)
            : "N/A"
          : item.current_price || "N/A"}
      </h3>

      <div className="mt-4 text-sm text-gray-700">
        <div>
          <span className="font-semibold">Total Volume:</span>{" "}
          {checker === "top15"
            ? item.data.total_volume || "N/A"
            : item.total_volume || "N/A"}
        </div>
        <div>
          <span className="font-semibold">Market Capacity:</span>{" "}
          {checker === "top15"
            ? item.data.market_cap || "N/A"
            : item.market_cap || "N/A"}
        </div>
      </div>
    </div>
  );
};

export default Card;

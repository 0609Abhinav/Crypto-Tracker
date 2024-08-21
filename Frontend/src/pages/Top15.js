import React, { useEffect, useState } from "react";
import Cards from "../components/Cards";
import DummyUi from "../components/DummyUi";

const Top15 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = "https://api.coingecko.com/api/v3/search/trending/";
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false); // Stop loading when data is fetched
      })
      .catch((error) => {
        console.log(error);
        setLoading(false); // Stop loading even if there is an error
      });
  }, []);

  return (
    <div className="container mx-auto p-6">
      {/* Static UI Elements with Tailwind CSS */}
      <div className="text-center my-8">
        <h1 className="text-4xl font-bold text-gray-800">Top 15 Trending Cryptocurrencies</h1>
        <p className="text-lg text-gray-600 mt-4">
          Stay updated with the most popular cryptocurrencies in the market.
        </p>
      </div>
      
      {/* Dynamic UI */}
      {loading ? (
        <DummyUi />
      ) : (
        <Cards apiData={data.coins} checker={"top15"} />
      )}
    </div>
  );
};

export default Top15;

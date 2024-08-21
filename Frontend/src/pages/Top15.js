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

  return loading ? (
    <DummyUi />
  ) : (
    <div>
      <Cards apiData={data.coins} checker={"top15"} />
    </div>
  );
};

export default Top15;

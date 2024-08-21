import React, { useEffect, useState } from "react";
import Cards from "../components/Cards";


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
    <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh",flexDirection: "column",textAlign: "center"}}>
      <h1 style={{ fontSize: "2rem", marginBottom: "20px", color: "#333" }}>Loading...</h1>
      <p style={{ marginBottom: "20px", color: "#666" }}>Fetching the top 15 trending coins...</p>
  
    </div>
  ) : (
    <div>
      <Cards apiData={data.coins} checker={"top15"} />
    </div>
  );
};

export default Top15;

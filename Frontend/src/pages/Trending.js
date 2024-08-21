import { useState, useEffect } from "react";
import Cards from "../components/Cards";
import { RotatingLines } from "react-loader-spinner";

function Trending() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const options = { method: "GET", headers: { accept: "application/json" } };

    fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false",
      options
    )
      .then((response) => response.json())
      .then((response) => {
        setData(response);
        setLoading(false); // Stop loading when data is fetched
      })
      .catch((err) => {
        console.error(err);
        setLoading(false); // Stop loading even if there's an error
      });
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#333", fontSize: "2rem", marginBottom: "1rem" }}>
          Loading...
        </h1>
        <p style={{ color: "#666", fontSize: "1.2rem", marginBottom: "2rem" }}>
          Please wait while we fetch the data.
        </p>
        <RotatingLines
          strokeColor="red"
          strokeWidth="6"
          animationDuration="0.75"
          width="100"
          visible={true}
        />
      </div>
      
    );
  }
  return (
    <div>
      <Cards apiData={data} />
    </div>
  );
}

export default Trending;

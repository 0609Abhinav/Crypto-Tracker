import React, { useState } from "react";
import { Outlet } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Top15 from "./components/Top15";
import Trending from "./components/Trending";
import Watchlist from "./components/Watchlist";
import Footer from "./components/footer"; // Import the Footer component

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Handle the search query and update state
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div>
      {/* Pass handleSearch function to Navbar */}
      <Navbar onSearch={handleSearch} />

      {/* Pass searchQuery to components to filter data */}
      <Outlet />
      <Footer />

      {/* Optionally, you could conditionally render these based on the route */}
      {/* Uncomment and adjust routing logic as necessary */}
      {/* 
      <Top15 searchQuery={searchQuery} />
      <Trending searchQuery={searchQuery} />
      <Watchlist searchQuery={searchQuery} />
      */}
    </div>
  );
};

export default App;

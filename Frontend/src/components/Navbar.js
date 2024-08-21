import React, { useState } from "react";
import { MdCurrencyBitcoin } from "react-icons/md";                  
import { MdHome, MdTrendingUp, MdStar, MdRemoveRedEye, MdMenu, MdClose } from 'react-icons/md';
import { Link } from "react-router-dom";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="border-b-2 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600">
      <nav className="flex flex-col md:flex-row items-center px-6 py-4">
        <div className="w-full flex justify-between items-center">
          <Link to={"/"}>
            <h1 className="text-[34px] md:text-[44px] font-extrabold text-white cursor-pointer flex items-center">
              Crypto 
              <MdCurrencyBitcoin className="text-yellow-400 text-[34px] md:text-[44px] mx-2 animate-pulse" />
              <span className="text-white">Tracker</span>
            </h1>
          </Link>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white text-[32px]"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <MdClose /> : <MdMenu />}
            </button>
          </div>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex justify-between items-center w-full mt-4 md:mt-0">
          <div className="flex gap-6 font-semibold text-[18px] md:text-[20px]">
            <Link to={"/"} className="flex items-center cursor-pointer text-white hover:text-yellow-400 transition duration-300 ease-in-out">
              <MdHome className="text-[24px] md:text-[26px] mr-2" /> Home
            </Link>
            <Link to={"/top15"} className="flex items-center cursor-pointer text-white hover:text-yellow-400 transition duration-300 ease-in-out">
              <MdStar className="text-[24px] md:text-[26px] mr-2" /> Top15
            </Link>
            <Link to={"/trending"} className="flex items-center cursor-pointer text-white hover:text-yellow-400 transition duration-300 ease-in-out">
              <MdTrendingUp className="text-[24px] md:text-[26px] mr-2" /> Trending
            </Link>
            <Link to={"/watchlist"} className="flex items-center cursor-pointer text-white hover:text-yellow-400 transition duration-300 ease-in-out">
              <MdRemoveRedEye className="text-[24px] md:text-[26px] mr-2" /> Watchlist
            </Link>
          </div>
          <div className="flex gap-4 ml-auto">
            <Link to={"/login"}>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition duration-300">
                Login
              </button>
            </Link>
            <Link to={"/signin"}>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition duration-300">
                Signin
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 bg-white bg-opacity-70 backdrop-blur-lg shadow-lg transition-transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} ease-in-out duration-500 z-50`}>
        <div className="flex flex-col items-center py-8 space-y-6">
          <Link to={"/"} onClick={() => setIsMenuOpen(false)} className="flex items-center text-[22px] font-semibold text-blue-900 cursor-pointer hover:text-yellow-400 transition duration-300 ease-in-out">
            <MdHome className="text-[28px] mr-3" /> Home
          </Link>
          <Link to={"/top15"} onClick={() => setIsMenuOpen(false)} className="flex items-center text-[22px] font-semibold text-blue-900 cursor-pointer hover:text-yellow-400 transition duration-300 ease-in-out">
            <MdStar className="text-[28px] mr-3" /> Top15
          </Link>
          <Link to={"/trending"} onClick={() => setIsMenuOpen(false)} className="flex items-center text-[22px] font-semibold text-blue-900 cursor-pointer hover:text-yellow-400 transition duration-300 ease-in-out">
            <MdTrendingUp className="text-[28px] mr-3" /> Trending
          </Link>
          <Link to={"/watchlist"} onClick={() => setIsMenuOpen(false)} className="flex items-center text-[22px] font-semibold text-blue-900 cursor-pointer hover:text-yellow-400 transition duration-300 ease-in-out">
            <MdRemoveRedEye className="text-[28px] mr-3" /> Watchlist
          </Link>

          <div className="flex gap-4">
            <Link to={"/login"}>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition duration-300">
                Login
              </button>
            </Link>
            <Link to={"/signin"}>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition duration-300">
                Signin
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;

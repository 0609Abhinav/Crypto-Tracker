import React, { useState } from "react";
import { MdCurrencyBitcoin, MdHome, MdTrendingUp, MdStar, MdRemoveRedEye, MdMenu, MdClose } from 'react-icons/md';
import { Link } from "react-router-dom";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="border-b-2 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600">
      <nav className="flex flex-col md:flex-row items-center px-4 md:px-6 py-4">
        <div className="w-full flex justify-between items-center">
          <Link to={"/"}>
            <h1 className="text-[24px] md:text-[34px] lg:text-[40px] font-extrabold text-white cursor-pointer flex items-center">
              Crypto 
              <MdCurrencyBitcoin className="text-yellow-400 text-[24px] md:text-[34px] lg:text-[40px] mx-2 animate-pulse" />
              <span className="text-white">Tracker</span>
            </h1>
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white text-[28px]"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <MdClose /> : <MdMenu />}
            </button>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex justify-between items-center w-full mt-4 md:mt-0">
          <div className="flex gap-6 font-semibold text-[14px] md:text-[18px] lg:text-[20px]">
            <Link to={"/"} className="flex items-center cursor-pointer text-white hover:text-yellow-400 transition duration-300 ease-in-out">
              <MdHome className="text-[20px] md:text-[24px] lg:text-[26px] mr-2" /> Home
            </Link>
            <Link to={"/top15"} className="flex items-center cursor-pointer text-white hover:text-yellow-400 transition duration-300 ease-in-out">
              <MdStar className="text-[20px] md:text-[24px] lg:text-[26px] mr-2" /> Top15
            </Link>
            <Link to={"/trending"} className="flex items-center cursor-pointer text-white hover:text-yellow-400 transition duration-300 ease-in-out">
              <MdTrendingUp className="text-[20px] md:text-[24px] lg:text-[26px] mr-2" /> Trending
            </Link>
            <Link to={"/watchlist"} className="flex items-center cursor-pointer text-white hover:text-yellow-400 transition duration-300 ease-in-out">
              <MdRemoveRedEye className="text-[20px] md:text-[24px] lg:text-[26px] mr-2" /> Watchlist
            </Link>
          </div>
          <div className="flex gap-4 ml-auto">
            <Link to={"/login"}>
              <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm lg:text-base px-3 md:px-4 py-1 md:py-2 rounded-lg shadow-lg transition duration-300">
                Login
              </button>
            </Link>
            <Link to={"/signin"}>
              <button className="bg-blue-500 hover:bg-blue-600 text-xs md:text-sm lg:text-base text-white px-3 md:px-4 py-1 md:py-2 rounded-lg shadow-lg transition duration-300">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 bg-blue-800 bg-opacity-90 backdrop-blur-lg shadow-lg transition-transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} ease-in-out duration-500 z-50`}>
        <div className="flex flex-col items-center py-8 space-y-6">
          <Link to={"/"} onClick={() => setIsMenuOpen(false)} className="flex items-center text-[18px] font-semibold text-white hover:text-yellow-400 transition duration-300 ease-in-out">
            <MdHome className="text-[24px] mr-3" /> Home
          </Link>
          <Link to={"/top15"} onClick={() => setIsMenuOpen(false)} className="flex items-center text-[18px] font-semibold text-white hover:text-yellow-400 transition duration-300 ease-in-out">
            <MdStar className="text-[24px] mr-3" /> Top15
          </Link>
          <Link to={"/trending"} onClick={() => setIsMenuOpen(false)} className="flex items-center text-[18px] font-semibold text-white hover:text-yellow-400 transition duration-300 ease-in-out">
            <MdTrendingUp className="text-[24px] mr-3" /> Trending
          </Link>
          <Link to={"/watchlist"} onClick={() => setIsMenuOpen(false)} className="flex items-center text-[18px] font-semibold text-white hover:text-yellow-400 transition duration-300 ease-in-out">
            <MdRemoveRedEye className="text-[24px] mr-3" /> Watchlist
          </Link>

          <div className="flex flex-col gap-4">
            <Link to={"/login"}onClick={() => setIsMenuOpen(false)}>
              <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm lg:text-base px-3 md:px-4 py-1 md:py-2 rounded-lg shadow-lg transition duration-300">
                Login
              </button>
            </Link>
            <Link to={"/signin"} onClick={() => setIsMenuOpen(false)}>
              <button className="bg-blue-500 hover:bg-blue-600 text-xs md:text-sm lg:text-base text-white px-3 md:px-4 py-1 md:py-2 rounded-lg shadow-lg transition duration-300">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;

import React from "react";
import { FaBitcoin, FaEthereum, FaChartLine, FaMobileAlt, FaShieldAlt } from "react-icons/fa";

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-5xl w-full mx-auto p-4">
        <section className="text-center py-24 bg-blue-600 text-white rounded-lg">
          <h1 className="text-5xl mb-8">Welcome to CryptoTrack</h1>
          <p className="text-xl mb-10">
            Track, analyze, and manage your digital assets with real-time data and powerful insights.
          </p>
          <a href="Trending">
            <button className="bg-orange-500 text-white py-3 px-6 rounded-md text-lg hover:bg-orange-600 transition">
              Start Tracking
            </button>
          </a>
        </section>

        <section id="features" className="py-12 bg-gray-200 rounded-lg mt-8">
          <h2 className="text-3xl mb-8 text-center">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg text-center shadow-md">
              <FaChartLine size={50} className="text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl mb-2">Real-Time Tracking</h3>
              <p className="text-gray-600">Get up-to-the-minute updates on your favorite cryptocurrencies.</p>
            </div>
            <div className="bg-white p-8 rounded-lg text-center shadow-md">
              <FaBitcoin size={50} className="text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl mb-2">Bitcoin Insights</h3>
              <p className="text-gray-600">In-depth analysis and historical data for Bitcoin.</p>
            </div>
            <div className="bg-white p-8 rounded-lg text-center shadow-md">
              <FaEthereum size={50} className="text-gray-800 mx-auto mb-4" />
              <h3 className="text-2xl mb-2">Ethereum Analytics</h3>
              <p className="text-gray-600">Track Ethereum's performance and trends.</p>
            </div>
            <div className="bg-white p-8 rounded-lg text-center shadow-md">
              <FaMobileAlt size={50} className="text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl mb-2">Mobile Friendly</h3>
              <p className="text-gray-600">Access your portfolio and track assets on the go.</p>
            </div>
            <div className="bg-white p-8 rounded-lg text-center shadow-md">
              <FaShieldAlt size={50} className="text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl mb-2">Secure Management</h3>
              <p className="text-gray-600">Your data and transactions are protected with top-level security.</p>
            </div>
          </div>
        </section>

        <section id="portfolio" className="py-12 text-center rounded-lg mt-8">
          <h2 className="text-3xl mb-8">Track Your Portfolio</h2>
          <p className="text-lg max-w-xl mx-auto text-gray-700">
            Monitor your investments and track the performance of your portfolio with detailed analytics and customizable reports.
          </p>
          {/* Add a portfolio tracking widget or visualization here */}
        </section>

        <section id="performance" className="py-12 bg-gray-200 text-center rounded-lg mt-8">
          <h2 className="text-3xl mb-8">Performance Insights</h2>
          <p className="text-lg max-w-xl mx-auto text-gray-700">
            Gain insights into market trends and make informed decisions with our advanced performance metrics.
          </p>
          {/* Add performance charts or visualizations here */}
        </section>
      </div>
    </div>
  );
}

export default HomePage;

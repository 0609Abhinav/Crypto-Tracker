import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
//import App from './App';
import Navbar from './components/Navbar';
import Home from "./pages/home";
import Top15 from "./pages/Top15";
import Trending from "./pages/Trending";
import Watchlist from "./pages/Watchlist";
import {createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import Footer from "./components/footer";
import ErrorElement from "./pages/ErrorElements";

import CoinByIdData from "./pages/CoinByIdData";
import { createContext } from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import SignIn from "./pages/SignIn";
import Login from "./pages/Login";



export const Name = createContext();

const AppLayout = () => {
    return (
      <div>
        <Provider store={store}>
       
        <Navbar />
        <Outlet />
        <Footer/>
       
        </Provider>
      </div>
    );
  };
  
  const browserRouter = createBrowserRouter([
    {
      element: <AppLayout />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/top15", element: < Top15/> },
        { path: "/watchlist", element: <Watchlist /> },
        { path: "/trending", element: <Trending /> },
        { path: "/coin/:id", element: <CoinByIdData /> },
        { path: "/signin", element: <SignIn /> },
        { path: "/login", element: <Login /> },
      ],
    
    errorElement: <ErrorElement />
    },
  ]);
  
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<RouterProvider router={browserRouter} />
  );
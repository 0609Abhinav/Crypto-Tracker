import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Cards from "../components/Cards";

const Watchlist = () => {
  const data = useSelector((store) => store.watchlistSlice);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading delay
      setLoading(false);
    };

    fetchData();
  }, []);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f3f4f6', // Tailwind's bg-gray-100
    },
    spinner: {
      border: '8px solid #f3f3f3',
      borderTop: '8px solid #3498db',
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      animation: 'spin 2s linear infinite',
    },
    messageText: {
      color: '#4a5568',
      fontSize: '1.25rem',
      textAlign: 'center',
    },
    heading: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#2d3748',
      textAlign: 'center',
      marginBottom: '1.5rem',
    },
    emptyStateContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f3f4f6',
    },
    addItemButton: {
      marginTop: '20px',
      padding: '10px 20px',
      fontSize: '1rem',
      color: '#fff',
      backgroundColor: '#3498db',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner}></div>
        <p style={styles.messageText}>Loading watchlist...</p>
      </div>
    );
  }

  return data.length === 0 ? (
    <div style={styles.emptyStateContainer}>
      <p style={styles.messageText}>
        Your watchlist is empty. Start adding items to your watchlist!
      </p>
      <button style={styles.addItemButton} onClick={() => navigate('/trending')}>
        Add Item
      </button>
    </div>
  ) : (
    <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <h1 style={styles.heading}>Your Watchlist</h1>
      <Cards apiData={data} />
    </div>
  );
};

export default Watchlist;

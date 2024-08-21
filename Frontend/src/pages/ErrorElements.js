import React from "react";

function ErrorPage() {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh", 
      backgroundColor: "#f8d7da", 
      color: "#721c24", 
      textAlign: "center",
      fontFamily: "'Arial', sans-serif"
    }}>
      <div style={{ 
        backgroundColor: "#f5c6cb", 
        borderRadius: "10px", 
        padding: "20px", 
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", 
        maxWidth: "600px", 
        width: "100%", 
        margin: "20px"
      }}>
        <h1 style={{ fontSize: "4rem", margin: "0" }}>Oops!</h1>
        <p style={{ fontSize: "1.5rem", margin: "10px 0 20px" }}>
          Something went wrong. We couldn’t find the page you’re looking for.
        </p>
        <img 
          src="https://via.placeholder.com/150?text=404" 
          alt="404 error" 
          style={{ width: "150px", marginBottom: "20px" }} 
        />
        <a 
          href="/" 
          style={{ 
            backgroundColor: "#721c24", 
            color: "#fff", 
            padding: "10px 20px", 
            borderRadius: "5px", 
            textDecoration: "none", 
            fontSize: "1rem", 
            cursor: "pointer",
            border: "none"
          }}>
          Go Back Home
        </a>
      </div>
    </div>
  );
}

export default ErrorPage;

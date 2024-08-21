// // src/components/Search.js
// import React, { useState } from "react";

// const Search = ({ onSearch }) => {
//   const [query, setQuery] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSearch(query);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="mb-4">
//       <input
//         type="text"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         placeholder="Search..."
//         className="p-2 border border-gray-300 rounded"
//       />
//       <button
//         type="submit"
//         className="ml-2 p-2 bg-blue-500 text-white rounded"
//       >
//         Search
//       </button>
//     </form>
//   );
// };

// export default Search;

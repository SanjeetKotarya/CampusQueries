import React, { useState } from "react";
import "../css/Quorabox.css";

function Quorabox({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState(""); // State to track the search query

  // Function to handle input change and perform real-time search
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query); // Notify the parent component (Feed) of the search query
  };

  return (
    <div className="quorabox">
      <div className="search-input">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="20"
          viewBox="0 -960 960 960"
          width="24"
        >
          <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search Quora"
          value={searchQuery}
          onChange={handleInputChange} // Handle input change
        />
      </div>
    </div>
  );
}

export default Quorabox;

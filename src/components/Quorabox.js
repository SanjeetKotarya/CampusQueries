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

  // Function to handle voice input
  const handleVoiceInput = async () => {
    try {
      const recognition = new window.webkitSpeechRecognition(); // Create a SpeechRecognition instance

      recognition.lang = "en-US"; // Set the language (you can change it based on your requirements)

      // Start recognition
      recognition.start();

      // Event listener for when speech recognition returns a result
      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setSearchQuery(result); // Set the search query with the recognized speech
        onSearch(result); // Notify the parent component (Feed) of the search query
      };

      // Event listener for errors
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
      };
    } catch (error) {
      console.error("Error initializing speech recognition", error);
    }
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
          placeholder="Search in feed"
          value={searchQuery}
          onChange={handleInputChange} // Handle input change
        />
        <i className="mic-button" onClick={handleVoiceInput}>
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="9"
              y="3"
              width="6"
              height="11"
              rx="3"
              stroke="#4413a7"
              stroke-width="2"
              stroke-linejoin="round"
            />
            <path
              d="M5 11C5 12.8565 5.7375 14.637 7.05025 15.9497C8.36301 17.2625 10.1435 18 12 18C13.8565 18 15.637 17.2625 16.9497 15.9497C18.2625 14.637 19 12.8565 19 11"
              stroke="#4413a7"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 21V19"
              stroke="#4413a7"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </i>
      </div>
    </div>
  );
}

export default Quorabox;

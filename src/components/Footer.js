import React from "react";
import "../css/Footer.css"; // Add your CSS file path if needed

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <span>
          <h2>CampusQueries<small>IITM</small></h2>
          
        </span>
        <p>
          Made with
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="like">
            <path d="M17.077 2C14.919 2 13.035 3.301 12 5c-1.035-1.699-2.919-3-5.077-3C3.651 2 1 4.611 1 7.833c0 1.612.644 3.088 1.692 4.167C5.074 14.449 12 22 12 22s6.926-7.551 9.308-10A5.973 5.973 0 0 0 23 7.833C23 4.611 20.349 2 17.077 2z"></path>
          </svg>
          by<a href="https://webopsiitm.in/">InstiWebOps</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;

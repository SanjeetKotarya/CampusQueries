import React from "react";
import "../css/Quora.css";
import Navbar from "./Navbar";
import Feed from "./Feed";



function Quora() {


  return (
    <div className="quora">
      <fluid />
      <Navbar/>
      <div className="quora-contents">
        <div className="quora-content">
          <Feed />
        </div>
      </div>
    </div>
  );
}

export default Quora;

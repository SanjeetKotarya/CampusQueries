import React from "react";
import "../css/Quora.css";
import Navbar from "./Navbar";
import Feed from "./Feed";
import Footer from "./Footer";

function Quora() {


  return (
    <div className="quora">
      
      <Navbar/>
      <div className="quora-contents">
        <div className="quora-content">
          <Feed />
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default Quora;

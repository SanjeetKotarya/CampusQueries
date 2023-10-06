import React from "react";
import "../css/Quora.css";
import Navbar from "./Navbar";
import Feed from "./Feed";
import SidebarL from "./SidebarL";
import SidebarR from "./SidebarR";



function Quora() {


  return (
    <div className="quora">
      <fluid />
      <Navbar/>
      <div className="quora-contents">
        <div className="quora-content">
          <SidebarL/>
          <Feed />
          <SidebarR/>
        </div>
      </div>
    </div>
  );
}

export default Quora;

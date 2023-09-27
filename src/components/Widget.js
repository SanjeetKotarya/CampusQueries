import React from "react";
import "../css/Widget.css";

function Widget() {
  return (
    <div className="widgets">
      <h6>Spaces to follow</h6>

        <div className="widget">
          <a href="#">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Coronavirus._SARS-CoV-2.png"/>
          <span>
          <h5>Mobile App programmer</h5>
          <p>The best mobile app development company.</p>
            </span>
          </a>
        </div>
        <div className="widget">
          <a href="#">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Coronavirus._SARS-CoV-2.png"/>
          <span>
          <h5>Mobile App programmer</h5>
          <p>The best mobile app development company.</p>
            </span>
          </a>
        </div>
        <div className="widget">
          <a href="#">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Coronavirus._SARS-CoV-2.png"/>
          <span>
          <h5>Mobile App programmer</h5>
          <p>The best mobile app development company.</p>
            </span>
          </a>
        </div>
    </div>
  );
}

export default Widget;

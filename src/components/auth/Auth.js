import React from "react";
import "./Auth.css";
import { signInWithPopup, signInAnonymously  } from "firebase/auth";
import { auth, provider } from "../../firebase";

function Auth() {

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };


  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Anonymous Sign-In Error:", error);
    }
  };


  return (
    <div className="login">
      <div className="login__container">
        <div className="login__logo">
          <h1>CampusQueries</h1>
          <h6>IITM</h6>
        </div>
        <div className="login__desc">
          <p>A Place to Share knowledge and better understand the world</p>
        </div>
        <div className="login__auth">
          <div className="login__authOptions">
            <div className="login__authOption">
              <img
                className="login__googleAuth"
                src="https://media-public.canva.com/MADnBiAubGA/3/screen.svg"
                alt=""
              />
              <p onClick={handleGoogleSignIn}>Login With Google</p>
            </div>
            <div className="login__authOption">
              <img
                className="login__googleAuth"
                src="https://cdn-icons-png.flaticon.com/512/634/634741.png"
                alt=""
              />
              <p onClick={handleAnonymousSignIn}>Login as Nobody</p>
            </div>

            <div className="login__authDesc">
              <p>
                <span style={{ color: "blue", cursor: "pointer" }}>
                  Sign Up With Email
                </span>
                . By continuing you indicate that you have read and agree to
                Quora's
                <span style={{ color: "blue", cursor: "pointer" }}>
                  Terms of Service{" "}
                </span>
                and{" "}
                <span style={{ color: "blue", cursor: "pointer" }}>
                  Privacy Policy
                </span>
                .
              </p>
            </div>
          </div>

        </div>

        <div className="login__footer">
          <p>About</p>
          <p>Privacy</p>
          <p>Contact</p>
          <p>&copy; QuoraIITM Inc. 2023</p>
        </div>
      </div>
    </div>
  );
}

export default Auth;

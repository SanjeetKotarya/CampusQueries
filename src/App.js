import React, { useEffect } from "react";
import "./App.css";
import Quora from "./components/Quora";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "./features/userSlice";
import Auth from "./components/auth/Auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { login } from "./features/userSlice";

function App() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        dispatch(
          login({
            userName: authUser.displayName,
            photo: authUser.photoURL,
            email: authUser.email,
            uid: authUser.uid,
          })
        );
        console.log("AuthUser", authUser);
      }
    });
  }, [dispatch]);

  return <div className="App">{user ? <Quora /> : <Auth />}</div>;

}

export default App;

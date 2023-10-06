import "../css/SidebarR.css";
import React, { useState, useRef, useEffect } from "react";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { signOut } from "firebase/auth";
import { auth, storage } from "../firebase";
import db from "../firebase";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "../features/userSlice";
import { collection, addDoc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

function SidebarR() {
  return (
    <div className='sidebarR'>SidebarR</div>
  )
}

export default SidebarR
import React, { useState, useRef, useEffect } from "react";
import "../css/Navbar.css";
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

function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutText, setShowLogoutText] = useState(false); // Add this state
  const [image, setImage] = useState(null);
  const avatarRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        // Click occurred outside the avatar
        setShowLogoutText(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      // Clean up the event listener on component unmount
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleCancel = () => {
    setInput("");
    setInputUrl("");
    setImage(null);
  };

  const Close = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
    >
      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </svg>
  );
  const [input, setInput] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const handleLogout = () => {
    if (window.confirm("Do you want to logout ?")) {
      signOut(auth).then(() => {
        dispatch(logout());
      });
    }
  };

  const handleImageLoad = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (image) {
      try {
        const storageRef = ref(
          storage,
          `images/${user.uid}/${Date.now()}_${image.name}`
        );
        await uploadString(storageRef, image, "data_url");
        const imageUrl = await getDownloadURL(storageRef);
        setInputUrl(imageUrl);
      } catch (error) {
        console.error("Error uploading image: ", error);
      }
    }
  };

  const handleQuestion = async (e) => {
    e.preventDefault();
    setIsModalOpen(false);

    try {
      const docRef = await addDoc(collection(db, "questions"), {
        question: input,
        imageUrl: inputUrl,
        user: user,
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: [],
      });

      console.log("Document written with ID: ", docRef.id);

      setInput("");
      setInputUrl("");
      setImage(null);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="Navbar">
      <div className="nav-content">
        <div className="logo">
          <a href="#">¿CampusQueries?</a>
        </div>

        <div className="user">
          <div
            className="avatar"
            onClick={() => setShowLogoutText((prevState) => !prevState)}
            ref={avatarRef}
          >
            <img src={user?.photo} />
            {showLogoutText && (
              <div className="logout-text" onClick={handleLogout}>
                Logout
              </div>
            )}
          </div>

          <button onClick={() => setIsModalOpen(true)}>Ask Question</button>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        closeIcon={Close}
        onClose={() => setIsModalOpen(false)}
        style={{
          overlay: { height: "auto" },
        }}
        center
        closeOnOverlayClick
        closeOnEsc
      >
        <div className="modal_title">
          <h5>Add Question</h5>
          <h5>Share Link</h5>
        </div>
        <div className="modal_info">
          <div className="avatar">
            <img src={user?.photo} />
          </div>
          <div className="modal_scop">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.25 3.10999C16.803 3.10999 15.63 4.283 15.63 5.72999C15.63 7.17697 16.803 8.34999 18.25 8.34999C19.697 8.34999 20.87 7.17697 20.87 5.72999C20.87 4.283 19.697 3.10999 18.25 3.10999Z"
                fill="#666666"
                class="icon_svg-fill_as_stroke"
              ></path>
              <path
                d="M12 4.10999C10.553 4.10999 9.38 5.283 9.38 6.72999C9.38 8.17697 10.553 9.34999 12 9.34999C13.447 9.34999 14.62 8.17697 14.62 6.72999C14.62 5.283 13.447 4.10999 12 4.10999Z"
                fill="#666666"
                class="icon_svg-fill_as_stroke"
              ></path>
              <path
                d="M5.75 3.10999C4.30302 3.10999 3.13 4.283 3.13 5.72999C3.13 7.17697 4.30302 8.34999 5.75 8.34999C7.19699 8.34999 8.37 7.17697 8.37 5.72999C8.37 4.283 7.19699 3.10999 5.75 3.10999Z"
                fill="#666666"
                class="icon_svg-fill_as_stroke"
              ></path>
              <path
                d="M17.7 9.25C16.75 9.25 15.98 9.52 15.37 9.92C16.74 10.91 17.55 12.44 17.55 13.91V21C17.55 21.26 17.5 21.51 17.41 21.75H21C21.41 21.75 21.75 21.41 21.75 21V12.81C21.75 11.32 20.34 9.25 17.7 9.25Z"
                fill="#666666"
                class="icon_svg-fill_as_stroke"
              ></path>
              <path
                d="M6.45 21V13.91C6.45 12.44 7.26 10.9 8.63 9.92C7.97 9.49 7.17 9.25 6.3 9.25C3.66 9.25 2.25 11.32 2.25 12.81V21C2.25 21.41 2.59 21.75 3 21.75H6.59C6.5 21.51 6.45 21.26 6.45 21Z"
                fill="#666666"
                class="icon_svg-fill_as_stroke"
              ></path>
              <path
                d="M15.3 21.75H8.7C8.29 21.75 7.95 21.41 7.95 21V13.91C7.95 12.42 9.36 10.35 12 10.35C14.64 10.35 16.05 12.42 16.05 13.91V21C16.05 21.41 15.71 21.75 15.3 21.75Z"
                fill="#666666"
                class="icon_svg-fill_as_stroke"
              ></path>
            </svg>
            <p>Public</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 -960 960 960"
              width="24"
            >
              <path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z" />
            </svg>
          </div>
        </div>

        <div className="modal_field">
          <textarea
            required
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Start your question with 'What', 'How', 'Why', etc."
          ></textarea>
          <div className="uploading">
            <label htmlFor="fileInput" className="custom-file-input-label">
              Upload
            </label>
            <input
              type="file"
              accept="image/*"
              id="fileInput"
              onChange={handleImageLoad}
              style={{ display: "none" }}
            />
            <button className="confirm" onClick={handleImageUpload}>
              Confirm
            </button>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Image Link"
            ></input>
          </div>

          <span className="imgbox">
            {inputUrl && <img src={inputUrl} alt="displayimg" />}
          </span>
        </div>

        <div className="modal_buttons">
          <button className="cancel" onClick={handleCancel}>
            Clear
          </button>
          <button onClick={handleQuestion} className="add" type="submit">
            Add question
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Navbar;

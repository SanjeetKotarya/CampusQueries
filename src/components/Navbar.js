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
    setImage(null); // Clear the selected image
    setIsImageUploaded(false); // Reset the image upload state
    setSelectedImageName(""); // Reset the selected image name
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

        likedBy: [],
        about: "",
      });

      console.log("Document written with ID: ", docRef.id);

      setInput("");
      setInputUrl("");
      setImage(null);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const [isImageUploaded, setIsImageUploaded] = useState(false); // Add this state
  const [selectedImageName, setSelectedImageName] = useState("");

  const handleImageLoad = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setIsImageUploaded(true);

        // Set the selected image name in the state
        setSelectedImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileInputRef = useRef(null);

  const handleImageIconClick = () => {
    // Trigger the file input when the icon is clicked
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    handleImageUpload();
  };

  const [selectedOption, setSelectedOption] = useState("option1");

  // Function to handle changes in the dropdown selection
  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div className="Navbar">
      <div className="nav-content">
        <div className="logo">
          <a href="#">
            <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiCawuZtk_jt6mwbXHjlOKzicBXwSqpK1aB1GZnvzdE1CWsy0YpfvgpLmQrGuXHGCZDAQ6tYwTYGmVVQl7yQ7K4rO87J3Lu_63ezv7NcGZ7W_ea_jiObb9heVMaVsdfxl0T89mQaZ7WO4dJ5dbvimaljPuRe_VhoFXSw5qPnfxdq8QEfRiO6q1xg907_r4/s1600/png.png"/>
          </a>
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
          <h4>Add Question</h4>
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
            <select
              id="dropdown"
              value={selectedOption}
              onChange={handleDropdownChange}
            >
              <option value="option1">Public</option>
            </select>
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
            <span onClick={handleImageIconClick}>
              <svg
                width="30px"
                height="30px"
                viewBox="0 0 1024 1024"
                class="icon"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M853.333333 874.666667H170.666667c-46.933333 0-85.333333-38.4-85.333334-85.333334V234.666667c0-46.933333 38.4-85.333333 85.333334-85.333334h682.666666c46.933333 0 85.333333 38.4 85.333334 85.333334v554.666666c0 46.933333-38.4 85.333333-85.333334 85.333334z"
                  fill="#8CBCD6"
                />
                <path
                  d="M746.666667 341.333333m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z"
                  fill="#B3DDF5"
                />
                <path
                  d="M426.666667 341.333333L192 682.666667h469.333333z"
                  fill="#9AC9E3"
                />
                <path
                  d="M661.333333 469.333333l-170.666666 213.333334h341.333333z"
                  fill="#B3DDF5"
                />
                <path
                  d="M810.666667 810.666667m-213.333334 0a213.333333 213.333333 0 1 0 426.666667 0 213.333333 213.333333 0 1 0-426.666667 0Z"
                  fill="#43A047"
                />
                <path
                  d="M768 682.666667h85.333333v256h-85.333333z"
                  fill="#FFFFFF"
                />
                <path
                  d="M682.666667 768h256v85.333333H682.666667z"
                  fill="#FFFFFF"
                />
              </svg>
            </span>

            <input
              type="file"
              accept="image/*"
              id="fileInput"
              onChange={handleImageLoad}
              style={{ display: "none" }}
              ref={fileInputRef} // Connect the ref to the file input
            />
            {selectedImageName && (
              <p className="selected-image-name">{selectedImageName}</p>
            )}
            <button className="confirm" onClick={handleImageUpload}>
              Confirm
            </button>
          </div>
          <div className="uploading">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
            >
              <path d="M16.949 7.051c.39.389.391 1.022.001 1.413l-8.485 8.486c-.392.391-1.023.391-1.414 0-.39-.39-.39-1.021.001-1.412l8.485-8.488c.39-.39 1.024-.387 1.412.001zm-5.805 10.043c-.164.754-.541 1.486-1.146 2.088l-1.66 1.66c-1.555 1.559-3.986 1.663-5.413.235-1.429-1.428-1.323-3.857.234-5.413l1.661-1.663c.603-.601 1.334-.98 2.087-1.144l1.934-1.934c-1.817-.306-3.829.295-5.313 1.783l-1.662 1.661c-2.342 2.34-2.5 5.978-.354 8.123 2.145 2.146 5.783 1.985 8.123-.354l1.66-1.66c1.486-1.487 2.089-3.496 1.783-5.314l-1.934 1.932zm3.222-15.231l-1.66 1.66c-1.486 1.488-2.089 3.499-1.783 5.317l1.935-1.935c.162-.753.54-1.485 1.146-2.087l1.66-1.66c1.556-1.559 3.984-1.663 5.413-.234 1.429 1.427 1.324 3.857-.233 5.415l-1.66 1.66c-.602.603-1.334.981-2.089 1.145l-1.934 1.934c1.818.306 3.827-.295 5.317-1.783l1.658-1.662c2.34-2.339 2.498-5.976.354-8.121-2.145-2.146-5.78-1.987-8.124.351z" />
            </svg>
            <input
              className="img-link"
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste image link here"
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

import React, { useEffect, useState } from "react";
import "../css/Post.css";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import "react-quill/dist/quill.snow.css";
import { useDispatch, useSelector } from "react-redux";
import { selectQuestionId, setQuestionInfo } from "../features/questionSlice";
import { selectUser } from "../features/userSlice";
import { deleteDocs } from "firebase/firestore";
import db from "../firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";

function Post({ id, question, image, time, quoraUser, searchQuery, about }) {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false); // New state for user avatar modal
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [answersCount, setAnswersCount] = useState(0);
  const [isWebShareSupported, setIsWebShareSupported] = useState(false);
  const user = useSelector(selectUser);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const dispatch = useDispatch();
  const questionId = useSelector(selectQuestionId);
  const [answer, setAnswer] = useState("");
  const [getAnswer, setgetAnswer] = useState([]);

  useEffect(() => {
    const fetchAnswer = async () => {
      try {
        const quesSnapshot = doc(collection(db, "questions"), id);
        const ansCollection = collection(quesSnapshot, "answer");

        // Set up a real-time listener for answers
        const unsubscribe = onSnapshot(ansCollection, (snapshot) => {
          const postAnswer = snapshot.docs.map((doc) => ({
            id: doc.id,
            answers: doc.data(),
          }));

          // Sort the answers by timestamp in descending order
          postAnswer.sort((a, b) => b.answers.timestamp - a.answers.timestamp);

          setgetAnswer(postAnswer);
          setAnswersCount(postAnswer.length);
          console.log("Answers", postAnswer);
        });

        return () => {
          // Unsubscribe the listener when the component unmounts
          unsubscribe();
        };
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    fetchAnswer();
  }, []);

  const handleAnswer = async (e) => {
    e.preventDefault();
    setIsModalOpen(false);

    try {
      const questionRef = doc(collection(db, "questions"), id); // Correct usage of doc
      const docAns = await addDoc(collection(questionRef, "answer"), {
        answer: answer,
        questionId: questionId,
        user: user,
        timestamp: serverTimestamp(),
      });

      console.log("Document written with ID: ", docAns.id);

      setAnswer("");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Share this post",
        text: question,
        url: window.location.href,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  useEffect(() => {
    // Check if Web Share API is supported
    if (navigator.share) {
      setIsWebShareSupported(true);
    }
  }, []);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const questionRef = doc(collection(db, "questions"), id);
        const docSnapshot = await getDoc(questionRef);
        const { likedBy } = docSnapshot.data();
        // Set the initial likes count
        setLikesCount(likedBy ? likedBy.length : 0);
        // Check if the current user has already liked the post
        setIsLiked(likedBy && likedBy.includes(user.uid));
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };

    fetchLikes();
  }, [id, user.uid]);

  const handleLike = async () => {
    try {
      const questionRef = doc(collection(db, "questions"), id);
      const docSnapshot = await getDoc(questionRef);
      const { likedBy } = docSnapshot.data();

      if (!likedBy || !likedBy.includes(user.uid)) {
        // User has not liked, so add the like
        await updateDoc(questionRef, {
          likedBy: likedBy ? [...likedBy, user.uid] : [user.uid],
        });
        setLikesCount(likedBy ? likedBy.length + 1 : 1);
        setIsLiked(true);
      } else {
        // User has already liked, so remove the like
        const updatedLikedBy = likedBy.filter((userId) => userId !== user.uid);
        await updateDoc(questionRef, {
          likedBy: updatedLikedBy,
        });
        setLikesCount(updatedLikedBy.length);
        setIsLiked(false);
      }
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const handleDelete = () => {
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Check if the current user is either the owner of the post or the owner of the website
      if (
        user.uid === quoraUser.uid ||
        user.uid === "5jc43zPph5N5ao8zVS7LY7Gc0zz1"
      ) {
        // Directly proceed to delete the post and its associated answers from the database
        const questionRef = doc(collection(db, "questions"), id);

        // Get a reference to the "answers" collection inside the question
        const answersCollectionRef = collection(questionRef, "answer");

        // Delete all documents inside the "answers" collection
        const answersSnapshot = await getDocs(answersCollectionRef);
        const answerDeletionPromises = answersSnapshot.docs.map(
          async (answerDoc) => {
            await deleteDoc(doc(answersCollectionRef, answerDoc.id));
          }
        );
        await Promise.all(answerDeletionPromises);

        // Finally, delete the question document
        await deleteDoc(questionRef);

        // Close the confirmation modal
        setIsConfirmationModalOpen(false);
      } else {
        console.error("You are not authorized to delete this post.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };
  const handleDeleteAnswer = async (answerId) => {
    try {
      // Get a reference to the answer document
      const answerRef = doc(
        collection(db, "questions", id, "answer"),
        answerId
      );

      // Delete the answer document
      await deleteDoc(answerRef);
    } catch (error) {
      console.error("Error deleting answer:", error);
    }
  };

  const [aboutme, setAbout] = useState(quoraUser?.about || "");
  const [aboutContent, setAboutContent] = useState(quoraUser?.about || "");
  const canEdit = user.uid === quoraUser.uid;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRef = doc(collection(db, "questions"), id);
        const userSnapshot = await getDoc(userRef);
        const userData = userSnapshot.data();

        if (userData) {
          // Update the about state
          setAbout(userData.about || "");
        } else {
          // Handle the case where user data is not found
          console.log("User data not found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [id]); // Make sure to include any dependencies needed
  useEffect(() => {
    setAbout(aboutContent);
  }, [aboutContent]);



  const handleSaveAbout = async () => {
    try {
      console.log("About Content Before Update:", aboutContent);

      const userRef = doc(collection(db, "questions"), id);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();

      if (userData) {
        // Check if the about field is empty
        if (!userData.about || userData.about !== aboutContent) {
          // If empty or different, update it with the new content
          await updateDoc(userRef, {
            about: aboutContent,
          });

          // Log or handle success
          console.log("About field updated successfully!");
        } else {
          // Log or handle the case where about is not empty and unchanged
          console.log("About field is not empty and unchanged.");
        }
      } else {
        // Log or handle the case where user data is not found
        console.log("User data not found.");
      }
    } catch (error) {
      console.error("Error updating about field:", error);
    }
    setIsEditing(false); 
  };

  const [isEditing, setIsEditing] = useState(false);
  const [originalAboutContent, setOriginalAboutContent] = useState('');
  // ... your other state variables and functions

  const handleEditClick = () => {
    setIsEditing(true);
    setOriginalAboutContent(aboutContent); // Save the original content
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setAboutContent(originalAboutContent); // Revert to the original content
  };

  return (
    <div
      className="post"
      onClick={() =>
        dispatch(
          setQuestionInfo({
            questionId: id,
            questionName: question,
          })
        )
      }
    >
      <div className="post_info">
        <div className="avatar" onClick={() => setIsUserModalOpen(true)}>
          <img src={quoraUser?.photo} />
        </div>
        <span>
          <h4>{quoraUser?.userName}</h4>
          <p>{quoraUser?.email}</p>
        </span>
        <small>
          {time
            ? formatDistanceToNow(time.toDate(), { addSuffix: true })
            : "Just now"}
        </small>
      </div>
      <div className="post_body">
        <p>{question}</p>
        {image && (
          <div className="post-imgbox">
            <img src={image} alt="Image" />
          </div>
        )}
      </div>
      <div className="post_footer">
        <div className="actions">
          <a className="like" onClick={handleLike}>
            {isLiked ? (
              // Liked icon
              <svg
                width="800px"
                height="800px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z"
                  fill="#4d16be"
                />
              </svg>
            ) : (
              // Not liked icon
              <svg
                width="800px"
                height="800px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.96173 18.9109L9.42605 18.3219L8.96173 18.9109ZM12 5.50063L11.4596 6.02073C11.601 6.16763 11.7961 6.25063 12 6.25063C12.2039 6.25063 12.399 6.16763 12.5404 6.02073L12 5.50063ZM15.0383 18.9109L15.5026 19.4999L15.0383 18.9109ZM9.42605 18.3219C7.91039 17.1271 6.25307 15.9603 4.93829 14.4798C3.64922 13.0282 2.75 11.3345 2.75 9.1371H1.25C1.25 11.8026 2.3605 13.8361 3.81672 15.4758C5.24723 17.0866 7.07077 18.3752 8.49742 19.4999L9.42605 18.3219ZM2.75 9.1371C2.75 6.98623 3.96537 5.18252 5.62436 4.42419C7.23607 3.68748 9.40166 3.88258 11.4596 6.02073L12.5404 4.98053C10.0985 2.44352 7.26409 2.02539 5.00076 3.05996C2.78471 4.07292 1.25 6.42503 1.25 9.1371H2.75ZM8.49742 19.4999C9.00965 19.9037 9.55954 20.3343 10.1168 20.6599C10.6739 20.9854 11.3096 21.25 12 21.25V19.75C11.6904 19.75 11.3261 19.6293 10.8736 19.3648C10.4213 19.1005 9.95208 18.7366 9.42605 18.3219L8.49742 19.4999ZM15.5026 19.4999C16.9292 18.3752 18.7528 17.0866 20.1833 15.4758C21.6395 13.8361 22.75 11.8026 22.75 9.1371H21.25C21.25 11.3345 20.3508 13.0282 19.0617 14.4798C17.7469 15.9603 16.0896 17.1271 14.574 18.3219L15.5026 19.4999ZM22.75 9.1371C22.75 6.42503 21.2153 4.07292 18.9992 3.05996C16.7359 2.02539 13.9015 2.44352 11.4596 4.98053L12.5404 6.02073C14.5983 3.88258 16.7639 3.68748 18.3756 4.42419C20.0346 5.18252 21.25 6.98623 21.25 9.1371H22.75ZM14.574 18.3219C14.0479 18.7366 13.5787 19.1005 13.1264 19.3648C12.6739 19.6293 12.3096 19.75 12 19.75V21.25C12.6904 21.25 13.3261 20.9854 13.8832 20.6599C14.4405 20.3343 14.9903 19.9037 15.5026 19.4999L14.574 18.3219Z"
                  fill="#231F20"
                />
              </svg>
            )}
            <small>{likesCount}</small>
          </a>

          <a
            className="show_answer"
            onClick={() => setShowAnswers(!showAnswers)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              id="comment"
            >
              <path
                fill="#231F20"
                d="M25.784 21.017A10.992 10.992 0 0 0 27 16c0-6.065-4.935-11-11-11S5 9.935 5 16s4.935 11 11 11c1.742 0 3.468-.419 5.018-1.215l4.74 1.185a.996.996 0 0 0 .949-.263 1 1 0 0 0 .263-.95l-1.186-4.74zm-2.033.11.874 3.498-3.498-.875a1.006 1.006 0 0 0-.731.098A8.99 8.99 0 0 1 16 25c-4.963 0-9-4.038-9-9s4.037-9 9-9 9 4.038 9 9a8.997 8.997 0 0 1-1.151 4.395.995.995 0 0 0-.098.732z"
              ></path>
            </svg>
            <small>{answersCount}</small>
          </a>
          <a onClick={() => setIsModalOpen(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              id="add"
            >
              <path
                fill="#4d16be"
                d="M17 11h-4V7a1 1 0 0 0-2 0v4H7a1 1 0 0 0 0 2h4v4a1 1 0 0 0 2 0v-4h4a1 1 0 0 0 0-2Z"
              ></path>
              <path
                fill="#b2b1ff"
                d="M21 2H3a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Zm-4 11h-4v4a1 1 0 0 1-2 0v-4H7a1 1 0 0 1 0-2h4V7a1 1 0 0 1 2 0v4h4a1 1 0 0 1 0 2Z"
              ></path>
            </svg>
          </a>
        </div>

        <div className="more">
          {(user.uid === quoraUser.uid ||
            user.uid === "5jc43zPph5N5ao8zVS7LY7Gc0zz1") && (
            <a onClick={handleDelete} className="del-for">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 -960 960 960"
                width="24"
              >
                <path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z" />
              </svg>
            </a>
          )}
          <a className="share" onClick={handleShare}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 -960 960 960"
              width="24"
            >
              <path d="M720-80q-50 0-85-35t-35-85q0-7 1-14.5t3-13.5L322-392q-17 15-38 23.5t-44 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q23 0 44 8.5t38 23.5l282-164q-2-6-3-13.5t-1-14.5q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-23 0-44-8.5T638-672L356-508q2 6 3 13.5t1 14.5q0 7-1 14.5t-3 13.5l282 164q17-15 38-23.5t44-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-640q17 0 28.5-11.5T760-760q0-17-11.5-28.5T720-800q-17 0-28.5 11.5T680-760q0 17 11.5 28.5T720-720ZM240-440q17 0 28.5-11.5T280-480q0-17-11.5-28.5T240-520q-17 0-28.5 11.5T200-480q0 17 11.5 28.5T240-440Zm480 280q17 0 28.5-11.5T760-200q0-17-11.5-28.5T720-240q-17 0-28.5 11.5T680-200q0 17 11.5 28.5T720-160Zm0-600ZM240-480Zm480 280Z" />
            </svg>
          </a>
        </div>
      </div>
      {showAnswers && (
        <div className="answers">
          <div className="answers_container">
            {getAnswer
              .filter((answer) => answer.answers.questionId === id)
              .map(({ id, answers }) => (
                <div key={id} className="answered">
                  <div className="answer_info">
                    <div className="avatar">
                      {answers.user && answers.user.photo && (
                        <img src={answers.user.photo} />
                      )}
                    </div>
                    <span>
                      <h4>{answers.user?.userName}</h4>
                      <p>
                        {answers.timestamp
                          ? formatDistanceToNow(answers.timestamp.toDate(), {
                              addSuffix: true,
                            })
                          : "Just now"}
                      </p>
                    </span>
                    {(user.uid === answers.user.uid ||
                      user.uid === "5jc43zPph5N5ao8zVS7LY7Gc0zz1") && (
                      <p
                        className="ansdel"
                        onClick={() => handleDeleteAnswer(id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 32 32"
                          id="delete"
                        >
                          <path d="M24.2,12.193,23.8,24.3a3.988,3.988,0,0,1-4,3.857H12.2a3.988,3.988,0,0,1-4-3.853L7.8,12.193a1,1,0,0,1,2-.066l.4,12.11a2,2,0,0,0,2,1.923h7.6a2,2,0,0,0,2-1.927l.4-12.106a1,1,0,0,1,2,.066Zm1.323-4.029a1,1,0,0,1-1,1H7.478a1,1,0,0,1,0-2h3.1a1.276,1.276,0,0,0,1.273-1.148,2.991,2.991,0,0,1,2.984-2.694h2.33a2.991,2.991,0,0,1,2.984,2.694,1.276,1.276,0,0,0,1.273,1.148h3.1A1,1,0,0,1,25.522,8.164Zm-11.936-1h4.828a3.3,3.3,0,0,1-.255-.944,1,1,0,0,0-.994-.9h-2.33a1,1,0,0,0-.994.9A3.3,3.3,0,0,1,13.586,7.164Zm1.007,15.151V13.8a1,1,0,0,0-2,0v8.519a1,1,0,0,0,2,0Zm4.814,0V13.8a1,1,0,0,0-2,0v8.519a1,1,0,0,0,2,0Z"></path>
                        </svg>
                      </p>
                    )}
                  </div>
                  <div className="answer_body">
                    <p>{answers.answer}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

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
        <div className="modal_question">
          <h1>{question}</h1>
          <p>Asked by</p>
          <div className="post_info">
            <div className="avatar">
              {quoraUser && quoraUser.photo && <img src={quoraUser.photo} />}
            </div>
            <span>
              <h4>{quoraUser?.userName}</h4>
              <p>{quoraUser?.email}</p>
            </span>
            <small>{time?.toDate().toLocaleDateString()}</small>
          </div>
        </div>
        <div className="modal_answer">
          <textarea
            required
            type="text"
            placeholder="Write you answer here."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          ></textarea>
        </div>
        <div className="modal_buttons">
          <button
            className="cancel"
            onClick={() => {
              setAnswer(""); // Clear the textarea
              setIsModalOpen(false); // Close the modal
            }}
          >
            Cancel
          </button>
          <button className="add" type="submit" onClick={handleAnswer}>
            Add Answer
          </button>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        open={isConfirmationModalOpen}
        closeIcon={Close}
        onClose={() => setIsConfirmationModalOpen(false)}
        contentLabel="Confirm Deletion"
        center
        closeOnOverlayClick
        closeOnEsc
      >
        <div className="delconfirm">
          <h2>Do you want to delete this post?</h2>
          <p>You cannot undo this action.</p>
          <div className="conbuttons">
            <button style={{ color: "red" }} onClick={handleConfirmDelete}>
              Delete
            </button>
            <button
              style={{ color: "blue" }}
              onClick={() => setIsConfirmationModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* User Avatar Modal */}
      <Modal
      open={isUserModalOpen}
      closeIcon={Close}
      onClose={() => {
        setIsUserModalOpen(false);
        setIsEditing(false); // Reset the editing state when the modal is closed
      }}
      center
      closeOnOverlayClick
      closeOnEsc
    >
      <div className="userModalContent">
        <span>
          <img src={quoraUser?.photo} alt="User Avatar" />
        </span>
        <span>
          <h4>{quoraUser?.userName}</h4>
          <small>{quoraUser?.email}</small><br/>
          <small>About :</small><br/>
          <small className="abouttxt">{aboutme || "Nothing here"}</small><br />
          {canEdit && (
            <React.Fragment>
              {isEditing ? (
                <React.Fragment>
                  
                  <textarea
                    placeholder="Write about yourself"
                    value={aboutContent}
                    onChange={(e) => setAboutContent(e.target.value)}
                  />
                  {/* Save and Cancel buttons */}
                  <br />
                  <button className="save" onClick={handleSaveAbout}>Save</button>
                  <button className="cancel" onClick={handleCancelClick}>Cancel</button>
                </React.Fragment>
              ) : (
                <button className="editbtn" onClick={handleEditClick}>Edit</button>
              )}
            </React.Fragment>
          )}
        </span>
      </div>
    </Modal>

      {/* ... (rest of the component) */}
    </div>
  );
}

export default Post;

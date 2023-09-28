import React, { useEffect, useState } from "react";
import "../css/Post.css";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import "react-quill/dist/quill.snow.css";
import { useDispatch, useSelector } from "react-redux";
import { selectQuestionId, setQuestionInfo } from "../features/questionSlice";
import { selectUser } from "../features/userSlice";
import db from "../firebase";
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";

function Post({ id, question, image, time, quoraUser, searchQuery }) {
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
        <div className="avatar">
          <img src={quoraUser?.photo} />
        </div>
        <span>
          <h4>{quoraUser?.userName}</h4>
          <p>{quoraUser?.email}</p>
        </span>
        <small>{time?.toDate().toLocaleDateString()}</small>
      </div>
      <div className="post_body">
        <p>{question}</p>
        {image && (
          <div className="imgbox">
            <img src={image} alt="Image" />
          </div>
        )}
      </div>
      <div className="post_footer">
        <div className="actions">
          <a className="like" onClick={handleLike}>
            {isLiked ? (
              // Liked icon
<svg className="red-heart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="like"><path d="M17.077 2C14.919 2 13.035 3.301 12 5c-1.035-1.699-2.919-3-5.077-3C3.651 2 1 4.611 1 7.833c0 1.612.644 3.088 1.692 4.167C5.074 14.449 12 22 12 22s6.926-7.551 9.308-10A5.973 5.973 0 0 0 23 7.833C23 4.611 20.349 2 17.077 2z"></path></svg>
            ) : (
              // Not liked icon
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="like"><path d="M22 4a6.99 6.99 0 0 0-6 3.408A6.99 6.99 0 0 0 10 4a7 7 0 0 0-7 7c0 1.933.761 3.706 2 5 2.815 2.94 11 12 11 12s8.185-9.06 11-12a7.224 7.224 0 0 0 2-5 7 7 0 0 0-7-7zm3.556 10.617C23.457 16.808 18.499 22.262 16 25.02c-2.499-2.757-7.457-8.211-9.556-10.403A5.204 5.204 0 0 1 5 11c0-2.757 2.243-5 5-5 1.768 0 3.369.911 4.285 2.437L16 11.294l1.715-2.857A4.962 4.962 0 0 1 22 6c2.757 0 5 2.243 5 5 0 1.36-.513 2.644-1.444 3.617z"></path></svg>
)}
           <small>{likesCount} likes</small>
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
          <button onClick={() => setIsModalOpen(true)}>Add answer</button>
        </div>

        <div className="more">
          <a href="#" className="share" onClick={handleShare}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 -960 960 960"
              width="24"
            >
              <path d="M720-80q-50 0-85-35t-35-85q0-7 1-14.5t3-13.5L322-392q-17 15-38 23.5t-44 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q23 0 44 8.5t38 23.5l282-164q-2-6-3-13.5t-1-14.5q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-23 0-44-8.5T638-672L356-508q2 6 3 13.5t1 14.5q0 7-1 14.5t-3 13.5l282 164q17-15 38-23.5t44-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-640q17 0 28.5-11.5T760-760q0-17-11.5-28.5T720-800q-17 0-28.5 11.5T680-760q0 17 11.5 28.5T720-720ZM240-440q17 0 28.5-11.5T280-480q0-17-11.5-28.5T240-520q-17 0-28.5 11.5T200-480q0 17 11.5 28.5T240-440Zm480 280q17 0 28.5-11.5T760-200q0-17-11.5-28.5T720-240q-17 0-28.5 11.5T680-200q0 17 11.5 28.5T720-160Zm0-600ZM240-480Zm480 280Z" />
            </svg>
          </a>
          <a href="#">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 -960 960 960"
              width="24"
            >
              <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" />
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
                      <p>{answers.user?.email}</p>
                    </span>
                    <small>
                      {answers.timestamp?.toDate().toLocaleDateString()}
                    </small>
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
          <button className="cancel" onClick={() => setIsModalOpen(false)}>
            Cancel
          </button>
          <button className="add" type="submit" onClick={handleAnswer}>
            Add Answer
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Post;

import React, { useEffect, useState } from "react";
import "../css/Post.css";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import "react-quill/dist/quill.snow.css";
import { useDispatch, useSelector } from "react-redux";
import {
  selectQuestionId, setQuestionInfo} from "../features/questionSlice";
import { selectUser } from "../features/userSlice";
import db from "../firebase";
import { collection, addDoc, doc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";


function Post({ id, question, image, time, quoraUser,searchQuery  }) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [answersCount, setAnswersCount] = useState(0);

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

          <a
            className="show_answer"
            onClick={() => setShowAnswers(!showAnswers)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 -960 960 960"
              width="24"
            >
              <path d="M80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
            </svg>
            <small>{answersCount}</small>
          </a>
          <button onClick={() => setIsModalOpen(true)}>Add answer</button>
        </div>
        
        <div className="more">
          <a href="#">
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
              .filter(
                (answer) => answer.answers.questionId === id
                )
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
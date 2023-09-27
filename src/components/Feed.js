import React, { useEffect, useState } from "react";
import "../css/Feed.css";
import Post from "./Post";
import db from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import Quorabox from "./Quorabox";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State to track the search query

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const quesSnapshot = collection(db, "questions");

        // Set up a real-time listener for questions
        const unsubscribe = onSnapshot(quesSnapshot, (snapshot) => {
          const postquestion = snapshot.docs.map((doc) => ({
            id: doc.id,
            question: doc.data(),
          }));

          // Sort the questions by timestamp in descending order
          postquestion.sort((a, b) => b.question.timestamp - a.question.timestamp);

          setPosts(postquestion);
        });

        return () => {
          // Unsubscribe the listener when the component unmounts
          unsubscribe();
        };
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    fetchPosts();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query); // Update the search query state
  };

  // Filter posts based on the search query
  const filteredPosts = posts.filter(({ question }) =>
    question.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="feed">
      <Quorabox onSearch={handleSearch} />

      {searchQuery === "" ? (
        // Show all posts when search query is empty
        posts.map(({ id, question }) => (
          <Post
            key={id}
            id={id}
            image={question.imageUrl}
            question={question.question}
            quoraUser={question.user}
            time={question.timestamp}
          />
        ))
      ) : filteredPosts.length === 0 ? ( // Show message when no matching posts
        <p className="sorry">Sorry, no posts match your query.</p>
      ) : (
        filteredPosts.map(({ id, question }) => (
          <Post
            key={id}
            id={id}
            image={question.imageUrl}
            question={question.question}
            quoraUser={question.user}
            time={question.timestamp}
          />
        ))
      )}
    </div>
  );
}

export default Feed;

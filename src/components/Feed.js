import React, { useEffect, useState } from "react";
import "../css/Feed.css";
import Post from "./Post";
import db from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import Quorabox from "./Quorabox";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("timestamp");
  const user = useSelector(selectUser);

  const handleSort = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const handleYourPosts = () => {
    setSortBy("yourPosts"); // Update the sortBy state to a custom value

    // Fetch posts and filter based on the logged-in user's ID
    const filteredPosts = posts.filter(
      ({ question }) => question.user.uid === user.uid
    );

    // Sort the filtered posts by timestamp in descending order
    filteredPosts.sort((a, b) => b.question.timestamp - a.question.timestamp);

    // Set the sorted and filtered posts to the state
    setPosts(filteredPosts);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const quesSnapshot = collection(db, "questions");

        const unsubscribe = onSnapshot(quesSnapshot, (snapshot) => {
          const postquestion = snapshot.docs.map((doc) => ({
            id: doc.id,
            question: doc.data(),
          }));

          let filteredPosts = [...postquestion];

          if (sortBy === "timestamp") {
            filteredPosts.sort(
              (a, b) => b.question.timestamp - a.question.timestamp
            );
          } else if (sortBy === "likedBy") {
            filteredPosts.sort(
              (a, b) => b.question.likedBy.length - a.question.likedBy.length
            );
          } else if (sortBy === "yourPosts") {
            filteredPosts = filteredPosts.filter(
              ({ question }) => question.user.uid === user.uid
            );
          }

          setPosts(filteredPosts);
        });

        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    fetchPosts();
  }, [sortBy, user]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
// ...

const filteredPosts = posts.filter(({ question }) => {
  if (!question) {
    return false; // Skip undefined questions
  }

  const lowerCaseQuery = searchQuery.toLowerCase();
  const lowerCaseQuestion = (question.question || '').toLowerCase();
  const lowerCaseUserName = (question.user?.userName || '').toLowerCase();

  // Check if the question or the user's name includes the search query
  return (
    lowerCaseQuestion.includes(lowerCaseQuery) ||
    lowerCaseUserName.includes(lowerCaseQuery)
  );
});

// ...


  return (
    <div className="feed">
      <Quorabox onSearch={handleSearch} />
      <div className="render">
        <div className="sorting-buttons">
          <p>Sort by : </p>
          <button onClick={() => handleSort("timestamp")}>
            Date
          </button>
          <button onClick={() => handleSort("likedBy")}>Most Liked</button>
        </div>
        <button onClick={handleYourPosts} className="yourposts">My Posts</button>
      </div>
      {searchQuery === "" ? (
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
      ) : filteredPosts.length === 0 ? (
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

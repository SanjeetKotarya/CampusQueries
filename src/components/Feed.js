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
    setActiveSort(newSortBy);
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
    const lowerCaseQuestion = (question.question || "").toLowerCase();
    const lowerCaseUserName = (question.user?.userName || "").toLowerCase();

    // Check if the question or the user's name includes the search query
    return (
      lowerCaseQuestion.includes(lowerCaseQuery) ||
      lowerCaseUserName.includes(lowerCaseQuery)
    );
  });

  const [activeSort, setActiveSort] = useState("timestamp");
  const [yourPostsActive, setYourPostsActive] = useState(false);

  const handleYourPosts = () => {
    if (yourPostsActive) {
      // If already active, reset the state
      setSortBy("timestamp"); // Reset to a default value or the desired initial state
      setYourPostsActive(false);
    } else {
      // If not active, set the state
      setSortBy("yourPosts");
      setYourPostsActive(true);
  
      // Fetch posts and filter based on the logged-in user's ID
      const filteredPosts = posts.filter(
        ({ question }) => question.user.uid === user.uid
      );
  
      // Sort the filtered posts by timestamp in descending order
      filteredPosts.sort((a, b) => b.question.timestamp - a.question.timestamp);
  
      // Set the sorted and filtered posts to the state
      setPosts(filteredPosts);
  
      // Reset other button states
      setActiveSort(null);
    }
  };

  return (
    <div className="feed">
      <Quorabox onSearch={handleSearch} />
      <div className="render">
        <div className="sorting-buttons">
          <p>Sort by : </p>
          <button
            onClick={() => handleSort("timestamp")}
            className={activeSort === "timestamp" ? "active" : ""}
          >
            Latest
          </button>
          <button
            onClick={() => handleSort("likedBy")}
            className={activeSort === "likedBy" ? "active" : ""}
          >
            Popular
          </button>
        </div>

        <button
  onClick={handleYourPosts}
  className={`yourposts ${yourPostsActive ? "active" : ""}`}
>
  {yourPostsActive ? "All" : "My Posts"}
</button>
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

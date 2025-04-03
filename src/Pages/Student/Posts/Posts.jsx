import React, { useEffect, useState, useCallback } from "react";
import {
  FaThumbsUp,
  FaComment,
  FaEllipsisH,
  FaTimes,
  FaPaperPlane,
} from "react-icons/fa";
import styles from "./Posts.module.css";
import Header from "../../../components/Student/Header/Header";
import userImage from "../../../assets/images/default-user.png";
import { useDarkMode } from "../../../contexts/ThemeContext";

export default function Posts() {
  const { isDarkMode } = useDarkMode();
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [commentTexts, setCommentTexts] = useState({});

  useEffect(() => {
    const dummyData = [
      {
        id: 1,
        content:
          "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolores dolore, accusamus cumque labore delectus laborum! Vel exercitationem deleniti soluta reiciendis accusamus, officiis, molestiae nobis, temporibus at similique autem ipsam perferendis?",
        image: null,
        comments: 3,
      },
      {
        id: 2,
        content:
          "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolores dolore, accusamus cumque labore delectus laborum! Vel exercitationem deleniti soluta reiciendis accusamus, officiis, molestiae nobis, temporibus at similique autem ipsam perferendis?",
        image:
          "https://img.freepik.com/free-photo/programming-background-with-person-working-with-codes-computer_23-2150010130.jpg?t=st=1742617843~exp=1742621443~hmac=6b683b9015486c6848e0b7ce5e93dfc6574f54e228cd2d7de1595aa58783a760&w=1380",
        comments: 2,
      },
      {
        id: 3,
        content:
          "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolores dolore, accusamus cumque labore delectus laborum! Vel exercitationem deleniti soluta reiciendis accusamus, officiis, molestiae nobis, temporibus at similique autem ipsam perferendis?",
        image:
          "https://diplo-media.s3.eu-central-1.amazonaws.com/2023/07/most-popular-social-media-icons-black-cubes-scaled-1-1024x614.webp",
        comments: 5,
      },
    ];

    fetch("http://localhost:5102/api/News")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch(() => {
        console.warn("Failed to fetch posts, using dummy data.");
        setPosts(dummyData);
      });
  }, []);

  const handleLike = useCallback(
    (postId) => {
      setLikedPosts((prev) => {
        const isLiked = prev[postId];
        const newLikes = isLiked
          ? (likes[postId] || 0) - 1
          : (likes[postId] || 0) + 1;

        setLikes((prevLikes) => ({ ...prevLikes, [postId]: newLikes }));
        return { ...prev, [postId]: !isLiked };
      });
    },
    [likes]
  );

  const toggleCommentBox = (postId) => {
    setShowCommentBox((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentChange = (postId, text) => {
    setCommentTexts((prev) => ({ ...prev, [postId]: text }));
  };

  const handleCommentSubmit = (postId) => {
    if (commentTexts[postId]?.trim()) {
      console.log(`Comment on post ${postId}:`, commentTexts[postId]);
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    }
  };

  return (
    <>
      <Header />
      <div
        className={`${styles.page} ${
          isDarkMode ? styles.darkMode : styles.lightMode
        }`}
      >
        <div className={styles.postsContainer}>
          {posts.map((post) => (
            <div
              key={post.id}
              className={`${styles.card} ${isDarkMode ? styles.darkCard : ""}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.userInfo}>
                  <img
                    src={userImage}
                    alt="User"
                    className={styles.userImage}
                  />
                  <span className={styles.userName}>Khaled ElGendy</span>
                </div>
                <div className={styles.cardIcons}>
                  <FaEllipsisH />
                  <FaTimes />
                </div>
              </div>

              {post.image && (
                <img src={post.image} alt="Post" className={styles.image} />
              )}
              <p className={styles.text}>{post.content}</p>

              <div className={styles.interactionBar}>
                <button
                  onClick={() => handleLike(post.id)}
                  className={`${styles.likeButton} ${
                    likedPosts[post.id] ? styles.liked : ""
                  }`}
                >
                  <FaThumbsUp />
                  <span>{likes[post.id] || 0}</span>
                </button>
                <button
                  onClick={() => toggleCommentBox(post.id)}
                  className={styles.commentButton}
                >
                  <FaComment />
                  <span>{post.comments} Comments</span>
                </button>
              </div>

              {showCommentBox[post.id] && (
                <div
                  className={`${styles.commentBox} ${
                    showCommentBox[post.id] ? styles.show : ""
                  }`}
                >
                  <textarea
                    placeholder="Write your comment here..."
                    className={styles.commentInput}
                    value={commentTexts[post.id] || ""}
                    onChange={(e) =>
                      handleCommentChange(post.id, e.target.value)
                    }
                  ></textarea>
                  <button
                    className={styles.sendButton}
                    onClick={() => handleCommentSubmit(post.id)}
                  >
                    <FaPaperPlane /> Send
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

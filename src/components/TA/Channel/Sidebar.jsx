import React from "react";
import {
  FiEdit3,
  FiBook,
  FiFileText,
  FiClipboard,
  FiMessageCircle,
  FiBarChart2,
} from "react-icons/fi";
import styles from "./CoursePage.module.css";

const Sidebar = ({ subjectName, activeTab, handleTabChange }) => {
  return (
    <aside className={styles.sidebar}>
      <h2 className={subjectName === "Loading..." ? styles.loading : ""}>
        {subjectName}
      </h2>

      <button
        onClick={() => handleTabChange("allPosts")}
        className={activeTab === "allPosts" ? styles.active : ""}
      >
        <FiFileText className={styles.buttonIcon} />
        All Posts
      </button>

      <button
        onClick={() => handleTabChange("addPost")}
        className={activeTab === "addPost" ? styles.active : ""}
      >
        <FiEdit3 className={styles.buttonIcon} />
        Add Post
      </button>

      <button
        onClick={() => handleTabChange("material")}
        className={activeTab === "material" ? styles.active : ""}
      >
        <FiBook className={styles.buttonIcon} />
        Material
      </button>

      <button
        onClick={() => handleTabChange("exam")}
        className={activeTab === "exam" ? styles.active : ""}
      >
        <FiClipboard className={styles.buttonIcon} />
        Create Exam
      </button>

      <button
        onClick={() => handleTabChange("results")}
        className={activeTab === "results" ? styles.active : ""}
      >
        <FiBarChart2 className={styles.buttonIcon} />
        Results
      </button>

      <button
        onClick={() => handleTabChange("chat")}
        className={activeTab === "chat" ? styles.active : ""}
      >
        <FiMessageCircle className={styles.buttonIcon} />
        Chat
      </button>
    </aside>
  );
};

export default Sidebar;

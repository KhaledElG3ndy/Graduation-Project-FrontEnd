import React from "react";
import { FiEdit3, FiBook, FiFileText } from "react-icons/fi";
import styles from "./CoursePage.module.css";

const Sidebar = ({ subjectName, activeTab, handleTabChange }) => {
  return (
    <aside className={styles.sidebar}>
      <h2 className={subjectName === "Loading..." ? styles.loading : ""}>
        {subjectName}
      </h2>
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
        onClick={() => handleTabChange("allPosts")}
        className={activeTab === "allPosts" ? styles.active : ""}
      >
        <FiFileText className={styles.buttonIcon} />
        All Posts
      </button>
    </aside>
  );
};

export default Sidebar;

import React from "react";
import { FiLoader, FiSend } from "react-icons/fi";
import styles from "./CoursePage.module.css";

const PostForm = ({
  postForm,
  handleInputChange,
  handleFileChange,
  handlePostSubmit,
  isSubmitting,
}) => {
  return (
    <div>
      <h3>Add a New Post</h3>
      <form onSubmit={handlePostSubmit} className={styles.form}>
        <input
          type="text"
          name="title"
          placeholder="Enter post title..."
          value={postForm.title}
          onChange={handleInputChange}
          required
          disabled={isSubmitting}
        />
        <textarea
          name="content"
          placeholder="Write your post content here..."
          value={postForm.content}
          onChange={handleInputChange}
          required
          disabled={isSubmitting}
        />
        <input
          type="file"
          name="image"
          onChange={handleFileChange}
          accept="image/*"
          required
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? (
            <>
              <FiLoader className={`${styles.buttonIcon} ${styles.spinning}`} />
              Submitting...
            </>
          ) : (
            <>
              <FiSend className={styles.buttonIcon} />
              Submit Post
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PostForm;

import React from "react";
import {
  FiMessageCircle,
  FiChevronDown,
  FiChevronUp,
  FiLoader,
  FiSend,
} from "react-icons/fi";
import styles from "./CoursePage.module.css";

const PostsList = ({
  posts,
  comments,
  expandedComments,
  toggleComments,
  commentForms,
  handleCommentChange,
  handleCommentSubmit,
  submittingComments,
}) => {
  return (
    <div className={styles.postsContainer}>
      <h3>All Posts for This Course</h3>
      {posts.length > 0 ? (
        posts.map((post) => {
          const isCommentsExpanded = expandedComments[post.id];
          const postComments = comments[post.id] || [];
          const isSubmittingComment = submittingComments[post.id];

          return (
            <div key={post.id} className={styles.postCard}>
              <h4>{post.title}</h4>
              <p>{post.content}</p>
              {post.image && (
                <img
                  src={`data:image/jpeg;base64,${post.image}`}
                  alt="Post"
                  className={styles.postImage}
                />
              )}
              <small>
                Uploaded: {new Date(post.uploadedAt).toLocaleString()}
              </small>

              <div className={styles.commentsSection}>
                <button
                  className={styles.commentsToggle}
                  onClick={() => toggleComments(post.id)}
                >
                  <FiMessageCircle className={styles.buttonIcon} />
                  Comments ({postComments.length})
                  {isCommentsExpanded ? (
                    <FiChevronUp className={styles.chevronIcon} />
                  ) : (
                    <FiChevronDown className={styles.chevronIcon} />
                  )}
                </button>

                {isCommentsExpanded && (
                  <div className={styles.commentsContainer}>
                    <div className={styles.addCommentForm}>
                      <textarea
                        placeholder="Write a comment..."
                        value={commentForms[post.id] || ""}
                        onChange={(e) =>
                          handleCommentChange(post.id, e.target.value)
                        }
                        className={styles.commentTextarea}
                        disabled={isSubmittingComment}
                      />
                      <button
                        onClick={() =>
                          handleCommentSubmit(
                            post.id,
                            commentForms[post.id] || ""
                          )
                        }
                        disabled={
                          isSubmittingComment || !commentForms[post.id]?.trim()
                        }
                        className={styles.addCommentButton}
                      >
                        {isSubmittingComment ? (
                          <>
                            <FiLoader
                              className={`${styles.buttonIcon} ${styles.spinning}`}
                            />
                            Adding...
                          </>
                        ) : (
                          <>
                            <FiSend className={styles.buttonIcon} />
                            Add Comment
                          </>
                        )}
                      </button>
                    </div>

                    <div className={styles.commentsList}>
                      {postComments.length > 0 ? (
                        postComments.map((comment, index) => (
                          <div
                            key={comment.id || index}
                            className={styles.commentItem}
                          >
                            <div className={styles.commentContent}>
                              {comment.content}
                            </div>
                            <div className={styles.commentMeta}>
                              <small>
                                {comment.sentAt
                                  ? new Date(comment.sentAt).toLocaleString()
                                  : "Just now"}
                              </small>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.noComments}>
                          <p>No comments yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className={styles.noPosts}>
          <p>No posts found for this course.</p>
        </div>
      )}
    </div>
  );
};

export default PostsList;

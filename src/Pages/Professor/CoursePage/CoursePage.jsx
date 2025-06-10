import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiEdit3,
  FiBook,
  FiFolder,
  FiUpload,
  FiSend,
  FiLoader,
  FiFileText,
} from "react-icons/fi";
import styles from "./CoursePage.module.css";
import Header from "../../../components/Professor/Header/Header";

const CoursePage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [subjectName, setSubjectName] = useState("Loading...");
  const [activeTab, setActiveTab] = useState("addPost");
  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(
          `https://localhost:7072/Courses/GetCourse/${id}`
        );
        const data = await res.json();
        setCourse(data);

        const subjectRes = await fetch(
          "https://localhost:7072/Subjects/GetSubjects"
        );
        const subjects = await subjectRes.json();
        const matchedSubject = subjects.find((s) => s.id === data.subjectId);
        setSubjectName(
          matchedSubject ? matchedSubject.name : "Unknown Subject"
        );
      } catch (err) {
        console.error("Failed to fetch course or subject", err);
        setSubjectName("Error loading subject");
      }
    };

    fetchCourse();
  }, [id]);
  const fetchPosts = async () => {
    try {
      const res = await fetch(`https://localhost:7072/api/Post/${id}/${1}`);
      const data = await res.json();

      const postsArray = Array.isArray(data) ? data : [data];

      setPosts(postsArray);
    } catch (err) {
      console.error("Failed to fetch posts", err);
      setPosts([]);
    }
  };

  useEffect(() => {
    if (activeTab === "allPosts") {
      fetchPosts();
    }
  }, [activeTab]);

  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: message,
      confirmButtonColor: "#0056b3",
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
      confirmButtonColor: "#0056b3",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostForm({ ...postForm, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorAlert("File size must be less than 5MB");
        e.target.value = "";
        return;
      }
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        showErrorAlert("Please select a valid image file (JPEG, PNG, or GIF)");
        e.target.value = "";
        return;
      }
    }
    setPostForm({ ...postForm, image: file });
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("Title", postForm.title);
    formData.append("Content", postForm.content);
    formData.append("Image", postForm.image);
    formData.append("CourseId", course.id);
    formData.append("StaffId", 1);

    try {
      const res = await fetch("https://localhost:7072/api/Post", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        showSuccessAlert("Post added successfully!");
        setPostForm({ title: "", content: "", image: null });
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      } else {
        const errorData = await res.json().catch(() => ({}));
        showErrorAlert(errorData.message || "Failed to add post.");
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
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

        <main className={styles.content}>
          {activeTab === "addPost" && (
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
                      <FiLoader
                        className={`${styles.buttonIcon} ${styles.spinning}`}
                      />
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
          )}

          {activeTab === "material" && (
            <div className={styles.materialSection}>
              <div className={styles.materialIcon}>
                <FiFolder />
              </div>
              <h3>Course Materials</h3>
            </div>
          )}

          {activeTab === "allPosts" && (
            <div className={styles.postsContainer}>
              <h3>All Posts for This Course</h3>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div
                    key={`${post.title}-${post.uploadedAt}`}
                    className={styles.postCard}
                  >
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
                  </div>
                ))
              ) : (
                <div className={styles.noPosts}>
                  <p>No posts found for this course.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default CoursePage;

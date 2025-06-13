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
  FiMessageCircle,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiFile,
  FiImage,
  FiArchive,
  FiX,
  FiEye,
  FiPlus,
} from "react-icons/fi";
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileImage,
  FaFileArchive,
  FaFileAlt,
  FaFileCode,
  FaFileAudio,
  FaFileVideo,
} from "react-icons/fa";
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

  const [expandedComments, setExpandedComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentForms, setCommentForms] = useState({});
  const [submittingComments, setSubmittingComments] = useState({});

  const [materials, setMaterials] = useState([]);
  const [materialForm, setMaterialForm] = useState({
    title: "",
    files: [],
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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
      const res = await fetch(
        `https://localhost:7072/api/Post/getAllPosts/${id}`
      );
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("Failed to fetch posts", err);
      setPosts([]);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await fetch(
        `https://localhost:7072/api/Post/getAllComments?postId=${postId}`
      );
      const data = await res.json();
      setComments((prev) => ({
        ...prev,
        [postId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      console.error("Failed to fetch comments", err);
      setComments((prev) => ({
        ...prev,
        [postId]: [],
      }));
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch(
        `https://localhost:7072/api/Materials/getAllMaterials/${id}`
      );
      const data = await res.json();
      setMaterials(
        Array.isArray(data)
          ? data.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
          : []
      );
    } catch (err) {
      console.error("Failed to fetch materials", err);
      setMaterials([]);
    }
  };

  useEffect(() => {
    if (activeTab === "allPosts") {
      fetchPosts();
    } else if (activeTab === "material") {
      fetchMaterials();
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
    formData.append("id", 0);
    formData.append("Title", postForm.title);
    formData.append("Content", postForm.content);
    formData.append("Image", postForm.image);
    formData.append("CourseId", course.id);
    formData.append("StaffId", 7);

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
        console.log({ formData });
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

  const toggleComments = (postId) => {
    const isExpanded = expandedComments[postId];

    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !isExpanded,
    }));

    if (!isExpanded && !comments[postId]) {
      fetchComments(postId);
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentForms((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleCommentSubmit = async (postId, content) => {
    if (!content.trim()) {
      showErrorAlert("Please enter a comment");
      return;
    }

    setSubmittingComments((prev) => ({
      ...prev,
      [postId]: true,
    }));

    const formData = new FormData();
    formData.append("PostId", postId.toString());
    formData.append("Content", content);
    formData.append("CommenterId", "7");

    try {
      const response = await fetch(
        "https://localhost:7072/api/Post/addComment",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        showSuccessAlert("Comment added successfully!");
        setCommentForms((prev) => ({
          ...prev,
          [postId]: "",
        }));
        fetchComments(postId);
      } else {
        const errorText = await response.text();
        console.error("Server responded with error:", errorText);
        showErrorAlert("Failed to add comment");
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      showErrorAlert("Network error. Please try again.");
    } finally {
      setSubmittingComments((prev) => ({
        ...prev,
        [postId]: false,
      }));
    }
  };

  const handleMaterialInputChange = (e) => {
    setMaterialForm({ ...materialForm, title: e.target.value });
  };

  const handleMaterialFileChange = (e) => {
    console.log("File input changed", e.target.files);
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024;
    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (too large)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      showErrorAlert(
        `Some files were too large (max 10MB): ${invalidFiles.join(", ")}`
      );
    }

    const filePreview = validFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      extension: file.name.split(".").pop()?.toLowerCase(),
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));

    setSelectedFiles((prev) => [...prev, ...filePreview]);
    setMaterialForm({
      ...materialForm,
      files: [...materialForm.files, ...validFiles],
    });
  };

  const removeFile = (fileId) => {
    setSelectedFiles((prev) => {
      const updatedFiles = prev.filter((f) => f.id !== fileId);

      const removedFile = prev.find((f) => f.id === fileId);
      if (removedFile && removedFile.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return updatedFiles;
    });

    setMaterialForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, index) =>
        selectedFiles.find((sf) => sf.id === fileId)
          ? selectedFiles.indexOf(
              selectedFiles.find((sf) => sf.id === fileId)
            ) !== index
          : true
      ),
    }));
  };

  const clearAllFiles = () => {
    selectedFiles.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setSelectedFiles([]);
    setMaterialForm({ ...materialForm, files: [] });
  };
  const handleMaterialSubmit = async (e) => {
    e.preventDefault();

    console.groupCollapsed("Material Upload Debug");
    console.time("Upload Duration");

    console.log(`Starting upload at ${new Date().toLocaleTimeString()}`);
    console.log(`Title: ${materialForm.title}`);
    console.log(`Files to upload: ${materialForm.files.length}`);

    if (!materialForm.title || materialForm.files.length === 0) {
      console.error("Validation failed: Title or files missing");
      console.groupEnd();
      showErrorAlert("Please provide a title and select at least one file.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("Id", 0);
      formData.append("Name", materialForm.title);
      formData.append("StaffId", 7);
      formData.append("CourseId", course.id);

      const file = materialForm.files[0];

      if (file) {
        formData.append("File", file);
        console.log(`Adding file: ${file.name} (${formatFileSize(file.size)})`);
      }
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(
          `  ${key}: ${value instanceof File ? value.name + " (file)" : value}`
        );
      }

      console.log(
        "Sending request to: https://localhost:7072/Courses/Material"
      );
      console.log({ formData });

      const response = await fetch("https://localhost:7072/api/Materials", {
        method: "POST",
        body: formData,
      });

      console.log(`Server response: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const successMsg = `Successfully uploaded ${materialForm.files.length} file(s)!`;
        console.log(successMsg);
        showSuccessAlert(successMsg);
        setMaterialForm({ title: "", files: [] });
        clearAllFiles();
        fetchMaterials();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = `Upload failed: ${
          errorData.message || response.statusText
        }`;
        console.error(errorMsg);
        showErrorAlert(errorMsg);
      }
    } catch (err) {
      const errorMsg = `Network error: ${err.message}`;
      console.error(errorMsg);
      showErrorAlert("Network error. Please try again.");
    } finally {
      setIsUploading(false);

      console.timeEnd("Upload Duration");
      console.groupEnd();
    }
  };
  const getFileIcon = (extension) => {
    switch (extension?.toLowerCase()) {
      case "pdf":
        return <FaFilePdf color="#e84118" />;
      case "doc":
      case "docx":
        return <FaFileWord color="#2b579a" />;
      case "xls":
      case "xlsx":
      case "csv":
        return <FaFileExcel color="#217346" />;
      case "ppt":
      case "pptx":
        return <FaFilePowerpoint color="#d24726" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FaFileImage color="#009432" />;
      case "zip":
      case "rar":
        return <FaFileArchive color="#e58e26" />;
      case "txt":
        return <FaFileAlt color="#718093" />;
      case "mp3":
      case "wav":
        return <FaFileAudio color="#8e44ad" />;
      case "mp4":
      case "avi":
        return <FaFileVideo color="#2980b9" />;
      case "js":
      case "html":
      case "css":
        return <FaFileCode color="#f1c40f" />;
      default:
        return <FaFileAlt color="#718093" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
            <>
              <div className={styles.uploadFormCard}>
                <h3>Upload New Materials</h3>
                <form onSubmit={handleMaterialSubmit} className={styles.form}>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter material title..."
                    value={materialForm.title}
                    onChange={handleMaterialInputChange}
                    required
                    disabled={isUploading}
                    className={styles.inputField}
                  />

                  <div className={styles.fileInputWrapper}>
                    <label
                      htmlFor="file-upload"
                      className={styles.fileInputLabel}
                    >
                      <FiPlus className={styles.uploadIcon} />
                      Select Files
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      name="files"
                      onChange={handleMaterialFileChange}
                      multiple
                      className={styles.fileInput}
                    />
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className={styles.filePreviewSection}>
                      <div className={styles.previewHeader}>
                        <h4>Selected Files ({selectedFiles.length})</h4>
                        <button
                          type="button"
                          onClick={clearAllFiles}
                          className={styles.clearAllButton}
                          disabled={isUploading}
                        >
                          Clear All
                        </button>
                      </div>

                      <div className={styles.filePreviewGrid}>
                        {selectedFiles.map((fileData) => (
                          <div
                            key={fileData.id}
                            className={styles.filePreviewCard}
                          >
                            <div className={styles.filePreviewHeader}>
                              <div className={styles.fileIcon}>
                                {getFileIcon(fileData.extension)}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(fileData.id)}
                                className={styles.removeFileButton}
                                disabled={isUploading}
                              >
                                <FiX />
                              </button>
                            </div>

                            {fileData.preview && (
                              <div className={styles.imagePreview}>
                                <img
                                  src={fileData.preview}
                                  alt={fileData.name}
                                  className={styles.previewImage}
                                />
                              </div>
                            )}

                            <div className={styles.fileInfo}>
                              <p
                                className={styles.fileName}
                                title={fileData.name}
                              >
                                {fileData.name.length > 20
                                  ? `${fileData.name.substring(0, 20)}...`
                                  : fileData.name}
                              </p>
                              <p className={styles.fileSize}>
                                {formatFileSize(fileData.size)}
                              </p>
                              <p className={styles.fileType}>
                                {fileData.extension?.toUpperCase() || "Unknown"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUploading || selectedFiles.length === 0}
                    className={styles.submitButton}
                  >
                    {isUploading ? (
                      <>
                        <FiLoader
                          className={`${styles.buttonIcon} ${styles.spinning}`}
                        />
                        Uploading {selectedFiles.length} file(s)...
                      </>
                    ) : (
                      <>
                        <FiUpload className={styles.buttonIcon} />
                        Upload {selectedFiles.length} Material(s)
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className={styles.materialsGrid}>
                <h3>Course Materials</h3>
                {materials.length > 0 ? (
                  materials.map((material) => {
                    const fileExtension = material.fileName?.split(".").pop();
                    return (
                      <div key={material.id} className={styles.materialCard}>
                        <div className={styles.materialIcon}>
                          {getFileIcon(fileExtension)}
                        </div>
                        <div className={styles.materialInfo}>
                          <h4>{material.title}</h4>
                          <p className={styles.fileName}>{material.fileName}</p>
                          <small>
                            Uploaded:{" "}
                            {new Date(material.uploadedAt).toLocaleString()}
                          </small>
                        </div>
                        <button
                          className={styles.downloadButton}
                          onClick={() =>
                            window.open(
                              `https://localhost:7072/api/Material/download/${material.id}`,
                              "_blank"
                            )
                          }
                        >
                          <FiDownload />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.noMaterials}>
                    <p>No materials uploaded yet.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "allPosts" && (
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
                                  isSubmittingComment ||
                                  !commentForms[post.id]?.trim()
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
                                          ? new Date(
                                              comment.sentAt
                                            ).toLocaleString()
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
          )}
        </main>
      </div>
    </>
  );
};

export default CoursePage;

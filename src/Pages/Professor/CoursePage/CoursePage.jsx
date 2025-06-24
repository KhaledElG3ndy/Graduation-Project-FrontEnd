import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
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
  FaSpinner,
  FaPaperPlane,
} from "react-icons/fa";
import styles from "./CoursePage.module.css";
import Header from "../../../components/Professor/Header/Header";
import Sidebar from "../../../components/Professor/channel/Sidebar";
import PostForm from "../../../components/Professor/channel/PostForm";
import MaterialForm from "../../../components/Professor/channel/MaterialForm";
import MaterialGrid from "../../../components/Professor/channel/MaterialGrid";
import PostsList from "../../../components/Professor/channel/PostsList";
import PreviewModal from "../../../components/Professor/channel/PreviewModal";
import ExamMain from "../../../components/Professor/Exam/ExamMain";

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

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (!token) {
      navigate("/login/signin");
      return;
    }

    const parseJwt = (token) => {
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch (e) {
        console.error("Invalid token", e);
        return null;
      }
    };

    const payload = parseJwt(token);
    if (!payload) {
      navigate("/login/signin");
      return;
    }

    const role =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (role !== "Professor") {
      navigate("/login/signin");
    }
  }, [navigate]);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsPreviewModalOpen(false);
      }
    };

    if (isPreviewModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPreviewModalOpen]);

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

    if (!postForm.title.trim() || !postForm.content.trim()) {
      showErrorAlert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("id", "0");
    formData.append("Title", postForm.title);
    formData.append("Content", postForm.content);

    if (postForm.image) {
      formData.append("Image", postForm.image);
    }

    formData.append("CourseId", course.id.toString());
    formData.append("StaffId", "1");

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

        if (activeTab === "allPosts") {
          fetchPosts();
        }
      } else {
        const errorText = await res.text();
        showErrorAlert(errorText || "Failed to add post.");
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
    formData.append("CommenterId", "1");

    try {
      const response = await fetch(
        "https://localhost:7072/api/Post/addComment",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
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

    if (!materialForm.title || materialForm.files.length === 0) {
      showErrorAlert("Please provide a title and select at least one file.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("Id", 0);
      formData.append("Name", materialForm.title);
      formData.append("StaffId", "1");
      formData.append("CourseId", course.id);

      const file = materialForm.files[0];
      if (file) {
        formData.append("File", file);
      }

      const response = await fetch("https://localhost:7072/api/Materials", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const successMsg = `Successfully uploaded ${materialForm.files.length} file(s)!`;
        showSuccessAlert(successMsg);
        setMaterialForm({ title: "", files: [] });
        clearAllFiles();
        fetchMaterials();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showErrorAlert(
          `Upload failed: ${errorData.message || response.statusText}`
        );
      }
    } catch (err) {
      showErrorAlert("Network error. Please try again.");
    } finally {
      setIsUploading(false);
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

  const handlePreview = (materialId, extension, fileName) => {
    const url = `https://localhost:7072/api/Material/download/${materialId}`;
    setPreviewUrl(url);
    setPreviewType(extension.toLowerCase());
    setPreviewFileName(fileName);
    setIsPreviewModalOpen(true);
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <Sidebar
          subjectName={subjectName}
          activeTab={activeTab}
          handleTabChange={handleTabChange}
        />
        <main className={styles.content}>
          {activeTab === "addPost" && (
            <PostForm
              postForm={postForm}
              handleInputChange={handleInputChange}
              handleFileChange={handleFileChange}
              handlePostSubmit={handlePostSubmit}
              isSubmitting={isSubmitting}
            />
          )}
          {activeTab === "material" && (
            <>
              <MaterialForm
                materialForm={materialForm}
                handleMaterialInputChange={handleMaterialInputChange}
                handleMaterialFileChange={handleMaterialFileChange}
                selectedFiles={selectedFiles}
                removeFile={removeFile}
                clearAllFiles={clearAllFiles}
                handleMaterialSubmit={handleMaterialSubmit}
                isUploading={isUploading}
                getFileIcon={getFileIcon}
                formatFileSize={formatFileSize}
              />
              <MaterialGrid
                materials={materials}
                getFileIcon={getFileIcon}
                handlePreview={handlePreview}
              />
            </>
          )}
          {activeTab === "allPosts" && (
            <PostsList
              posts={posts}
              comments={comments}
              expandedComments={expandedComments}
              toggleComments={toggleComments}
              commentForms={commentForms}
              handleCommentChange={handleCommentChange}
              handleCommentSubmit={handleCommentSubmit}
              submittingComments={submittingComments}
            />
          )}
          {activeTab === "exam" && (
            <ExamMain
              subjectName={subjectName}
              courseId={course?.id}
              onSuccess={(message) => {
                showSuccessAlert(message);
                setActiveTab("allPosts");
              }}
            />
          )}
        </main>
      </div>
      <PreviewModal
        isPreviewModalOpen={isPreviewModalOpen}
        setIsPreviewModalOpen={setIsPreviewModalOpen}
        previewUrl={previewUrl}
        previewType={previewType}
        previewFileName={previewFileName}
      />
    </>
  );
};

export default CoursePage;

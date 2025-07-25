import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
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
  FaPaperclip,
  FaUserCircle,
  FaCommentAlt,
  FaChevronDown,
  FaComments,
  FaTimes,
  FaEye,
  FaCheck,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import * as signalR from "@microsoft/signalr";
import { FiSend, FiClipboard, FiBarChart2 } from "react-icons/fi";
import MeetingProfessor from "../../../components/MeetingProfessor";

import styles from "./CoursePage.module.css";
import Header from "../../../components/Professor/Header/Header";
import Sidebar from "../../../components/Professor/channel/Sidebar";
import PostForm from "../../../components/Professor/channel/PostForm";
import MaterialForm from "../../../components/Professor/channel/MaterialForm";
import MaterialGrid from "../../../components/Professor/channel/MaterialGrid";
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
  const [userCache, setUserCache] = useState({});
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [editedGrades, setEditedGrades] = useState({});
  const [isSavingGrades, setIsSavingGrades] = useState(false);
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
  const [editingPostId, setEditingPostId] = useState(null);
  const [editForm, setEditForm] = useState({
    id: 0,
    title: "",
    content: "",
    image: null,
  });

  const [connection, setConnection] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [selectedChatFile, setSelectedChatFile] = useState(null);
  const [fileChatPreview, setFileChatPreview] = useState(null);
  const [isChatUploading, setIsChatUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const connectionRef = useRef(null);

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [results, setResults] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [examDetails, setExamDetails] = useState({
    grade: 0,
    passingScore: 0,
    description: "",
  });
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [examQuestions, setExamQuestions] = useState([]);
  const [isAnswersModalOpen, setIsAnswersModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [staffId, setStaffId] = useState(null);

  useEffect(() => {
    const Token = localStorage.getItem("Token");
    if (!Token) {
      navigate("/login/signin");
      return;
    }

    const parseJwt = (token) => {
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch (e) {
        console.error("Invalid Token", e);
        return null;
      }
    };

    const payload = parseJwt(Token);
    if (!payload) {
      navigate("/login/signin");
      return;
    }

    const role =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const staffId =
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ];

    if (role !== "Professor") {
      navigate("/login/signin");
      return;
    }

    setStaffId(staffId);
  }, [navigate]);
  const handleDeletePost = async (postId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`https://localhost:7072/api/Post/${postId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        });

        if (res.ok) {
          showSuccessAlert("Post deleted successfully!");
          fetchPosts();
        } else {
          const errorText = await res.text();
          showErrorAlert(errorText || "Failed to delete post.");
        }
      } catch (err) {
        console.error(err);
        showErrorAlert("Network error. Please try again.");
      }
    }
  };
  const handleEditPost = (post) => {
    setEditingPostId(post.id);
    setEditForm({
      id: post.id,
      title: post.title,
      content: post.content,
      image: null,
    });
  };
  const handleEditInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    setEditForm({ ...editForm, image: file });
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();

    if (!editForm.title.trim() || !editForm.content.trim()) {
      showErrorAlert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("id", editForm.id.toString());
    formData.append("Title", editForm.title);
    formData.append("Content", editForm.content);

    if (editForm.image) {
      formData.append("Image", editForm.image);
    }

    formData.append("CourseId", id);
    formData.append("StaffId", staffId);

    try {
      const res = await fetch("https://localhost:7072/api/Post", {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        showSuccessAlert("Post updated successfully!");
        setEditingPostId(null);
        setEditForm({ id: 0, title: "", content: "", image: null });
        fetchPosts();
      } else {
        const errorText = await res.text();
        showErrorAlert(errorText || "Failed to update post.");
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (activeTab === "results" && !exams.length) {
      fetchExams();
    }
  }, [activeTab]);

  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const res = await fetch(
        `https://localhost:7072/Exams/GetCourseExams/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch exams");

      const data = await res.json();
      setExams(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("Failed to fetch exams", err);
      setExams([]);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load exams. Please try again.",
      });
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchResults = async (examId) => {
    setLoadingResults(true);
    try {
      const exam = exams.find((e) => e.id == examId);
      if (!exam) throw new Error("Exam not found");

      setExamDetails({
        grade: exam.grade,
        passingScore: exam.passingScore,
        description: exam.description,
      });

      const resultsRes = await fetch(
        `https://localhost:7072/Exams/GetStudentGradesForExam?examId=${examId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      );
      if (!resultsRes.ok) throw new Error("Failed to fetch results");

      const resultsData = await resultsRes.json();
      const enrichedResults = resultsData.map((result) => ({
        ...result,
        studentName: userCache[result.studentId] || "Unknown Student",
      }));

      setResults(enrichedResults);
    } catch (err) {
    } finally {
      setLoadingResults(false);
    }
  };
  const decodeAnswer = (storedAnswer, choicesCount, questionType) => {
    if (!storedAnswer || storedAnswer === "No answer provided") {
      return questionType === 1 ? [] : null;
    }

    try {
      const decimal = parseInt(storedAnswer, 10);
      if (isNaN(decimal)) return questionType === 1 ? [] : null;

      let binary = decimal.toString(2).padStart(choicesCount, "0");

      binary = binary.split("").reverse().join("");

      if (questionType === 1) {
        return binary
          .split("")
          .map((bit, index) => (bit === "1" ? index : null))
          .filter((index) => index !== null);
      }

      return binary.indexOf("1");
    } catch (error) {
      console.error("Error decoding answer:", error);
      return questionType === 1 ? [] : null;
    }
  };
  const fetchStudentAnswers = async (studentId, examId) => {
    try {
      const questionsRes = await fetch(
        `https://localhost:7072/api/Question/GetAll?examId=${examId}`
      );

      if (!questionsRes.ok) throw new Error("Failed to fetch exam questions");
      const questions = await questionsRes.json();

      const answers = [];
      for (const question of questions) {
        try {
          const res = await fetch(
            `https://localhost:7072/Answer/GetQuestionAns/0?questionId=${question.id}&studentId=${studentId}`
          );

          if (res.ok) {
            const answer = await res.json();
            answers.push(answer);
          } else {
            answers.push({
              questionId: question.id,
              studentId,
              studentAns: "No answer provided",
              grade: 0,
              reasoning: "Student did not answer this question",
            });
          }
        } catch (err) {
          console.error(
            `Error fetching answer for question ${question.id}:`,
            err
          );
        }
      }

      setStudentAnswers(answers);
    } catch (err) {
      console.error("Error fetching student answers:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load student answers. Please try again.",
      });
    }
  };
  useEffect(() => {
    if (selectedExamId) {
      fetchResults(selectedExamId);
    }
  }, [selectedExamId]);
  const fetchExamQuestions = async (examId) => {
    try {
      const res = await fetch(
        `https://localhost:7072/api/Question/GetAll?examId=${examId}`
      );
      if (!res.ok) throw new Error("Failed to fetch exam questions");
      const data = await res.json();
      setExamQuestions(data);
    } catch (err) {
      console.error("Error fetching exam questions:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load exam questions. Please try again.",
      });
    }
  };
  const handleShowAnswers = async (studentId, studentName) => {
    setCurrentStudentId(studentId);
    setCurrentStudent(studentName);
    setIsAnswersModalOpen(true);

    await fetchExamQuestions(selectedExamId);
    await fetchStudentAnswers(studentId, selectedExamId);
  };
  const saveGrades = async () => {
    setIsSavingGrades(true);

    try {
      const updatePromises = Object.entries(editedGrades).map(
        ([questionId, grade]) => {
          const url = `https://localhost:7072/Answer/EditQuestionAnsGrade?studentId=${currentStudentId}&questionId=${questionId}&grade=${grade}`;
          return fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("Token")}`,
            },
          }).then((res) => {
            if (res.status === 204) {
              return;
            } else if (res.status === 404) {
              throw new Error(`No answer found for question ${questionId}`);
            } else {
              throw new Error(
                `Failed to update grade for question ${questionId}: ${res.statusText}`
              );
            }
          });
        }
      );

      await Promise.all(updatePromises);

      // All updates successful
      const updatedAnswers = studentAnswers.map((ans) => {
        const newGrade = editedGrades[ans.questionId];
        return newGrade !== undefined
          ? { ...ans, grade: parseFloat(newGrade) }
          : ans;
      });
      setStudentAnswers(updatedAnswers);

      // Update total grade in results
      const totalGrade = updatedAnswers.reduce(
        (sum, ans) => sum + ans.grade,
        0
      );
      setResults((prev) =>
        prev.map((r) =>
          r.studentId === currentStudentId ? { ...r, totalGrade } : r
        )
      );

      showSuccessAlert("Grades updated successfully!");
      setEditedGrades({});
    } catch (err) {
      console.error("Error updating grades:", err);
      showErrorAlert(err.message || "Failed to update grades");
    } finally {
      setIsSavingGrades(false);
    }
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const profRes = await fetch(
          "https://localhost:7072/api/Account/GetAllByRole?role=2",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("Token")}`,
            },
          }
        );
        const profData = await profRes.json();

        const studentRes = await fetch(
          "https://localhost:7072/api/Account/GetAllByRole?role=3",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("Token")}`,
            },
          }
        );
        const studentData = await studentRes.json();

        const users = [
          ...(profData.professors || []),
          ...(studentData.students || []),
        ];

        const userMap = {};
        users.forEach((user) => {
          userMap[user.id] = user.name;
        });

        setUserCache(userMap);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(
          `https://localhost:7072/Courses/GetCourse/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("Token")}`,
            },
          }
        );
        const data = await res.json();
        setCourse(data);

        const subjectRes = await fetch(
          "https://localhost:7072/Subjects/GetSubjects",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("Token")}`,
            },
          }
        );
        const subjects = await subjectRes.json();
        console.log("Fetched subjects:", data);
        const matchedSubject = subjects.find((s) => s.id === data.courseId?.id);
        console.log("Matched subject:", matchedSubject);
        setSubjectName(data.subjectName);
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
        `https://localhost:7072/api/Post/getAllPosts/1?courseId=${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      );
      const data = await res.json();
      console.log("Fetched posts:", data);
      setPosts(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("Failed to fetch posts", err);
      setPosts([]);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await fetch(
        `https://localhost:7072/api/Post/getAllComments?postId=${postId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
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

  useEffect(() => {
    if (activeTab === "chat" && connection && !messagesLoaded && connected) {
      fetchGroupMessages();
    }
  }, [activeTab, connection, messagesLoaded, connected]);

  useEffect(() => {
    const Token = localStorage.getItem("Token");
    if (!Token || !id) return;

    const payload = JSON.parse(atob(Token.split(".")[1]));
    const userEmail =
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ];

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://localhost:7072/chathub?userId=${encodeURIComponent(
          userEmail
        )}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      )
      .configureLogging(signalR.LogLevel.Information)
      .build();

    const setupChatConnection = async () => {
      try {
        await newConnection.start();
        setConnected(true);
        await newConnection.invoke("JoinCourseGroup", parseInt(id));
        await fetchGroupMessages();

        newConnection.on("ReceiveGroupMessage", (senderEmail, payload) => {
          try {
            const parsed = JSON.parse(payload);
            const isTextMessage = parsed.text && parsed.text !== "N/A";

            setChatMessages((prev) => [
              ...prev,
              {
                senderEmail,
                message: isTextMessage ? parsed.text : null,
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                fileUrl: parsed.file
                  ? `data:${parsed.mimeType};base64,${parsed.file}`
                  : null,
                fileName: parsed.fileName,
                fileType: parsed.mimeType,
              },
            ]);
          } catch (e) {
            console.error("Failed to parse message:", e);
          }
        });

        connectionRef.current = newConnection;
        setConnection(newConnection);
      } catch (err) {
        console.error("Connection error:", err);
      }
    };

    if (activeTab === "chat") {
      setupChatConnection();
    }

    return () => {
      if (connectionRef.current) {
        connectionRef.current.off("ReceiveGroupMessage");
        connectionRef.current.stop();
      }
      setConnected(false);
      setMessagesLoaded(false);
    };
  }, [activeTab, id]);

  const fetchGroupMessages = async () => {
    try {
      const res = await fetch(
        `https://localhost:7072/Chat/GetGroupConversation?courseId=${id}`
      );
      const data = await res.json();

      const formatted = data.map((msg) => ({
        senderEmail: msg.senderEmail,
        message: msg.message,
        timestamp: new Date(msg.sentAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fileUrl: msg.file ? `data:${msg.mimeType};base64,${msg.file}` : null,
        fileName: msg.fileName,
        fileType: msg.mimeType,
      }));

      setChatMessages(formatted);
      setMessagesLoaded(true);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const getUserFromToken = () => {
    const Token = localStorage.getItem("Token");
    if (!Token) return null;
    try {
      const payload = JSON.parse(atob(Token.split(".")[1]));
      return {
        id: parseInt(
          payload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ]
        ),
        email:
          payload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ],
        role: payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ],
      };
    } catch (err) {
      console.error("Invalid Token:", err);
      return null;
    }
  };

  const handleChatFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedChatFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileChatPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFileChatPreview(null);
    }
  };

  const removeChatFile = () => {
    setSelectedChatFile(null);
    setFileChatPreview(null);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() && !selectedChatFile) return;

    const user = getUserFromToken();
    if (!user) return;

    try {
      setIsChatUploading(true);
      const formData = new FormData();
      formData.append("CourseId", parseInt(id));
      formData.append("SenderEmail", user.email);
      formData.append("Message", chatInput.trim() || "N/A");

      if (selectedChatFile) {
        formData.append("File", selectedChatFile);
      }

      const response = await fetch(
        "https://localhost:7072/Chat/SendGroupMessage/send-group",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setChatInput("");
      setSelectedChatFile(null);
      setFileChatPreview(null);
    } catch (err) {
      console.error("Error sending message:", err);
      Swal.fire({
        icon: "error",
        title: "Send Failed",
        text: "Could not send message. Please try again.",
      });
    } finally {
      setIsChatUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const Token = localStorage.getItem("Token");
      const response = await fetch(
        `https://localhost:7072/api/Materials/DeleteFile/${fileId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "File Deleted",
          text: "The file has been deleted successfully.",
        });
        fetchMaterials();
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete the file");
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Could not delete the file. Please try again.",
      });
    }
  };

  useEffect(() => {
    if (chatMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const fetchMaterials = async () => {
    try {
      const res = await fetch(
        `https://localhost:7072/api/Materials/getAllMaterials/${id}?p=1`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
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

    formData.append("CourseId", course.courseId);
    formData.append("StaffId", "1");

    try {
      const res = await fetch("https://localhost:7072/api/Post", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("Token")}`,
        },
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
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
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
      formData.append("CourseId", id);

      const files = materialForm.files;
      for (let i = 0; i < files.length; i++) {
        formData.append("Files", files[i]);
      }

      const response = await fetch("https://localhost:7072/api/Materials", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("Token")}`,
        },
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

  const PostItem = ({ post }) => (
    <div className={styles.postCard}>
      {editingPostId === post.id ? (
        <form onSubmit={handleUpdatePost} className={styles.editForm}>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="title"
              value={editForm.title}
              onChange={handleEditInputChange}
              placeholder="Title"
              className={styles.formInput}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <textarea
              name="content"
              value={editForm.content}
              onChange={handleEditInputChange}
              placeholder="Content"
              className={styles.formTextarea}
              rows="4"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.fileInputLabel}>
              <span>Change Image (optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleEditFileChange}
                className={styles.fileInput}
              />
            </label>
            {post.image && !editForm.image && (
              <div className={styles.imagePreviewContainer}>
                <p>Current Image:</p>
                <img
                  src={`data:image/jpeg;base64,${post.image}`}
                  alt="Current"
                  className={styles.imagePreview}
                />
              </div>
            )}
            {editForm.image && (
              <div className={styles.imagePreviewContainer}>
                <p>New Image:</p>
                <img
                  src={URL.createObjectURL(editForm.image)}
                  alt="New"
                  className={styles.imagePreview}
                />
              </div>
            )}
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => setEditingPostId(null)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? (
                <FaSpinner className={styles.spinner} />
              ) : (
                "Update Post"
              )}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className={styles.postHeader}>
            <FaUserCircle size={24} className={styles.postAvatar} />
            <div>
              <h3 className={styles.postTitle}>{post.title}</h3>
              <div className={styles.postMeta}>
                <span className={styles.postAuthor}>Professor</span>
                <span className={styles.postDate}>
                  {new Date(post.uploadedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.postContent}>
            <p>{post.content}</p>
            {post.image && (
              <img
                src={`data:image/jpeg;base64,${post.image}`}
                alt={post.title}
                className={styles.postImage}
              />
            )}
          </div>

          <div className={styles.postActions}>
            <button
              onClick={() => toggleComments(post.id)}
              className={`${styles.commentsToggle} ${
                expandedComments[post.id] ? styles.expanded : ""
              }`}
            >
              <FaCommentAlt className={styles.buttonIcon} />
              <span>{comments[post.id]?.length || 0} Comments</span>
              <FaChevronDown
                className={`${styles.chevronIcon} ${
                  expandedComments[post.id] ? styles.rotated : ""
                }`}
              />
            </button>

            {/* Add Edit and Delete buttons */}
            <div className={styles.postManagementActions}>
              <button
                onClick={() => handleEditPost(post)}
                className={styles.editButton}
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => handleDeletePost(post.id)}
                className={styles.deleteButton}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
          {expandedComments[post.id] && (
            <div className={styles.commentsSection}>
              <div className={styles.commentsContainer}>
                {comments[post.id]?.length > 0 ? (
                  <div className={styles.commentsList}>
                    {comments[post.id].map((comment) => (
                      <div key={comment.id} className={styles.commentItem}>
                        <div className={styles.commentHeader}>
                          <FaUserCircle className={styles.commentAvatar} />
                          <div>
                            <strong className={styles.commentAuthor}>
                              {userCache[comment.commenterId] || "Unknown User"}
                            </strong>
                            <span className={styles.commentDate}>
                              {new Date(comment.sentAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                          </div>
                        </div>
                        <p className={styles.commentContent}>
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noComments}>
                    <FaComments className={styles.commentIcon} />
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                )}

                <div className={styles.addCommentForm}>
                  <textarea
                    placeholder="Write a comment..."
                    value={commentForms[post.id] || ""}
                    onChange={(e) =>
                      handleCommentChange(post.id, e.target.value)
                    }
                    className={styles.commentTextarea}
                    rows="3"
                  />
                  <button
                    onClick={() =>
                      handleCommentSubmit(post.id, commentForms[post.id] || "")
                    }
                    className={styles.addCommentButton}
                    disabled={submittingComments[post.id]}
                  >
                    {submittingComments[post.id] ? (
                      <FaSpinner
                        className={`${styles.spinner} ${styles.buttonIcon}`}
                      />
                    ) : (
                      <>
                        <FaPaperPlane className={styles.buttonIcon} />
                        Post Comment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      <Header />
      <div className={styles.container}>
        <Sidebar
          subjectName={subjectName}
          activeTab={activeTab}
          handleTabChange={setActiveTab}
          showChatTab={true}
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
                formatFileSize={formatFileSize}
                handleDeleteFile={handleDeleteFile}
              />
            </>
          )}
          {activeTab === "allPosts" && (
            <div className={styles.postsContainer}>
              <h2 className={styles.postsTitle}>Course Posts</h2>
              {posts.length === 0 ? (
                <div className={styles.emptyPosts}>
                  <FaFileAlt size={48} />
                  <p>No posts available yet</p>
                </div>
              ) : (
                <div className={styles.postsList}>
                  {posts.map((post) => (
                    <PostItem key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "exam" && (
            <ExamMain
              subjectName={subjectName}
              courseId={id}
              onSuccess={(message) => {
                showSuccessAlert(message);
                setActiveTab("allPosts");
              }}
            />
          )}
          {activeTab === "chat" && (
            <div className={styles.chatTabContent}>
              <h3 className={styles.tabTitle}>Class Chat</h3>
              {!connected ? (
                <p>Connecting to chat...</p>
              ) : (
                <div className={styles.chatContainer}>
                  <div className={styles.chatHeader}>
                    <div className={styles.chatSubjectInfo}>
                      <span>{subjectName}</span>
                    </div>
                    <div className={styles.onlineIndicator}>
                      <div className={styles.onlineDot} />
                      <span>Online</span>
                    </div>
                  </div>

                  <div className={styles.chatMessages}>
                    {chatMessages.map((msg, idx) => {
                      const user = getUserFromToken();
                      const isSent = msg.senderEmail === user?.email;

                      return (
                        <div
                          key={idx}
                          className={`${styles.message} ${
                            isSent ? styles.sent : styles.received
                          }`}
                        >
                          <div className={styles.messageHeader}>
                            <span className={styles.senderName}>
                              {isSent ? "You" : msg.senderEmail.split("@")[0]}
                            </span>
                            <span className={styles.messageTime}>
                              {msg.timestamp}
                            </span>
                          </div>

                          {msg.message && (
                            <div className={styles.messageText}>
                              {msg.message}
                            </div>
                          )}

                          {msg.fileUrl && (
                            <div className={styles.fileAttachment}>
                              {msg.fileType?.startsWith("image/") ? (
                                <img
                                  src={msg.fileUrl}
                                  alt="Attached content"
                                  className={styles.attachmentImage}
                                />
                              ) : (
                                <a
                                  href={msg.fileUrl}
                                  download
                                  className={styles.fileDownload}
                                >
                                  <FaFileAlt className={styles.fileIcon} />
                                  <span>{msg.fileName}</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className={styles.chatInputArea}>
                    {fileChatPreview && (
                      <div className={styles.filePreview}>
                        <img
                          src={fileChatPreview}
                          alt="Preview"
                          className={styles.previewImage}
                        />
                        <button
                          onClick={removeChatFile}
                          className={styles.removePreview}
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {selectedChatFile && !fileChatPreview && (
                      <div className={styles.filePreview}>
                        <FaFileAlt className={styles.fileIconLarge} />
                        <span className={styles.fileName}>
                          {selectedChatFile.name}
                        </span>
                        <button
                          onClick={removeChatFile}
                          className={styles.removePreview}
                        >
                          ×
                        </button>
                      </div>
                    )}

                    <div className={styles.inputContainer}>
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message..."
                        className={styles.chatInput}
                        onKeyPress={(e) =>
                          e.key === "Enter" && sendChatMessage()
                        }
                      />

                      <div className={styles.chatActions}>
                        <label
                          htmlFor="chat-file-upload"
                          className={styles.attachButton}
                        >
                          <FaPaperclip />
                          <input
                            id="chat-file-upload"
                            type="file"
                            onChange={handleChatFileChange}
                            className={styles.fileInput}
                            accept="image/*, .pdf, .doc, .docx, .txt"
                          />
                        </label>

                        <button
                          onClick={sendChatMessage}
                          disabled={isChatUploading}
                          className={styles.sendButton}
                        >
                          {isChatUploading ? (
                            <FaSpinner className={styles.spinner} />
                          ) : (
                            <FiSend size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "results" && (
            <div className={styles.resultsContainer}>
              <h2 className={styles.resultsTitle}>Exam Results</h2>

              {loadingExams ? (
                <div className={styles.loadingIndicator}>
                  <FaSpinner className={styles.spinner} />
                  <p>Loading exams...</p>
                </div>
              ) : exams.length === 0 ? (
                <div className={styles.noResults}>
                  <FiClipboard size={48} />
                  <p>No exams found for this course</p>
                </div>
              ) : (
                <>
                  <div className={styles.examSelector}>
                    <label htmlFor="exam-select">Select Exam:</label>
                    <select
                      id="exam-select"
                      value={selectedExamId}
                      onChange={(e) => setSelectedExamId(e.target.value)}
                      className={styles.examDropdown}
                    >
                      <option value="">Choose an exam</option>
                      {exams.map((exam) => (
                        <option key={exam.id} value={exam.id}>
                          {exam.description} (ID: {exam.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedExamId && (
                    <>
                      {loadingResults ? (
                        <div className={styles.loadingIndicator}>
                          <FaSpinner className={styles.spinner} />
                          <p>Loading results...</p>
                        </div>
                      ) : results.length === 0 ? (
                        <div className={styles.noResults}>
                          <FiBarChart2 size={48} />
                          <p>No students have taken this exam yet</p>
                        </div>
                      ) : (
                        <div className={styles.resultsTableContainer}>
                          <div className={styles.examInfo}>
                            <h3>{examDetails.description}</h3>
                          </div>
                          <table className={styles.resultsTable}>
                            <thead>
                              <tr>
                                <th>Student</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.map((result) => (
                                <tr key={result.studentId}>
                                  <td>{result.studentName}</td>
                                  <td>
                                    <strong>
                                      {result.totalGrade.toFixed(2)}
                                    </strong>{" "}
                                    / {examDetails.grade}
                                  </td>
                                  <td className={styles.statusCell}>
                                    {result.totalGrade >=
                                    examDetails.passingScore ? (
                                      <span className={styles.passBadge}>
                                        <FaCheck /> Passed
                                      </span>
                                    ) : (
                                      <span className={styles.failBadge}>
                                        <FaTimes /> Failed
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <button
                                      className={styles.showButton}
                                      onClick={() =>
                                        handleShowAnswers(
                                          result.studentId,
                                          result.studentName
                                        )
                                      }
                                    >
                                      <FaEye /> Show Answers
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className={styles.resultsSummary}>
                            <p>
                              <strong>Students:</strong> {results.length}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
          {activeTab === "Meetings" && <MeetingProfessor />}
          {isAnswersModalOpen && (
            <div
              className={styles.modalOverlay}
              onClick={() => setIsAnswersModalOpen(false)}
            >
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={styles.closeButton}
                  onClick={() => setIsAnswersModalOpen(false)}
                >
                  ×
                </button>

                <h2 className={styles.modalTitle}>
                  Exam Answers for {currentStudent}
                </h2>

                <div className={styles.answersContainer}>
                  {examQuestions.length === 0 ? (
                    <div className={styles.noAnswers}>
                      <FaFileAlt size={48} />
                      <p>No questions found for this exam</p>
                    </div>
                  ) : (
                    <div className={styles.questionsList}>
                      {examQuestions.map((question) => {
                        const answer = studentAnswers.find(
                          (ans) => ans.questionId === question.id
                        );

                        const decodedAnswer = decodeAnswer(
                          answer?.studentAns,
                          question.choices.length,
                          question.type
                        );

                        return (
                          <div
                            key={question.id}
                            className={styles.questionItem}
                          >
                            <div className={styles.questionHeader}>
                              <h3>Question: {question.title}</h3>
                              <span>Points: {question.grade}</span>
                            </div>

                            <div className={styles.questionContent}>
                              {question.type === 0 || question.type === 1 ? (
                                <div className={styles.studentAnswerSection}>
                                  <h4>Student's Selected Answer:</h4>
                                  <div className={styles.choicesList}>
                                    {question.choices.map((choice, index) => {
                                      const isSelected =
                                        question.type === 1
                                          ? decodedAnswer.includes(index)
                                          : decodedAnswer === index;

                                      return (
                                        <div
                                          key={choice.id}
                                          className={styles.choiceItem}
                                        >
                                          <input
                                            type={
                                              question.type === 1
                                                ? "checkbox"
                                                : "radio"
                                            }
                                            checked={isSelected}
                                            readOnly
                                            className={styles.choiceInput}
                                          />
                                          <label className={styles.choiceLabel}>
                                            {String.fromCharCode(65 + index)}.{" "}
                                            {choice.choice}
                                          </label>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : question.type === 2 ? (
                                <div className={styles.studentAnswerSection}>
                                  <h4>Student's Written Answer:</h4>
                                  <div
                                    className={styles.writtenAnswerContainer}
                                  >
                                    {answer?.studentAns || "No answer provided"}
                                  </div>
                                </div>
                              ) : question.type === 4 ? (
                                <div className={styles.studentAnswerSection}>
                                  <h4>Student's Assignment Submission:</h4>
                                  {answer?.fileUrl ? (
                                    <a
                                      href={answer.fileUrl}
                                      download={`assignment_${question.id}.pdf`}
                                      className={styles.downloadLink}
                                    >
                                      <FaFilePdf className={styles.fileIcon} />
                                      Download Assignment Submission
                                    </a>
                                  ) : (
                                    <p>No assignment submitted</p>
                                  )}
                                </div>
                              ) : null}

                              <div className={styles.gradingInfo}>
                                <div className={styles.gradeEditor}>
                                  <span>
                                    <strong>Grade:</strong>
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    max={question.grade}
                                    step="0.5"
                                    value={
                                      editedGrades[question.id] ??
                                      answer?.grade ??
                                      0
                                    }
                                    onChange={(e) =>
                                      setEditedGrades((prev) => ({
                                        ...prev,
                                        [question.id]: e.target.value,
                                      }))
                                    }
                                    className={styles.gradeInput}
                                  />
                                  <span> / {question.grade}</span>
                                </div>

                                {answer?.reasoning && (
                                  <p className={styles.reasoning}>
                                    <strong>Feedback:</strong>{" "}
                                    {answer.reasoning}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className={styles.modalActions}>
                    <button
                      onClick={saveGrades}
                      className={styles.saveButton}
                      disabled={isSavingGrades}
                    >
                      {isSavingGrades ? (
                        <FaSpinner className={styles.spinner} />
                      ) : (
                        "Save Grades"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <PreviewModal
            isPreviewModalOpen={isPreviewModalOpen}
            setIsPreviewModalOpen={setIsPreviewModalOpen}
            previewUrl={previewUrl}
            previewType={previewType}
            previewFileName={previewFileName}
          />
        </main>
      </div>
    </>
  );
};

export default CoursePage;

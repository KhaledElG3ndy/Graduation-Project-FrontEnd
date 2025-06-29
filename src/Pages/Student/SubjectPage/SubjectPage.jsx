import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import { FiFileText, FiDownload, FiPaperclip, FiSend } from "react-icons/fi";
import {
  BookOpen,
  FileText,
  ClipboardList,
  MessageCircle,
  File,
} from "lucide-react";
import Header from "../../../components/student/Header/Header";
import styles from "./SubjectPage.module.css";
import Swal from "sweetalert2";

const SubjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);

  const [activeTab, setActiveTab] = useState("Posts");
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [commentBoxes, setCommentBoxes] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [userCache, setUserCache] = useState({});
  const [studentId, setStudentId] = useState(null);
  const [connection, setConnection] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const connectionRef = useRef(null);

  const tabs = [
    { name: "Posts", icon: <FileText size={18} /> },
    { name: "Material", icon: <BookOpen size={18} /> },
    { name: "Exams & Quizzes", icon: <ClipboardList size={18} /> },
    { name: "Grades", icon: <File size={18} /> },
    { name: "Chat", icon: <MessageCircle size={18} /> },
  ];

  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (!token) {
      navigate("/login/signin");
      return;
    }

    const base64Payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(base64Payload));
    const studentId =
      decodedPayload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ];
    const email =
      decodedPayload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ];

    setStudentId(studentId);
    setUserEmail(email);
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          "https://localhost:7072/api/Account/GetAllByRole?role=3",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("Token")}`,
            },
          }
        );
        const data = await res.json();

        const userMap = {};
        for (const user of data.students || []) {
          userMap[user.id] = user.name;
        }

        setUserCache(userMap);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  useEffect(() => {
    const fetchExams = async () => {
      const courseId = subject?.id;
      if (!courseId) return;

      setExamsLoading(true);
      try {
        const res = await fetch(
          `https://localhost:7072/Exams/GetCourseExams/${courseId}`
        );
        const data = await res.json();
        setExams(data);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setExams([]);
      } finally {
        setExamsLoading(false);
      }
    };

    if (
      (activeTab === "Exams & Quizzes" || activeTab === "Grades") &&
      subject
    ) {
      fetchExams();
    }
  }, [activeTab, subject]);

  useEffect(() => {
    const fetchStudentExams = async () => {
      if (!studentId) return;
      try {
        const res = await fetch(
          `https://localhost:7072/Exams/GetStudentExams?studentId=${studentId}`
        );
        const data = await res.json();
        setExams(data);
      } catch (err) {
        console.error("Error fetching student exams:", err);
        setExams([]);
      }
    };

    if (activeTab === "Grades") {
      fetchStudentExams();
    }
  }, [activeTab, studentId]);

  useEffect(() => {
    if (activeTab === "Chat" && connection && !messagesLoaded && connected) {
      fetchGroupMessages();
    }
  }, [activeTab, connection, messagesLoaded, connected]);

  useEffect(() => {
    const fetchMaterials = async () => {
      const courseId = subject?.id;
      if (!courseId) return;

      setMaterialsLoading(true);
      try {
        const res = await fetch(
          `https://localhost:7072/api/Materials/getAllMaterials/${courseId}?p=${courseId}`
        );
        if (!res.ok) throw new Error("API returned error");

        const data = await res.json();
        if (!Array.isArray(data)) {
          console.error("Materials API did not return an array:", data);
          return;
        }

        setMaterials(data);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setMaterialsLoading(false);
      }
    };

    if (activeTab === "Material" && subject) {
      fetchMaterials();
    }
  }, [activeTab, subject]);

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
      }));

      setChatMessages(formatted);
      setMessagesLoaded(true);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "Chat") {
      const setupChatConnection = async () => {
        const token = localStorage.getItem("Token");
        if (!token || !id) return;

        const payload = JSON.parse(atob(token.split(".")[1]));
        const userEmail =
          payload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ];

        const newConnection = new signalR.HubConnectionBuilder()
          .withUrl(
            `https://localhost:7072/chathub?userId=${encodeURIComponent(
              userEmail
            )}`
          )
          .configureLogging(signalR.LogLevel.Information)
          .build();

        try {
          await newConnection.start();
          console.log("Connected to chat");
          setConnected(true);

          await newConnection.invoke("JoinCourseGroup", parseInt(id));
          console.log("Joined group", id);

          await fetchGroupMessages();

          newConnection.on("ReceiveGroupMessage", (senderEmail, payload) => {
            try {
              const parsed = JSON.parse(payload);
              setChatMessages((prev) => [
                ...prev,
                {
                  senderEmail,
                  message: parsed.text || "[No message]",
                  timestamp:
                    parsed.timestamp ||
                    new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
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

      setupChatConnection();

      return () => {
        if (connectionRef.current) {
          connectionRef.current.off("ReceiveGroupMessage");
          connectionRef.current.stop();
          console.log("Connection stopped");
        }
        setConnected(false);
        setMessagesLoaded(false);
      };
    }
  }, [activeTab, id]);

  const sendMessage = async () => {
    if (!chatInput.trim() && !selectedFile) return;

    const token = localStorage.getItem("Token");
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userEmail =
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ];

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("CourseId", parseInt(id));
      formData.append("SenderEmail", userEmail);
      formData.append("Message", chatInput);

      if (selectedFile) {
        formData.append("File", selectedFile);
      }

      const response = await fetch(
        "https://localhost:7072/Chat/SendGroupMessage/send-group",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setChatInput("");
      setSelectedFile(null);
      setFilePreview(null);
    } catch (err) {
      console.error("Error sending message:", err);
      Swal.fire({
        icon: "error",
        title: "Send Failed",
        text: "Could not send message. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getUserFromToken = () => {
    const token = localStorage.getItem("Token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
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
      console.error("Invalid token:", err);
      return null;
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await fetch(
        `https://localhost:7072/api/Post/getAllComments?postId=${postId}`
      );
      const data = await res.json();
      setComments((prev) => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  };

  const toggleComments = async (postId) => {
    setCommentBoxes((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!comments[postId]) await fetchComments(postId);
  };

  const handleAddComment = async (postId) => {
    const user = getUserFromToken();
    if (!user) return alert("You must be logged in to comment.");

    const commentText = newComment[postId];
    if (!commentText || commentText.trim() === "") {
      alert("Please write a comment.");
      return;
    }

    const formData = new FormData();
    formData.append("Content", commentText);
    formData.append("PostId", postId);
    formData.append("CommenterId", user.id);

    try {
      const res = await fetch("https://localhost:7072/api/Post/addComment", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to add comment:", errorText);
        return alert("Failed to add comment.");
      }

      setNewComment((prev) => ({ ...prev, [postId]: "" }));
      await fetchComments(postId);
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("An error occurred while adding the comment.");
    }
  };

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await fetch("https://localhost:7072/Subjects/GetSubjects");
        const data = await res.json();
        const found = data.find((s) => s.id === parseInt(id));
        setSubject(found);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching subject:", err);
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await fetch(
          `https://localhost:7072/api/Post/getAllPosts/${id}`
        );
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    fetchSubject();
    fetchPosts();
  }, [id]);

  useEffect(() => {
    const fetchExams = async () => {
      const courseId = subject?.id;
      if (!courseId) return;

      setExamsLoading(true);
      try {
        const res = await fetch(
          `https://localhost:7072/Exams/GetCourseExams/${courseId}`
        );
        const data = await res.json();
        setExams(data);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setExams([]);
      } finally {
        setExamsLoading(false);
      }
    };

    if (activeTab === "Exams & Quizzes" && subject) fetchExams();
  }, [activeTab, subject]);

  const examTypeLabel = (type) =>
    ["Final", "Midterm", "Practical", "Quiz", "Assigment"][type];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Posts":
        return (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Recent Posts</h3>
            <div className={styles.postsGrid}>
              {posts.length === 0 ? (
                <div className={styles.emptyState}>
                  <FileText size={48} />
                  <p>No posts available for this subject yet.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <article key={post.id} className={styles.postCard}>
                    <div className={styles.postBody}>
                      <h4>{post.title}</h4>
                      {post.image && (
                        <img
                          src={`data:image/jpeg;base64,${post.image}`}
                          alt={post.title}
                          className={styles.postImage}
                        />
                      )}
                      <p>{post.content}</p>
                    </div>
                    <div className={styles.postFooter}>
                      <button
                        onClick={() => toggleComments(post.id)}
                        className={styles.commentBtn}
                      >
                        <MessageCircle size={16} />
                        <span>Comment</span>
                      </button>
                    </div>
                    {commentBoxes[post.id] && (
                      <div className={styles.commentsContainer}>
                        <div className={styles.commentsList}>
                          {comments[post.id]?.map((cmt) => (
                            <div key={cmt.id} className={styles.commentCard}>
                              <div className={styles.commentHeader}>
                                <div className={styles.userAvatar}>
                                  {userCache[cmt.commenterId]?.charAt(0) || "U"}
                                </div>
                                <div>
                                  <strong className={styles.userName}>
                                    {userCache[cmt.commenterId] ||
                                      "Unknown User"}
                                  </strong>
                                  <div className={styles.commentTime}>
                                    {new Date(cmt.sentAt).toLocaleString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </div>
                                </div>
                              </div>
                              <p className={styles.commentContent}>
                                {cmt.content}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className={styles.addCommentContainer}>
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment[post.id] || ""}
                            onChange={(e) =>
                              setNewComment((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            className={styles.commentInput}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className={styles.commentSubmitBtn}
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
        );

      case "Material":
        return (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Course Materials</h3>

            {materialsLoading ? (
              <p>Loading materials...</p>
            ) : materials.length === 0 ? (
              <div className={styles.emptyState}>
                <BookOpen size={48} />
                <p>No materials uploaded for this course yet.</p>
              </div>
            ) : (
              <ul className={styles.materialList}>
                {materials.map((mat) => (
                  <li key={mat.id} className={styles.materialCard}>
                    <div className={styles.materialHeader}>
                      <FiFileText size={24} className={styles.materialIcon} />
                      <div>
                        <h4 className={styles.materialTitle}>{mat.name}</h4>
                        <p className={styles.uploadDate}>
                          Uploaded at:{" "}
                          {new Date(mat.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className={styles.materialActions}>
                      {mat.file && (
                        <a
                          href={`data:application/octet-stream;base64,${mat.file}`}
                          download={`${mat.name}.zip`}
                          className={styles.downloadBtn}
                        >
                          <FiDownload style={{ marginRight: "8px" }} />
                          Download
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      case "Exams & Quizzes":
        return (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Assessments</h3>
            {examsLoading ? (
              <p>Loading exams...</p>
            ) : exams.length === 0 ? (
              <div className={styles.emptyState}>
                <ClipboardList size={48} />
                <p>No exams or quizzes available.</p>
              </div>
            ) : (
              <ul className={styles.examList}>
                {exams.map((exam) => (
                  <li key={exam.id} className={styles.examItem}>
                    <File size={20} />
                    <div>
                      <strong>{exam.description}</strong>
                      <div>Duration: {exam.duration} mins</div>
                      <div>Grade: {exam.grade}</div>
                      <div>Type: {examTypeLabel(exam.type)}</div>
                    </div>
                    <button
                      className={styles.startButton}
                      onClick={async () => {
                        const student = getUserFromToken();
                        const studentId = student?.id;
                        if (!studentId) {
                          alert("Student ID is missing!");
                          return;
                        }

                        try {
                          const res = await fetch(
                            `https://localhost:7072/Answer/InitExamAnss?examId=${exam.id}&studentId=${studentId}`,
                            { method: "POST" }
                          );

                          if (res.ok) {
                            navigate(`/exam/${exam.id}`, { state: { exam } });
                          } else if (res.status === 500) {
                            Swal.fire({
                              icon: "error",
                              title: "Already Attempted",
                              text: "You have already taken this exam and cannot retake it.",
                            });
                          } else {
                            Swal.fire({
                              icon: "error",
                              title: "Failed",
                              text: "Failed to initialize exam.",
                            });
                          }
                        } catch (err) {
                          console.error(
                            "Error initializing exam answers:",
                            err
                          );
                          Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "An unexpected error occurred while starting the exam.",
                          });
                        }
                      }}
                    >
                      Start
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      case "Chat":
        return (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Class Chat</h3>
            {!connected ? (
              <p>Connecting to chat...</p>
            ) : (
              <div className={styles.chatContainer}>
                <div className={styles.chatHeader}>
                  <div className={styles.chatSubjectInfo}>
                    <BookOpen size={20} />
                    <span>{subject?.name || "Subject Chat"}</span>
                  </div>
                  <div className={styles.onlineIndicator}>
                    <div className={styles.onlineDot} />
                    <span>Online</span>
                  </div>
                </div>

                <div className={styles.chatMessages} ref={messagesEndRef}>
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`${styles.message} ${
                        msg.senderEmail === userEmail
                          ? styles.sent
                          : styles.received
                      }`}
                    >
                      <div className={styles.messageHeader}>
                        <span className={styles.senderName}>
                          {msg.senderEmail === userEmail
                            ? "You"
                            : msg.senderEmail.split("@")[0]}
                        </span>
                        <span className={styles.messageTime}>
                          {msg.timestamp}
                        </span>
                      </div>

                      {msg.message && (
                        <div className={styles.messageText}>{msg.message}</div>
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
                              <FiFileText className={styles.fileIcon} />
                              <span>{msg.fileName}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className={styles.chatInputArea}>
                  {filePreview && (
                    <div className={styles.filePreview}>
                      <img
                        src={filePreview}
                        alt="Preview"
                        className={styles.previewImage}
                      />
                      <button
                        onClick={removeFile}
                        className={styles.removePreview}
                      >
                        &times;
                      </button>
                    </div>
                  )}

                  {selectedFile && !filePreview && (
                    <div className={styles.filePreview}>
                      <FiFileText className={styles.fileIconLarge} />
                      <span className={styles.fileName}>
                        {selectedFile.name}
                      </span>
                      <button
                        onClick={removeFile}
                        className={styles.removePreview}
                      >
                        &times;
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
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    />

                    <div className={styles.chatActions}>
                      <label
                        htmlFor="file-upload"
                        className={styles.attachButton}
                      >
                        <FiPaperclip size={20} />
                        <input
                          id="file-upload"
                          type="file"
                          onChange={handleFileChange}
                          className={styles.fileInput}
                          accept="image/*, .pdf, .doc, .docx, .txt"
                        />
                      </label>

                      <button
                        onClick={sendMessage}
                        disabled={isUploading}
                        className={styles.sendButton}
                      >
                        {isUploading ? (
                          <div className={styles.spinner} />
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
        );

      case "Grades":
        return (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Your Grades</h3>
            {exams.filter((exam) => exam.gradeIsSeen).length === 0 ? (
              <div className={styles.emptyState}>
                <File size={48} />
                <p>No exams graded yet.</p>
              </div>
            ) : (
              <ul className={styles.examList}>
                {exams
                  .filter((exam) => exam.gradeIsSeen)
                  .map((exam) => (
                    <ExamGradeItem
                      key={exam.id}
                      exam={exam}
                      studentId={studentId}
                    />
                  ))}
              </ul>
            )}
          </div>
        );
      default:
        return (
          <div className={styles.tabContent}>
            <p>Select a section above to view its content.</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.headerSpacer}></div>

      <div className={styles.subjectHeader}>
        <div className={styles.subjectInfo}>
          <h1 className={styles.subjectTitle}>
            {loading
              ? "Loading..."
              : subject
              ? subject.name
              : "Subject Not Found"}
          </h1>
        </div>

        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`${styles.tab} ${
                activeTab === tab.name ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab(tab.name)}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>{renderTabContent()}</div>
    </div>
  );
};

export default SubjectPage;

const ExamGradeItem = ({ exam, studentId }) => {
  if (!exam.gradeIsSeen) return null;

  const [grade, setGrade] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentAnswers = async () => {
      try {
        const res = await fetch(
          `https://localhost:7072/Exams/GetStudentExam?studentId=${studentId}&examId=${exam.id}`
        );
        const data = await res.json();
        const total = data.reduce((sum, ans) => sum + ans.grade, 0);
        setGrade(total);
      } catch (err) {
        console.error("Error fetching exam answers:", err);
        setGrade(null);
      }
    };

    fetchStudentAnswers();
  }, [exam.id, studentId]);

  const examTypeLabel = (type) =>
    ["Final", "Midterm", "Practical", "Quiz", "Assignment"][type];

  return (
    <li className={styles.examItem}>
      <File size={20} />
      <div className={styles.examContent}>
        <strong>{exam.description}</strong>
        <div>Type: {examTypeLabel(exam.type)}</div>
        <div>Grade: {grade !== null ? grade : "Loading..."}</div>
        <div className={styles.gradeStatus}>
          {exam.gradeIsSeen ? "✓ Grade Available" : "Pending"}
        </div>

        <div className={styles.buttonRow}>
          <button
            className={styles.reviewButton}
            onClick={() =>
              navigate(`/exam-review/${exam.id}`, {
                state: { examId: exam.id, studentId: studentId },
              })
            }
          >
            Review Answers
          </button>
        </div>
      </div>
    </li>
  );
};

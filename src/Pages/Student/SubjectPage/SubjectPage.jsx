import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import { FiFileText, FiDownload } from "react-icons/fi";

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

  const tabs = [
    { name: "Posts", icon: <FileText size={18} /> },
    { name: "Material", icon: <BookOpen size={18} /> },
    { name: "Exams & Quizzes", icon: <ClipboardList size={18} /> },
    { name: "Grades", icon: <File size={18} /> },
    { name: "Chat", icon: <MessageCircle size={18} /> },
  ];

  useEffect(() => {
    const token = localStorage.getItem("Token");

    const base64Payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(base64Payload));
    const studentId =
      decodedPayload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ];
    setStudentId(studentId);
    if (!token) {
      navigate("/login/signin");
      return;
    }
  }, [navigate]);

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
    const token = localStorage.getItem("Token");
    if (!token || !id) return;

    const payload = JSON.parse(atob(token.split(".")[1]));
    const userEmail =
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ];

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://localhost:7072/chathub?userId=${encodeURIComponent(userEmail)}`
      )
      .configureLogging(signalR.LogLevel.Information)
      .build();

    setConnection(newConnection);

    fetchGroupMessages();

    newConnection
      .start()
      .then(() => {
        console.log("Connected to chat");
        setConnected(true);
        return newConnection.invoke("JoinCourseGroup", parseInt(id));
      })
      .then(() => {
        console.log("Joined group", id);
      })
      .catch((err) => console.error("Connection error:", err));

    newConnection.on(
      "ReceiveGroupMessage",
      (senderEmail, message, timestamp) => {
        setChatMessages((prev) => [
          ...prev,
          { senderEmail, message, timestamp },
        ]);
      }
    );

    return () => {
      newConnection.stop();
    };
  }, [id]);

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
        timestamp: new Date(msg.sentAt).toLocaleTimeString(),
      }));

      setChatMessages(formatted);
      setMessagesLoaded(true);
    } catch (err) {
      console.error("Error fetching group messages:", err);
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return alert("Please enter a message.");
    if (!connection) return alert("Not connected yet.");

    const token = localStorage.getItem("Token");
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userEmail =
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ];

    connection
      .invoke("SendMessageToCourse", parseInt(id), userEmail, chatInput)
      .then(() => setChatInput(""))
      .catch((err) => {
        console.error("Send error:", err);
        alert("Error sending message.");
      });
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
  const fetchCommentsWithUsers = async (postId) => {
    try {
      console.log(`Fetching comments for postId: ${postId}...`);
      const res = await fetch(
        `https://localhost:7072/api/Post/getAllComments?postId=${postId}`
      );
      const data = await res.json();
      console.log(`Comments fetched:`, data);

      console.log("Fetching all students from GetAllByRole (role=3)...");
      const usersRes = await fetch(
        `https://localhost:7072/api/Account/GetAllByRole?role=3`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      );
      const usersData = await usersRes.json();
      console.log(`Students fetched:`, usersData.students);

      const userMap = {};
      for (const user of usersData.students || []) {
        userMap[user.id] = user.name;
      }

      console.log("Built user cache:", userMap);

      setUserCache(userMap);
      setComments((prev) => ({ ...prev, [postId]: data }));
      console.log(`Comments + userCache updated for postId: ${postId}`);
    } catch (err) {
      console.error("yError loading comments or users:", err);
    }
  };

  const toggleComments = async (postId) => {
    setCommentBoxes((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!comments[postId]) await fetchCommentsWithUsers(postId);
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
      await fetchCommentsWithUsers(postId);
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
    ["Final", "Midterm", "Practical", "Quiz"][type] || "Unknown";

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
                    {comments[post.id]?.map((cmt) => (
                      <div key={cmt.id} className={styles.comment}>
                        <img
                          src="/default-user.png"
                          alt="User"
                          className={styles.commentUserImg}
                        />
                        <div>
                          <strong>
                            {(() => {
                              return userCache[cmt.id] || "Unknown";
                            })()}
                          </strong>
                          <p>{cmt.content}</p>
                        </div>
                      </div>
                    ))}
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
              <>
                <div className={styles.chatBox}>
                  <ul className={styles.chatMessages}>
                    {chatMessages.map((msg, idx) => (
                      <li key={idx}>
                        <strong>{msg.senderEmail}</strong>: {msg.message}{" "}
                        <span className={styles.chatTime}>
                          [{msg.timestamp}]
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.chatInputArea}>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Write a message..."
                      className={styles.chatInput}
                    />
                    <button
                      onClick={sendMessage}
                      className={styles.chatSendButton}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case "Grades":
        return (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Your Grades</h3>
            {exams.length === 0 ? (
              <div className={styles.emptyState}>
                <File size={48} />
                <p>No exams graded yet.</p>
              </div>
            ) : (
              <ul className={styles.examList}>
                {exams.map((exam) => (
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
    ["Final", "Midterm", "Practical", "Quiz"][type] || "Unknown";

  return (
    <li className={styles.examItem}>
      <File size={20} />
      <div>
        <strong>{exam.description}</strong>
        <div>Type: {examTypeLabel(exam.type)}</div>
        <div>Grade: {grade !== null ? grade : "Loading..."}</div>
        <div className={styles.gradeStatus}>
          {exam.gradeIsSeen ? "✓ Grade Available" : "Pending"}
        </div>

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
    </li>
  );
};

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  BookOpen,
  FileText,
  ClipboardList,
  MessageCircle,
  File,
} from "lucide-react";
import Header from "../../../components/student/Header/Header";
import styles from "./SubjectPage.module.css";
import { useNavigate } from "react-router-dom";
const SubjectPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Posts");
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const navigate = useNavigate();
  const tabs = [
    { name: "Posts", icon: <FileText size={18} /> },
    { name: "Material", icon: <BookOpen size={18} /> },
    { name: "Exams & Quizzes", icon: <ClipboardList size={18} /> },
    { name: "Grades", icon: <File size={18} /> },
    { name: "Chat", icon: <MessageCircle size={18} /> },
  ];
  useEffect(() => {
    const token = sessionStorage.getItem("Token");
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

    if (role !== "Student") {
      navigate("/login/signin");
    }
  }, [navigate]);
  
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await fetch("https://localhost:7072/Subjects/GetSubjects");
        const data = await res.json();
        const found = data.find((s) => s.id === parseInt(id));
        setSubject(found);
        setLoading(false);
        console.log("Fetched subject:", found);
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
        console.log("Fetched exams:", data);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setExams([]);
      } finally {
        setExamsLoading(false);
      }
    };

    if (activeTab === "Exams & Quizzes" && subject) {
      fetchExams();
    }
  }, [activeTab, subject]);
  const examTypeLabel = (type) => {
    switch (type) {
      case 0:
        return "Final";
      case 1:
        return "Midterm";
      case 2:
        return "Practical";
      case 3:
        return "Quiz";
      default:
        return "Unknown";
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Posts":
        return (
          <div className={styles.tabContent}>
            <div className={styles.postsHeader}>
              <h3 className={styles.tabTitle}>Recent Posts</h3>
            </div>
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
                      <h4 className={styles.postTitle}>{post.title}</h4>
                      {post.image && (
                        <div className={styles.postImageContainer}>
                          <img
                            src={`data:image/jpeg;base64,${post.image}`}
                            alt={post.title}
                            className={styles.postImage}
                          />
                        </div>
                      )}
                      <p className={styles.postContent}>{post.content}</p>
                    </div>
                    <div className={styles.postFooter}>
                      <button className={styles.commentBtn}>
                        <MessageCircle size={16} />
                        <span>Comment</span>
                      </button>
                    </div>
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
            <div className={styles.emptyState}>
              <BookOpen size={48} />
              <p>Course materials will be available here.</p>
            </div>
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
                      <div>Type: {examTypeLabel(exam.type)}</div>{" "}
                    </div>
                    <button
                      className={styles.startButton}
                      onClick={async () => {
                        // const studentId = localStorage.getItem("studentId");
                        const studentId = 1;
                        if (!studentId) {
                          alert("Student ID is missing!");
                          return;
                        }

                        try {
                          const res = await fetch(
                            `https://localhost:7072/Answer/InitExamAnss?examId=${exam.id}&studentId=${studentId}`,
                            {
                              method: "POST",
                            }
                          );

                          if (res.ok) {
                            console.log("Initialized answers successfully");
                            navigate(`/exam/${exam.id}`, { state: { exam } });
                          } else {
                            alert("Failed to initialize answers.");
                          }
                        } catch (err) {
                          console.error(
                            "Error initializing exam answers:",
                            err
                          );
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
            <h3 className={styles.tabTitle}>Class Discussion</h3>
            <div className={styles.emptyState}>
              <MessageCircle size={48} />
              <p>Join the class discussion here.</p>
            </div>
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

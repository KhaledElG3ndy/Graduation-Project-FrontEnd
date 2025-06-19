import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, FileText, ClipboardList, MessageCircle } from "lucide-react";
import Header from "../../../components/student/Header/Header";
import styles from "./SubjectPage.module.css";

const SubjectPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Posts");
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  const tabs = [
    { name: "Posts", icon: <FileText size={18} /> },
    { name: "Material", icon: <BookOpen size={18} /> },
    { name: "Exams & Quizzes", icon: <ClipboardList size={18} /> },
    { name: "Chat", icon: <MessageCircle size={18} /> },
  ];

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
                      <button
                        className={styles.commentBtn}
                        onClick={() => {
                        }}
                      >
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
            <div className={styles.emptyState}>
              <ClipboardList size={48} />
              <p>Exams and quizzes will appear here.</p>
            </div>
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

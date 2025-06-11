import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Subjects.module.css";
import Header from "../../../components/Professor/Header/Header";
import Footer from "../../../components/Professor/Footer/Footer";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(
          "https://localhost:7072/Subjects/GetSubjects"
        );
        if (!response.ok) throw new Error("Failed to fetch subjects");
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleAddClick = (subjectName) => {
    navigate(`/Professor/CreateChannel?subject=${subjectName}`);
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.channelsPage}>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Available Subjects</h1>
            <p className={styles.subtitle}>
              Explore and manage your academic subjects
            </p>
          </div>

          <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
              <svg
                className={styles.searchIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path D="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Search subjects..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Loading subjects...</p>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {filteredSubjects.map((subject, index) => (
                <div
                  key={subject.id || index}
                  className={styles.card}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.subjectIcon}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                    </div>
                    <h3 className={styles.subjectName}>{subject.name}</h3>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.hoursInfo}>
                      <svg
                        className={styles.clockIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                      </svg>
                      <span className={styles.hours}>
                        {subject.hours} Hours
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.addButton}
                      onClick={() => handleAddClick(subject.name)}
                    >
                      <svg
                        className={styles.buttonIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Create Channel
                    </button>
                  </div>

                  <div className={styles.cardOverlay}></div>
                </div>
              ))}
            </div>

            {filteredSubjects.length === 0 && !loading && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path D="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
                <h3>No subjects found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Subjects;

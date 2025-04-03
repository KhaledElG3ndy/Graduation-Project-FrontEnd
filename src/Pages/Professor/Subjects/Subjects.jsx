import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Subjects.module.css";
import Header from "../../../components/Professor/Header/Header";
import Footer from "../../../components/Professor/Footer/Footer";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className={styles.channelsPage}>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Available Subjects</h1>

        {loading ? (
          <p className={styles.loading}>Loading subjects...</p>
        ) : (
          <div className={styles.grid}>
            {subjects.map((subject) => (
              <div key={subject.id} className={styles.card}>
                <h2 className={styles.subjectName}>{subject.name}</h2>
                <p className={styles.hours}>Hours: {subject.hours}</p>
                <button
                  className={styles.viewButton}
                  onClick={() => handleAddClick(subject.name)}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Subjects;

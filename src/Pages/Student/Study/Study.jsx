import React, { useEffect, useState } from "react";
import { FaBookOpen, FaClock } from "react-icons/fa";
import Header from "../../../components/student/Header/Header";
import styles from "./Study.module.css";
import { useNavigate } from "react-router-dom";

const Study = () => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [subjectRes, departmentRes] = await Promise.all([
          fetch("https://localhost:7072/Subjects/GetSubjects"),
          fetch("https://localhost:7072/Departments/GetDepartments"),
        ]);

        if (!subjectRes.ok || !departmentRes.ok)
          throw new Error("Failed to fetch data");

        const subjectsData = await subjectRes.json();
        const departmentsData = await departmentRes.json();

        const subjectsWithDepartments = subjectsData.map((subject) => {
          const dep = departmentsData.find(
            (d) => d.id === subject.departmentId
          );
          return {
            ...subject,
            departmentName: dep ? dep.name : "Unknown",
          };
        });

        setSubjects(subjectsWithDepartments);
        setDepartments(departmentsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <h2 className={styles.title}>Your Subjects</h2>

        {loading ? (
          <p className={styles.message}>Loading...</p>
        ) : error ? (
          <p className={styles.error}>Error: {error}</p>
        ) : (
          <div className={styles.cardGrid}>
            {subjects.map((subject) => (
              <div key={subject.id} className={styles.card}>
                {subject.imageUrl && (
                  <img
                    src={
                      subject.imageUrl.startsWith("http")
                        ? subject.imageUrl
                        : `https://localhost:7072${subject.imageUrl}`
                    }
                    alt={subject.name}
                    className={styles.subjectImage}
                  />
                )}

                <div className={styles.header}>
                  <FaBookOpen className={styles.headerIcon} />
                  <span className={styles.subjectTitle}>{subject.name}</span>
                </div>

                <div className={styles.body}>
                  <div className={styles.row}>
                    <strong>Department:</strong> {subject.departmentName}
                  </div>
                  <div className={styles.row}>
                    <FaClock className={styles.icon} />
                    <strong>Hours:</strong> {subject.hours}
                  </div>
                </div>

                <div className={styles.footer}>
                  <button
                    className={styles.button}
                    onClick={() => navigate(`/student/subject/${subject.id}`)}
                  >
                    Start Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Study;

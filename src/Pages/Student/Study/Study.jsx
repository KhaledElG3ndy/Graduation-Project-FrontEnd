import React, { useEffect, useState } from "react";
import { FaBookOpen, FaClock, FaPlus } from "react-icons/fa";
import Header from "../../../components/student/Header/Header";
import styles from "./Study.module.css";
import { useNavigate } from "react-router-dom";

const Study = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (!token) {
      navigate("/login/signin");
      return;
    }

    const parseJwt = (token) => {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        return decoded;
      } catch (e) {
        console.error("Invalid token", e);
        return null;
      }
    };

    const payload = parseJwt(token);
    if (!payload) {
      localStorage.removeItem("Token");
      navigate("/login/signin");
      return;
    }

    if (payload.exp * 1000 < Date.now()) {
      console.warn("Token expired");
      localStorage.removeItem("Token");
      navigate("/login/signin");
      return;
    }

    const role =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (role !== "Student") {
      localStorage.removeItem("Token");
      navigate("/login/signin");
    }
  }, [navigate]);
  
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch("https://localhost:7072/Subjects/GetSubjects");
        if (!res.ok) throw new Error("Failed to fetch subjects");
        const data = await res.json();

        console.log("Fetched subjects:", data);

        setSubjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleSubjectRegistration = () => {
    navigate("/student/subjectRegistration");
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>Your Subjects</h2>
          <button
            className={styles.registerButton}
            onClick={handleSubjectRegistration}
          >
            <FaPlus className={styles.registerIcon} />
            Register for New Subjects
          </button>
        </div>

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
                    <strong>Department:</strong>{" "}
                    {subject.departmentName || "Unknown"}
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

import React, { useEffect, useState } from "react";
import styles from "./SubjectRegistration.module.css";
import Header from "../../../components/student/Header/Header";
import { useNavigate } from "react-router-dom";

const SubjectRegistration = () => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("Token");

    const base64Payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(base64Payload));
    const studentId =
      decodedPayload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ];

    if (!token) {
      navigate("/login/signin");
      return;
    }

    const fetchAvailableCourses = async () => {
      try {
        const res = await fetch(
          `https://localhost:7072/Staffs/GetAvailableCourses/GetAvailableCourses?id=${studentId}`
        );
        if (!res.ok) throw new Error("Failed to fetch available courses");
        const data = await res.json();

        console.log("Available courses:", data);
        setAvailableCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableCourses();
  }, [navigate]);

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <h2 className={styles.title}>Available Courses</h2>

        {loading ? (
          <p className={styles.message}>Loading...</p>
        ) : error ? (
          <p className={styles.error}>Error: {error}</p>
        ) : availableCourses.length === 0 ? (
          <p className={styles.message}>No available courses at the moment.</p>
        ) : (
          <div className={styles.courseList}>
            {availableCourses.map((course) => (
              <div key={course.courseId} className={styles.courseCard}>
                <h3>Course ID: {course.courseId}</h3>
                {/* Add more course info here if returned by API */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectRegistration;

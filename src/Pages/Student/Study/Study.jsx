import React, { useEffect, useState } from "react";
import { FaBookOpen, FaClock, FaPlus } from "react-icons/fa";
import Header from "../../../components/student/Header/Header";
import styles from "./Study.module.css";
import { useNavigate } from "react-router-dom";

const Study = () => {
  const [courses, setCourses] = useState([]); 
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
        return JSON.parse(atob(token.split(".")[1]));
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
    const fetchRegisteredCourses = async () => {
      try {
        const token = localStorage.getItem("Token");
        if (!token) {
          navigate("/login/signin");
          return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        const studentId =
          payload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];
        if (!studentId) {
          setError("Student ID not found in token");
          setLoading(false);
          return;
        }

        const coursesRes = await fetch(
          `https://localhost:7072/Registeration/GetStudentCourses?id=${studentId}`
        );
        if (!coursesRes.ok)
          throw new Error("Failed to fetch registered courses");
        const registeredCourses = await coursesRes.json();

        const subjectIds = [
          ...new Set(
            registeredCourses.map(
              (course) => course.subject?.id || course.subjectId
            )
          ),
        ].filter((id) => id);

        const subjectsRes = await fetch(
          `https://localhost:7072/Subjects/GetSubjects`
        );
        if (!subjectsRes.ok) throw new Error("Failed to fetch subjects");
        const allSubjects = await subjectsRes.json();

        const combinedData = registeredCourses.map((course) => {
          const subject = allSubjects.find(
            (s) => s.id === (course.subject?.id || course.subjectId)
          );

          return {
            courseId: course.id,
            subjectId: subject?.id,
            name: subject?.name || "Unnamed Subject",
            departmentName: subject?.departmentName || "Unknown",
            hours: subject?.hours || "N/A",
            imageUrl: subject?.imageUrl || "",
            year: course.year,
            semester: course.semester,
          };
        });

        setCourses(combinedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredCourses();
  }, [navigate]);

  const handleSubjectRegistration = () => {
    navigate("/student/subjectRegistration");
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>Your Courses</h2> 
          <button
            className={styles.registerButton}
            onClick={handleSubjectRegistration}
          >
            <FaPlus className={styles.registerIcon} />
            Register for New Subjects
          </button>
        </div>

        {loading ? (
          <p className={styles.message}>Loading courses...</p>
        ) : error ? (
          <p className={styles.error}>Error: {error}</p>
        ) : courses.length === 0 ? (
          <p className={styles.message}>No courses registered yet</p>
        ) : (
          <div className={styles.cardGrid}>
            {courses.map((course) => (
              <div
                key={`${course.courseId}-${course.subjectId}`}
                className={styles.card}
              >
                {course.imageUrl && (
                  <img
                    src={
                      course.imageUrl.startsWith("http")
                        ? course.imageUrl
                        : `https://localhost:7072${course.imageUrl}`
                    }
                    alt={course.name}
                    className={styles.subjectImage}
                  />
                )}

                <div className={styles.header}>
                  <FaBookOpen className={styles.headerIcon} />
                  <span className={styles.subjectTitle}>{course.name}</span>
                </div>

                <div className={styles.body}>
                  <div className={styles.row}>
                    <strong>Department:</strong> {course.departmentName}
                  </div>
                  <div className={styles.row}>
                    <FaClock className={styles.icon} />
                    <strong>Hours:</strong> {course.hours}
                  </div>
                  <div className={styles.row}>
                    <strong>Year:</strong> {course.year}
                  </div>
                  <div className={styles.row}>
                    <strong>Semester:</strong> {course.semester}
                  </div>
                </div>

                <div className={styles.footer}>
                  <button
                    className={styles.button}
                    onClick={() =>
                      navigate(`/student/subject/${course.courseId}`)
                    }
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

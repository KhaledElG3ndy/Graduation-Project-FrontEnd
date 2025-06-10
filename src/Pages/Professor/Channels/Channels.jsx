import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Channels.module.css";
import Header from "../../../components/Professor/Header/Header";

const Channels = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both courses and subjects in parallel
        const [coursesRes, subjectsRes] = await Promise.all([
          fetch("https://localhost:7072/Courses/GetCourses"),
          fetch("https://localhost:7072/Subjects/GetSubjects"),
        ]);

        if (!coursesRes.ok || !subjectsRes.ok) {
          throw new Error("Failed to fetch courses or subjects");
        }

        const coursesData = await coursesRes.json();
        const subjectsData = await subjectsRes.json();

        setCourses(coursesData);
        setSubjects(subjectsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSubjectName = (subjectId) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : "Unknown Subject";
  };

  if (loading) return <p className={styles.loading}>Loading courses...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Available Courses</h1>

        {courses.length === 0 ? (
          <p className={styles.noCourses}>No courses available.</p>
        ) : (
          <div className={styles.courseGrid}>
            {courses.map((course) => (
              <div key={course.id} className={styles.courseCard}>
                <h2 className={styles.courseTitle}>
                  {getSubjectName(course.subjectId)}
                </h2>
                <p className={styles.courseInfo}>
                  Semester: <strong>{course.semester}</strong>
                </p>
                <p className={styles.courseInfo}>
                  Year: <strong>{course.year}</strong>
                </p>
                <Link to={`/course/${course.id}`} className={styles.viewButton}>
                  View Course
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Channels;

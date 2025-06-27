import React, { useEffect, useState } from "react";
import styles from "./SubjectRegistration.module.css";
import Header from "../../../components/student/Header/Header";

const SubjectRegistration = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);
  const fetchAvailableCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("Token");

      const base64Payload = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(base64Payload));
      const studentId =
        decodedPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

      const res = await fetch(
        `https://localhost:7072/Registeration/GetAvailableCourses/GetAvailableCourses?id=${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const courseIds = await res.json();

      const coursePromises = courseIds.map(({ courseId }) =>
        fetch(`https://localhost:7072/Courses/GetCourse/${courseId}`).then(
          (res) => res.json()
        )
      );

      const availableCourses = await Promise.all(coursePromises);

      const subjectsRes = await fetch(
        "https://localhost:7072/Subjects/GetSubjects"
      );
      const subjectsData = await subjectsRes.json();

      setCourses(availableCourses);
      setSubjects(subjectsData);
    } catch (err) {
      console.error("Error fetching available courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
   
    fetchAvailableCourses();
  }, []);
  

  const getSubjectName = (subjectId) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : "Unknown Subject";
  };

  const handleRegister = async (courseId, courseName) => {
    const token = localStorage.getItem("Token");
    setRegistering(courseId);

    const base64Payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(base64Payload));
    const studentId =
      decodedPayload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ];

    try {
      const response = await fetch(
        `https://localhost:7072/Registeration/Register/Register?studentId=${studentId}&courseId=${courseId}`,

        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(`Server error: ${result}`);
      }

      alert(`Successfully registered for ${courseName}!`);
      await fetchAvailableCourses(); 
    } catch (err) {
      console.error("Registration failed:", err.message);
      alert(`Registration failed for ${courseName}:\n${err.message}`);
    } finally {
      setRegistering(null);
    }
  };

  const getSemesterBadgeClass = (semester) => {
    switch (semester) {
      case 1:
        return styles.semesterFall;
      case 2:
        return styles.semesterSpring;
      case 3:
        return styles.semesterSummer;
      default:
        return styles.semesterDefault;
    }
  };

  const getSemesterName = (semester) => {
    switch (semester) {
      case 1:
        return "Fall";
      case 2:
        return "Spring";
      case 3:
        return "Summer";
      default:
        return `Semester ${semester}`;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Loading available courses...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Course Registration</h1>
          <p className={styles.subtitle}>
            Register for your courses for the upcoming semester
          </p>
        </div>

        {courses.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No Courses Available</h3>
            <p className={styles.emptyMessage}>
              There are currently no courses available for registration. Please
              check back later.
            </p>
          </div>
        ) : (
          <div className={styles.coursesGrid}>
            {courses.map((course) => {
              const subjectName = getSubjectName(course.subjectId);
              const isRegistering = registering === course.id;

              return (
                <div key={course.id} className={styles.courseCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.subjectIcon}>
                      {subjectName.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.courseInfo}>
                      <h3 className={styles.subjectName}>{subjectName}</h3>
                      <div className={styles.courseMeta}>
                        <span className={styles.year}>Year {course.year}</span>
                        <span
                          className={`${
                            styles.semesterBadge
                          } ${getSemesterBadgeClass(course.semester)}`}
                        >
                          {getSemesterName(course.semester)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.courseDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>
                          Academic Year:
                        </span>
                        <span className={styles.detailValue}>
                          {course.year}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Semester:</span>
                        <span className={styles.detailValue}>
                          {getSemesterName(course.semester)}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Course ID:</span>
                        <span className={styles.detailValue}>#{course.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <button
                      onClick={() => handleRegister(course.id, subjectName)}
                      disabled={isRegistering}
                      className={`${styles.registerButton} ${
                        isRegistering ? styles.registering : ""
                      }`}
                    >
                      {isRegistering ? (
                        <>
                          <div className={styles.buttonSpinner}></div>
                          Registering...
                        </>
                      ) : (
                        <>
                          <span className={styles.buttonIcon}>✓</span>
                          Register Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default SubjectRegistration;

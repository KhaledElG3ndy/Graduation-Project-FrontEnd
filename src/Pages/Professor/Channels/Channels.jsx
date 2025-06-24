import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Channels.module.css";
import Header from "../../../components/Professor/Header/Header";
import { useNavigate } from "react-router-dom";
const SearchIcon = () => (
  <svg
    className={styles.icon}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
    />
  </svg>
);

const FilterIcon = () => (
  <svg
    className={styles.icon}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V17l-4 4v-6.586a1 1 0 0 0-.293-.707L3.293 7.293A1 1 0 0 1 3 6.586V4Z"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className={styles.iconSmall}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
    />
  </svg>
);

const GraduationCapIcon = () => (
  <svg
    className={styles.iconSmall}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l9-5-9-5-9 5 9 5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
    />
  </svg>
);

const BookIcon = () => (
  <svg
    className={styles.iconMedium}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    className={styles.iconLarge}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const Channels = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
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
      navigate("/login/signin");
      return;
    }

    const role =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (role !== "Professor") {
      navigate("/login/signin");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, subjectsRes] = await Promise.all([
          fetch("https://localhost:7072/Courses/GetCourses"),
          fetch("https://localhost:7072/Subjects/GetSubjects", {
            headers: {
              Accept: "application/json",
            },
          }),
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

  const getSubjectCode = (subjectId) => {
    const subject = subjects.find((s) => s.code && s.id === subjectId);
    return subject
      ? subject.code
      : getSubjectName(subjectId).substring(0, 3).toUpperCase();
  };

  const filteredCourses = courses.filter((course) => {
    const subjectName = getSubjectName(course.subjectId).toLowerCase();
    const matchesSearch = subjectName.includes(searchTerm.toLowerCase());
    const matchesYear =
      selectedYear === "" || course.year.toString() === selectedYear;
    const matchesSemester =
      selectedSemester === "" || course.semester === selectedSemester;

    return matchesSearch && matchesYear && matchesSemester;
  });

  const uniqueYears = [...new Set(courses.map((course) => course.year))].sort(
    (a, b) => b - a
  );
  const uniqueSemesters = [
    ...new Set(courses.map((course) => course.semester)),
  ];

  const handleRetry = () => {
    setError("");
    setLoading(true);
    window.location.reload();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedYear("");
    setSelectedSemester("");
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Loading courses...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <div className={styles.errorIconContainer}>
              <ErrorIcon />
            </div>
            <h3 className={styles.errorTitle}>Oops! Something went wrong</h3>
            <p className={styles.errorMessage}>{error}</p>
            <button onClick={handleRetry} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.pageContainer}>
        <div className={styles.headerSection}>
          <div className={styles.container}></div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.container}>
            <div className={styles.resultsInfo}>
              <p className={styles.resultsText}>
                Showing{" "}
                <span className={styles.resultCount}>
                  {filteredCourses.length}
                </span>
                {filteredCourses.length === 1 ? " course" : " courses"}
                {(searchTerm || selectedYear || selectedSemester) && (
                  <span className={styles.filterInfo}>
                    {" "}
                    matching your filters
                    <button
                      onClick={clearFilters}
                      className={styles.clearButton}
                    >
                      Clear all
                    </button>
                  </span>
                )}
              </p>
            </div>

            {filteredCourses.length === 0 ? (
              <div className={styles.emptyState}>
                <BookIcon />
                <h3 className={styles.emptyTitle}>No courses found</h3>
                <p className={styles.emptyMessage}>
                  {searchTerm || selectedYear || selectedSemester
                    ? "Try adjusting your search criteria or filters"
                    : "No courses are currently available"}
                </p>
                {(searchTerm || selectedYear || selectedSemester) && (
                  <button
                    onClick={clearFilters}
                    className={styles.viewAllButton}
                  >
                    View All Courses
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.courseGrid}>
                {filteredCourses.map((course) => (
                  <div key={course.id} className={styles.courseCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.subjectBadge}>
                        <span className={styles.subjectCode}>
                          {getSubjectCode(course.subjectId)}
                        </span>
                      </div>
                      <BookIcon />
                    </div>

                    <div className={styles.cardContent}>
                      <h3 className={styles.courseTitle}>
                        {getSubjectName(course.subjectId)}
                      </h3>

                      <div className={styles.courseDetails}>
                        <div className={styles.detailItem}>
                          <CalendarIcon />
                          <span className={styles.detailText}>
                            <strong>Semester:</strong> {course.semester}
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <GraduationCapIcon />
                          <span className={styles.detailText}>
                            <strong>Academic Year:</strong> {course.year}
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/course/${course.id}`}
                        className={styles.viewButton}
                      >
                        View Course Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Channels;

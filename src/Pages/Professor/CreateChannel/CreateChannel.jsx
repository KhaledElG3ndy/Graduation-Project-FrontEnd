import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaBook,
  FaCalendarAlt,
  FaGraduationCap,
  FaPlus,
  FaSpinner,
  FaExclamationTriangle,
  FaChevronDown,
} from "react-icons/fa";
import { MdSchool } from "react-icons/md";
import styles from "./CreateChannel.module.css";
import Header from "../../../components/Professor/Header/Header";
import Footer from "../../../components/Professor/Footer/Footer";

const CreateChannel = () => {
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const subjectName = new URLSearchParams(location.search).get("subject");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!semester || !year) {
      setError("All fields are required!");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("SubjectName", subjectName);
    formData.append("Semester", semester);
    formData.append("Year", year);

    console.log("Sending data to API:", Object.fromEntries(formData.entries()));

    try {
      const response = await fetch(
        "https://localhost:7072/Courses/PostCourse",
        {
          method: "POST",
          body: formData,
        }
      );

      const responseData = await response.json().catch(() => null);
      console.log("API Response:", responseData);

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Course created successfully.",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#0066cc",
        }).then(() => {
          navigate("/Professor/Channels");
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: `Failed to create course: ${
            responseData?.message || "Unknown error"
          }`,
          icon: "error",
          confirmButtonText: "Try Again",
          confirmButtonColor: "#dc3545",
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while creating the course.",
        icon: "error",
        confirmButtonText: "Try Again",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.headerIcon}>
              <MdSchool size={40} />
            </div>
            <h1 className={styles.title}>Create New Course</h1>
            <p className={styles.subtitle}>
              Set up a new course channel for your students
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FaBook className={styles.labelIcon} />
                <span className={styles.labelText}>Subject Name</span>
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={subjectName || ""}
                className={`${styles.input} ${styles.disabledInput}`}
                readOnly
                placeholder="Subject name will appear here"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FaCalendarAlt className={styles.labelIcon} />
                <span className={styles.labelText}>Semester</span>
                <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className={styles.input}
                placeholder="Enter semester (1 - 4)"
                min="1"
                max="4"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FaGraduationCap className={styles.labelIcon} />
                <span className={styles.labelText}>Academic Year</span>
                <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={styles.input}
                placeholder="Enter academic year (1 - 4)"
                min="1"
                max="4"
                required
              />
            </div>

            {error && (
              <div className={styles.errorContainer}>
                <FaExclamationTriangle className={styles.errorIcon} />
                <div className={styles.errorText}>{error}</div>
              </div>
            )}

            <button
              type="submit"
              className={`${styles.submitButton} ${
                loading ? styles.loading : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className={styles.spinner} />
                  Creating Course...
                </>
              ) : (
                <>
                  <FaPlus className={styles.buttonIcon} />
                  Create Course
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateChannel;

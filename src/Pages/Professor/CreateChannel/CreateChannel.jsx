import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import styles from "./CreateChannel.module.css";
import Header from "../../../components/Professor/Header/Header";
const CreateChannel = () => {
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const subjectName = new URLSearchParams(location.search).get("subject");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!semester || !year) {
      setError("All fields are required!");
      return;
    }

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
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while creating the course.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  return (
    <>
      <Header />

      <div className={styles.container}>
        <h1>Create New Course</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="subjectName">Subject Name:</label>
            <input
              type="text"
              id="subjectName"
              value={subjectName || ""}
              disabled
              className={styles.disabledInput}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="semester">Semester:</label>
            <input
              type="number"
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="year">Year:</label>
            <input
              type="number"
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Enter year"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitButton}>
            Create 
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateChannel;

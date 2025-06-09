import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import styles from "./AddDepartmentPage.module.css";
import img from "../../../assets/images/AddSubjects.svg";
import Header from "../../../components/Admin/Header/Header";

function AddDepartmentPage() {
  const [departmentName, setDepartmentName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("Name", departmentName);

    try {
      const response = await fetch(
        "https://localhost:7072/Departments/CreateDepartment",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Department added successfully!",
          confirmButtonText: "OK",
        });
        //navigate("/departments");
      } else {
        const errorMessage = await response.text();
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            errorMessage || "An error occurred while adding the department.",
        });
      }
    } catch (error) {
      console.error("Error creating department:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred.",
      });
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <h2 className={styles.title}>Add Department</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <label htmlFor="departmentName" className={styles.label}>
              Department Name
            </label>
            <input
              type="text"
              id="departmentName"
              name="departmentName"
              className={styles.input}
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              required
            />
            <button type="submit" className={styles.button}>
              Add Department
            </button>
          </form>
        </div>
        <div className={styles.imageContainer}>
          <img src={img} alt="Department Visual" className={styles.image} />
        </div>
      </div>
    </>
  );
}

export default AddDepartmentPage;

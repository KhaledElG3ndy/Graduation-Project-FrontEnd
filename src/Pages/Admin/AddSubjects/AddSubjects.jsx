import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import styles from "./AddSubjects.module.css";
import img from "../../../assets/images/AddSubjects.svg";
import Header from "../../../components/Admin/Header/Header";
import { useNavigate } from "react-router-dom";
export default function AddSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newSubject, setNewSubject] = useState({
    name: "",
    hours: "",
    departmentName: "",
  });
  const [loading, setLoading] = useState(false);

  const api_url = "https://localhost:7072/Subjects";
  const department_url = "https://localhost:7072/Departments";
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

    if (role !== "Admin") {
      navigate("/login/signin");
    }
  }, [navigate]);
  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${api_url}/GetSubjects`);
      if (!response.ok) throw new Error("Failed to fetch subjects.");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error fetching subjects!",
      });
      console.error(error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${department_url}/GetDepartments`);
      if (!response.ok) throw new Error("Failed to fetch departments.");
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error fetching departments!",
      });
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setNewSubject({ ...newSubject, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newSubject.name);
      formData.append("hours", parseInt(newSubject.hours, 10));
      formData.append("departmentName", newSubject.departmentName);

      const response = await fetch(`${api_url}/CreateSubject`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add subject.");
      }

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Subject added successfully!",
      });

      fetchSubjects();
      setNewSubject({ name: "", hours: "", departmentName: "" });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
      });
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.leftSection}>
            <div className={styles.card}>
              <h2 className={styles.title}>Add Subject</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <input
                  type="text"
                  name="name"
                  placeholder="Subject Name"
                  value={newSubject.name}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
                <input
                  type="number"
                  name="hours"
                  placeholder="Hours"
                  value={newSubject.hours}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
                <select
                  name="departmentName"
                  value={newSubject.departmentName}
                  onChange={handleChange}
                  className={styles.input}
                  required
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className={styles.button}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Add Subject"}
                </button>
              </form>
            </div>
          </div>

          <div className={styles.rightSection}>
            <img src={img} alt="Illustration" className={styles.bgImage} />
            <p className={styles.rightText}>
              Manage your subjects efficiently!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

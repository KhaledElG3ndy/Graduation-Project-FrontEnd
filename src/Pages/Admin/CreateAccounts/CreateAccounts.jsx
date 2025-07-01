import React, { useState, useEffect } from "react";
import styles from "./CreateAccounts.module.css";
import {
  FaUserGraduate,
  FaPhone,
  FaIdCard,
  FaTransgender,
  FaCalendar,
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import Header from "../../../components/Admin/Header/Header";

const CreateStudentAccount = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");
  const [year, setYear] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [role, setRole] = useState("student");
  const [departments, setDepartments] = useState([]);

  const [excelFile, setExcelFile] = useState(null);
  const [excelRole, setExcelRole] = useState("student");
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7072/Departments/GetDepartments"
        );
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !phoneNumber || !nationalId) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Data",
        text: "Please fill in all required fields.",
      });
      return;
    }

    const formData = new FormData();

    formData.append("FirstName", firstName);
    formData.append("LastName", lastName);
    formData.append("Name", `${firstName} ${lastName}`);
    formData.append("PhoneNumber", phoneNumber);
    formData.append("NationalId", nationalId);
    formData.append("Gender", gender === "Male" ? "true" : "false");

    if (role === "student") {
      formData.append("Year", year.toString());
      formData.append("DepartmentId", parseInt(departmentId || "1"));
    } else {
      formData.append("Year", "1");
      formData.append("DepartmentId", "1");
    }

    const roleMap = {
      student: 3,
      professor: 1,
    };

    try {
      Swal.fire({
        title: "Creating account...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      console.log(`Bearer ${localStorage.getItem("Token")}`);

      await axios.post(
        `https://localhost:7072/api/Account/AddAccount?role=${roleMap[role]}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Account created successfully!",
      });

      setFirstName("");
      setLastName("");
      setGender("Male");
      setYear(1);
      setPhoneNumber("");
      setNationalId("");
      setDepartmentId("");
      setRole("student");
    } catch (error) {
      let errorMessage = "Creation failed. Please try again.";

      if (
        error.response &&
        error.response.status === 400 &&
        typeof error.response.data === "string"
      ) {
        errorMessage = error.response.data;
      }

      Swal.fire({
        icon: "error",
        title: "Creation Failed",
        text: errorMessage,
      });

      console.error("Error creating account:", error);
    }
  };
  const handleExcelUpload = async () => {
    if (!excelFile) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please upload an Excel file before submitting.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile);

    try {
      Swal.fire({
        title: "Uploading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await axios.post(
        "https://localhost:7072/api/Account/AddByExcel",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Accounts uploaded successfully!",
      });

      setExcelFile(null);
      document.getElementById("excelInput").value = ""; 
    } catch (error) {
      let errorMessage = "Upload failed. Please try again.";

      if (
        error.response &&
        error.response.status === 400 &&
        typeof error.response.data === "string"
      ) {
        errorMessage = error.response.data;
      }

      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: errorMessage,
      });

      console.error("Error uploading Excel:", error);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [0, 1, 2, 3].map((offset) => currentYear - offset);

  return (
    <>
      <Header />

      <div className={styles.container}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>
          Fill out the form below to create a new account.
        </p>
        <div className={styles.roleSelection}>
          <label>
            <input
              type="radio"
              value="student"
              checked={role === "student"}
              onChange={() => setRole("student")}
            />
            Student
          </label>
          <label>
            <input
              type="radio"
              value="professor"
              checked={role === "professor"}
              onChange={() => setRole("professor")}
            />
            Professor / TA
          </label>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.inputWithIcon}>
              <FaUserGraduate className={styles.icon} />
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className={styles.inputHalfWidth}
              />
            </div>
            <div className={styles.inputWithIcon}>
              <FaUserGraduate className={styles.icon} />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className={styles.inputHalfWidth}
              />
            </div>
          </div>

          <div className={styles.inputWithIcon}>
            <FaPhone className={styles.icon} />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className={styles.inputFullWidth}
            />
          </div>

          <div className={styles.inputWithIcon}>
            <FaIdCard className={styles.icon} />
            <input
              type="text"
              placeholder="National ID"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              required
              className={styles.inputFullWidth}
            />
          </div>

          <div className={styles.inputWithIcon}>
            <FaTransgender className={styles.icon} />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={styles.inputFullWidth}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {role === "student" && (
            <>
              <div className={styles.inputWithIcon}>
                <FaCalendar className={styles.icon} />
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className={styles.inputFullWidth}
                  required
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputWithIcon}>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                  className={styles.inputFullWidth}
                >
                  <option value="">Select Department</option>
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button type="submit" className={styles.button}>
            Create Account
          </button>
        </form>

        <div className={styles.separator}></div>
        <div className={styles.excelUploadSection}>
          <h2>Import Accounts from Excel</h2>

          <div className={styles.fileInputRow}>
            <label className={styles.fileLabel}>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setExcelFile(e.target.files[0])}
                className={styles.fileInput}
              />
              {excelFile ? excelFile.name : "Choose Excel File"}
            </label>
            <button onClick={handleExcelUpload} className={styles.uploadButton}>
              Upload Excel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateStudentAccount;

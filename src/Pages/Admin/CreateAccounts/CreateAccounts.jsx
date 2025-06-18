import React, { useState, useEffect } from "react";
import styles from "./CreateAccounts.module.css";
import { FaUser, FaPhone, FaIdCard, FaCalendar } from "react-icons/fa";
import Header from "../../../components/Student/Header/Header";
import { useDarkMode } from "../../../contexts/ThemeContext";

const CreateStudentAccount = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [year, setYear] = useState(1);
  const [departmentId, setDepartmentId] = useState("");
  const [role, setRole] = useState("student");
  const [excelFile, setExcelFile] = useState(null);
  const [excelRole, setExcelRole] = useState("student");

  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? "#121212" : "#f5f5f5";
  }, [isDarkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !nationalId ||
      (role === "student" && (!year || !departmentId))
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("FirstName", firstName);
    formData.append("LastName", lastName);
    formData.append("Name", `${firstName} ${lastName}`);
    formData.append("PhoneNumber", phoneNumber);
    formData.append("NationalId", nationalId);
    formData.append("Gender", gender); 

    if (role === "student") {
      formData.append("Year", year.toString());
      formData.append("DepartmentId", departmentId);
    }

   
    const url = `https://localhost:7072/api/Account/AddAccount?role=${
      role === "student" ? 3 : 1
    }`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        throw new Error(`Failed to create account: ${errorResponse}`);
      }

      const result = await response.json();
      alert("Account created successfully! Use generated credentials to login");
    } catch (error) {
      console.error("Error:", error.message);
      alert(`Error: ${error.message}`);
    }
  };
  

  const handleExcelChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleExcelSubmit = async () => {
    if (!excelFile) {
      alert("Please select an Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("ExcelFile", excelFile);
    formData.append("role", excelRole === "student" ? 0 : 1);

    try {
      const response = await fetch(
        "https://localhost:7072/api/Account/AddByExcel",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upload failed: ${error}`);
      }

      alert(
        "Accounts added successfully! Users can login with generated credentials"
      );
    } catch (error) {
      console.error("Error uploading Excel file:", error.message);
      alert("Failed to upload Excel file");
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h2 className={styles.title}>Create Student & Staff Account</h2>
        <p className={styles.subtitle}>
          Fill out the form below to create a new student or staff account.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
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
                value="staff"
                checked={role === "staff"}
                onChange={() => setRole("staff")}
              />
              Staff
            </label>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputWithIcon}>
              <FaUser className={styles.icon} />
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputWithIcon}>
              <FaUser className={styles.icon} />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className={styles.input}
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
            <label>Gender</label>
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  value="Male"
                  checked={gender === "Male"}
                  onChange={() => setGender("Male")}
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  value="Female"
                  checked={gender === "Female"}
                  onChange={() => setGender("Female")}
                />
                Female
              </label>
            </div>
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
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>

              <div className={styles.inputWithIcon}>
                <input
                  type="number"
                  placeholder="Department ID"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                  className={styles.inputFullWidth}
                />
              </div>
            </>
          )}

          <button type="submit" className={styles.submitButton}>
            Create Account
          </button>
        </form>

        <div className={styles.excelUploadSection}>
          <h3>Upload Excel File</h3>

          <div className={styles.roleSelection}>
            <label>
              <input
                type="radio"
                value="student"
                checked={excelRole === "student"}
                onChange={() => setExcelRole("student")}
              />
              Student Accounts
            </label>
            <label>
              <input
                type="radio"
                value="staff"
                checked={excelRole === "staff"}
                onChange={() => setExcelRole("staff")}
              />
              Staff Accounts
            </label>
          </div>

          <div className={styles.fileInputRow}>
            <div className={styles.fileInputWrapper}>
              <label htmlFor="excelUpload" className={styles.fileLabel}>
                {excelFile ? excelFile.name : "Choose Excel File"}
              </label>
              <input
                id="excelUpload"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelChange}
                className={styles.fileInput}
              />
            </div>

            <button
              type="button"
              onClick={handleExcelSubmit}
              className={styles.uploadButton}
              disabled={!excelFile}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateStudentAccount;

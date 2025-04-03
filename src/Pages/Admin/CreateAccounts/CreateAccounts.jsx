import React, { useState, useEffect } from "react";
import styles from "./CreateAccounts.module.css";
import { FaUser, FaPhone, FaIdCard, FaCalendar } from "react-icons/fa";
import Header from "../../../components/Student/Header/Header";
import { useDarkMode } from "../../../contexts/ThemeContext";

const CreateStudentAccount = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [year, setYear] = useState(1);
  const [departmentId, setDepartmentId] = useState("");
  const [role, setRole] = useState("student");

  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? "#121212" : "#f5f5f5";
  }, [isDarkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("name", `${firstName} ${lastName}`);
    formData.append("gender", gender); 
    formData.append("phoneNumber", phoneNumber);
    formData.append("nationalId", nationalId);



    if (role === "student") {
      formData.append("year", year);
      formData.append("departmentId", departmentId);
    }

    
    const url = `https://localhost:7072/api/Account/AddAccount?role=${
      role === "student" ? 0 : 1
    }`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(
          `Failed to create account: ${JSON.stringify(errorResponse)}`
        );
      }

      const result = await response.json();
      console.log("Response:", result);
      alert("Account created successfully!");
    } catch (error) {
      console.error("Error:", error.message);
      alert(`Error: ${error.message}`);
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
            <div>
              <label>
                <input
                  type="radio"
                  value="true"
                  checked={gender === true}
                  onChange={() => setGender(true)}
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  value="false"
                  checked={gender === false}
                  onChange={() => setGender(false)}
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
                  onChange={(e) => setYear(e.target.value)}
                  className={styles.inputFullWidth}
                  required
                >
                  <option value="" disabled>
                    Select Year
                  </option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>

              <div className={styles.inputWithIcon}>
                <input
                  type="text"
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
      </div>
    </>
  );
};

export default CreateStudentAccount;

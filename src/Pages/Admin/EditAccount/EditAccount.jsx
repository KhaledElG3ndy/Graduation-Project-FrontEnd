import React, { useContext, useState, useEffect } from "react";
import styles from "./EditAccount.module.css";
import Header from "../../../components/Admin/Header/Header";
import { AccountContext } from "../../../contexts/AccountContext";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCalendar,
  FaMale,
  FaFemale,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const EditAccount = () => {
  const { selectedAccount } = useContext(AccountContext);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [year, setYear] = useState("");
  const [gender, setGender] = useState(1);
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);

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
    if (selectedAccount && departments.length > 0) {
      setName(selectedAccount.name);
      setPhoneNumber(selectedAccount.phoneNumber);
      setNationalId(selectedAccount.nationalId);
      setYear(selectedAccount.year);
      setGender(selectedAccount.gender === 0 ? 0 : 1);
      const dept = departments.find(
        (d) => d.id === selectedAccount.departmentId
      );
      if (dept) setDepartmentId(dept.name); // Store department **name**
    }
  }, [selectedAccount, departments]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(
          "https://localhost:7072/Departments/GetDepartments"
        );
        setDepartments(res.data);
      } catch (error) {
        console.error("Failed to fetch departments", error);
      }
    };

    fetchDepartments();
  }, []);

  const handleEdit = async () => {
    const role = selectedAccount.Type === "Staff" ? 1 : 0;
    const selectedDept = departments.find((d) => d.name === departmentId);
    const deptId = selectedDept ? selectedDept.id : 1;

    const formData = new FormData();
    formData.append("FirstName", selectedAccount.firstName);
    formData.append("LastName", selectedAccount.lastName);
    formData.append("Name", name);
    formData.append("PhoneNumber", phoneNumber);
    formData.append("NationalId", nationalId);
    formData.append("Year", year);
    formData.append("Gender", gender === 1);
    formData.append("DepartmentId", deptId.toString());

    try {
      const res = await axios.put(
        `https://localhost:7072/api/Account/Update?role=${role}&id=${selectedAccount.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      );

      const successMessage =
        typeof res.data === "string"
          ? res.data
          : "Account updated successfully";

      Swal.fire({
        icon: "success",
        title: "Success",
        text: successMessage,
      });
    } catch (error) {
      let errorMessage = "Update failed. Please try again.";

      if (
        error.response &&
        error.response.status === 400 &&
        typeof error.response.data === "object"
      ) {
        const errors = error.response.data.errors;
        if (errors) {
          errorMessage = Object.values(errors).flat().join("\n");
        } else if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }
      }

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: errorMessage,
      });

      console.error("Error updating account:", error);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h2 className={styles.title}>Edit {name} Account</h2>
        <p className={styles.subtitle}>
          Fill out the form below to edit student or staff account.
        </p>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.inputWithIcon}>
            <FaUser className={styles.icon} />
            <input
              type="text"
              value={name}
              className={styles.input}
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.inputWithIcon}>
            <FaPhone className={styles.icon} />
            <input
              type="tel"
              value={phoneNumber}
              className={styles.inputFullWidth}
              placeholder="Phone Number"
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className={styles.inputWithIcon}>
            <FaIdCard className={styles.icon} />
            <input
              type="text"
              placeholder="National ID"
              value={nationalId}
              className={styles.inputFullWidth}
              onChange={(e) => setNationalId(e.target.value)}
            />
          </div>

          <div className={styles.inputWithIcon}>
            {gender === 1 ? (
              <FaMale className={styles.icon} />
            ) : (
              <FaFemale className={styles.icon} />
            )}
            <select
              className={styles.inputFullWidth}
              value={gender}
              onChange={(e) => setGender(Number(e.target.value))}
            >
              <option value={1}>Male</option>
              <option value={0}>Female</option>
            </select>
          </div>
          <div className={styles.inputWithIcon}>
            <FaEnvelope className={styles.icon} />
            <select
              className={styles.inputFullWidth}
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputWithIcon}>
            <FaCalendar className={styles.icon} />
            <input
              type="text"
              placeholder="Year"
              value={year}
              className={styles.inputFullWidth}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            onClick={handleEdit}
          >
            Edit
          </button>
        </form>
      </div>
    </>
  );
};

export default EditAccount;

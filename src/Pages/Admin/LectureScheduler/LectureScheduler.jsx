import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaSave,
  FaTrash,
  FaClock,
  FaBookOpen,
  FaCircle,
} from "react-icons/fa";
import styles from "./LectureScheduler.module.css";
import Header from "../../../components/Admin/Header/Header";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const LectureScheduler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (!token) return navigate("/login/signin");

    const parseJwt = (token) => {
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch (e) {
        console.error("Invalid token", e);
        return null;
      }
    };

    const payload = parseJwt(token);
    if (!payload) return navigate("/login/signin");

    const role =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    if (role !== "Admin") return navigate("/login/signin");
  }, [navigate]);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [scheduleData, setScheduleData] = useState({});
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const timeSlots = [
    "8:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 2:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM",
    "6:00 PM - 8:00 PM",
  ];

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(
          "https://localhost:7072/Departments/GetDepartments"
        );
        const data = await res.json();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
        Swal.fire("Error", "Failed to fetch departments", "error");
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!selectedYear || !selectedDepartmentId) return;
      try {
        const res = await fetch(
          `https://localhost:7072/api/Schedule/${selectedDepartmentId}/${selectedYear}`
        );
        if (res.ok) {
          const data = await res.json();
          const parsed = JSON.parse(data.scheduleData || "{}");
          setScheduleData(parsed);
        } else {
          setScheduleData({});
        }
      } catch (error) {
        console.error("Error loading existing schedule:", error);
        Swal.fire("Error", "Failed to load schedule", "error");
      }
    };
    fetchSchedule();
  }, [selectedYear, selectedDepartmentId]);

  const handleSubjectChange = (day, timeSlot, value) => {
    const key = `${day}-${timeSlot}`;
    setScheduleData((prev) => ({ ...prev, [key]: value }));
  };

  const getSubjectValue = (day, timeSlot) => {
    const key = `${day}-${timeSlot}`;
    return scheduleData[key] || "";
  };

  const clearSchedule = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will clear all the entered schedule data.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, clear it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setScheduleData({});
        Swal.fire("Cleared!", "Schedule has been cleared.", "success");
      }
    });
  };

  const handleSaveSchedule = async () => {
    if (!selectedDepartmentId || !selectedYear) {
      Swal.fire(
        "Missing Fields",
        "Please select both department and academic year.",
        "warning"
      );
      return;
    }

    const payload = {
      departmentId: parseInt(selectedDepartmentId),
      level: parseInt(selectedYear),
      scheduleData: JSON.stringify(scheduleData),
    };

    const url = `https://localhost:7072/api/Schedule/${selectedDepartmentId}/${selectedYear}`;

    try {
      const checkRes = await fetch(url);

      if (checkRes.ok) {
        const putRes = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!putRes.ok)
          throw new Error(`PUT failed with status ${putRes.status}`);

        Swal.fire("Updated!", "Schedule updated successfully!", "success");
      } else if (checkRes.status === 404) {
        const postRes = await fetch("https://localhost:7072/api/Schedule", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!postRes.ok)
          throw new Error(`POST failed with status ${postRes.status}`);

        Swal.fire("Saved!", "Schedule created successfully!", "success");
      } else {
        throw new Error(`Unexpected status: ${checkRes.status}`);
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      Swal.fire("Error", "Failed to save schedule. Please try again.", "error");
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <FaCalendarAlt className={styles.headerIcon} />
            </div>
            <div className={styles.headerText}>
              <h1 className={styles.title}>Lecture Schedule Manager</h1>
              <p className={styles.subtitle}>
                Streamline your academic planning with intelligent scheduling
              </p>
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.yearSelector}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIconWrapper}>
                <FaBookOpen className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>Select Academic Year</h3>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={styles.select}
            >
              <option value="">Select Year</option>
              <option value="1">Year 1 - First Year</option>
              <option value="2">Year 2 - Second Year</option>
              <option value="3">Year 3 - Third Year</option>
              <option value="4">Year 4 - Final Year</option>
            </select>
          </div>

          <div className={styles.yearSelector}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIconWrapper}>
                <FaBookOpen className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>Select Department</h3>
            </div>
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              className={styles.select}
            >
              <option value="">Select Department</option>
              {departments.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedYear && selectedDepartmentId && (
          <div className={styles.scheduleSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionIconWrapper}>
                  <FaClock className={styles.sectionIcon} />
                </div>
                <h2 className={styles.sectionTitle}>
                  Schedule for Year {selectedYear}
                </h2>
              </div>
              <div className={styles.headerActions}>
                <button onClick={clearSchedule} className={styles.clearBtn}>
                  <FaTrash className={styles.clearIcon} />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.scheduleTable}>
                <thead>
                  <tr>
                    <th className={styles.timeHeader}>Time Slot</th>
                    {days.map((day) => (
                      <th key={day} className={styles.dayHeader}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot, idx) => (
                    <tr
                      key={timeSlot}
                      className={idx % 2 === 0 ? styles.evenRow : styles.oddRow}
                    >
                      <td className={styles.timeSlot}>
                        <div className={styles.timeSlotContent}>
                          <FaCircle className={styles.timeIndicator} />
                          <span>{timeSlot}</span>
                        </div>
                      </td>
                      {days.map((day) => (
                        <td
                          key={`${day}-${timeSlot}`}
                          className={styles.scheduleCell}
                        >
                          <input
                            type="text"
                            value={getSubjectValue(day, timeSlot)}
                            onChange={(e) =>
                              handleSubjectChange(day, timeSlot, e.target.value)
                            }
                            placeholder="Enter subject"
                            className={styles.subjectInput}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.actions}>
              <button onClick={handleSaveSchedule} className={styles.saveBtn}>
                <FaSave className={styles.saveIcon} />
                <span>Save Schedule</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LectureScheduler;

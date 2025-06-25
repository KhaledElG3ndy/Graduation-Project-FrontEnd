import React, { useEffect, useState } from "react";
import styles from "./Schedules.module.css";
import { FaCalendarAlt, FaBookOpen, FaUserTie } from "react-icons/fa";
import Header from "../../../components/student/Header/Header";

const Schedules = () => {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [professorSchedule, setProfessorSchedule] = useState([]);
  const [lectureSchedule, setLectureSchedule] = useState({});

  const years = [
    { label: "First Year", value: "1" },
    { label: "Second Year", value: "2" },
    { label: "Third Year", value: "3" },
    { label: "Fourth Year", value: "4" },
  ];

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
    fetchProfessors();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedProfessor) {
      fetchProfessorSchedule(selectedProfessor);
    }
  }, [selectedProfessor]);

  useEffect(() => {
    fetchLectureSchedule();
  }, [selectedYear, selectedDepartmentId]);

  const fetchProfessors = async () => {
    try {
      const res = await fetch(
        "https://localhost:7072/api/Account/GetAllByRole?role=1"
      );
      const data = await res.json();
      setAccounts(data.staffs || []);
    } catch (err) {
      console.error("Failed to fetch professors", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        "https://localhost:7072/Departments/GetDepartments"
      );
      const data = await res.json();
      setDepartments(data || []);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  const fetchProfessorSchedule = async (staffId) => {
    try {
      const res = await fetch(
        `https://localhost:7072/api/Schedule/DoctorSchedule/${staffId}`
      );
      if (!res.ok) {
        setProfessorSchedule([]);
        return;
      }
      const data = await res.json();
      setProfessorSchedule(data);
    } catch (err) {
      console.error("Error fetching professor schedule:", err);
      setProfessorSchedule([]);
    }
  };

  const fetchLectureSchedule = async () => {
    if (!selectedYear || !selectedDepartmentId) {
      setLectureSchedule({});
      return;
    }

    try {
      const res = await fetch(
        `https://localhost:7072/api/Schedule/${selectedDepartmentId}/${selectedYear}`
      );
      if (!res.ok) {
        setLectureSchedule({});
        return;
      }

      const data = await res.json();
      const parsed = JSON.parse(data.scheduleData || "{}");
      setLectureSchedule(parsed);
    } catch (err) {
      console.error("Error fetching lecture schedule:", err);
      setLectureSchedule({});
    }
  };

  const selectedProfessorObject = accounts.find(
    (p) => p.id === parseInt(selectedProfessor)
  );

  const getLectureSubject = (day, timeSlot) => {
    const key = `${day}-${timeSlot}`;
    return lectureSchedule[key] || "-";
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
              <h1 className={styles.title}>Schedules Overview</h1>
              <p className={styles.subtitle}>
                View and manage Lecture and Professor schedules
              </p>
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.selectorCard}>
            <div className={styles.cardHeader}>
              <div className={styles.iconContainer}>
                <FaBookOpen className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>Lecture Schedule</h3>
            </div>

            <select
              className={styles.select}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Select Year</option>
              {years.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>

            <select
              className={styles.select}
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
            >
              <option value="">Select Department</option>
              {departments.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.selectorCard}>
            <div className={styles.cardHeader}>
              <div className={styles.iconContainer}>
                <FaUserTie className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>Professor Schedule</h3>
            </div>
            <select
              className={styles.select}
              value={selectedProfessor}
              onChange={(e) => setSelectedProfessor(e.target.value)}
            >
              <option value="">Select Professor</option>
              {accounts.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
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
                  <FaBookOpen className={styles.sectionIcon} />
                </div>
                <h2 className={styles.sectionTitle}>
                  Lecture Schedule –{" "}
                  {years.find((y) => y.value === selectedYear)?.label}
                </h2>
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
                  {timeSlots.map((slot, i) => (
                    <tr
                      key={slot}
                      className={i % 2 === 0 ? styles.evenRow : styles.oddRow}
                    >
                      <td className={styles.timeSlot}>
                        <div className={styles.timeSlotContent}>
                          <span>{slot}</span>
                        </div>
                      </td>
                      {days.map((day) => (
                        <td
                          key={`${day}-${slot}`}
                          className={styles.scheduleCell}
                        >
                          {getLectureSubject(day, slot)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedProfessor && (
          <div className={styles.scheduleSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionIconWrapper}>
                  <FaUserTie className={styles.sectionIcon} />
                </div>
                <h2 className={styles.sectionTitle}>
                  Professor Schedule - Dr.{" "}
                  {selectedProfessorObject?.name || "Professor"}
                </h2>
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
                  {timeSlots.map((slot, i) => (
                    <tr
                      key={slot}
                      className={i % 2 === 0 ? styles.evenRow : styles.oddRow}
                    >
                      <td className={styles.timeSlot}>
                        <div className={styles.timeSlotContent}>
                          <span>{slot}</span>
                        </div>
                      </td>
                      {days.map((_, j) => (
                        <td key={`${i}-${j}`} className={styles.scheduleCell}>
                          {professorSchedule?.[i]?.[j] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Schedules;

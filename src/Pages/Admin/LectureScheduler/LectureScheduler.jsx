import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaUpload,
  FaSave,
  FaTrash,
  FaClock,
  FaBookOpen,
  FaCircle,
} from "react-icons/fa";
import styles from "./LectureScheduler.module.css";
import Header from "../../../components/Admin/Header/Header";

const LectureScheduler = () => {
  const [selectedYear, setSelectedYear] = useState("1");
  const [scheduleData, setScheduleData] = useState({});
  const [uploadFile, setUploadFile] = useState(null);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const timeSlots = [
    "8:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 2:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM",
    "6:00 PM - 8:00 PM",
  ];

  const handleSubjectChange = (day, timeSlot, value) => {
    const key = `${selectedYear}-${day}-${timeSlot}`;
    setScheduleData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getSubjectValue = (day, timeSlot) => {
    const key = `${selectedYear}-${day}-${timeSlot}`;
    return scheduleData[key] || "";
  };

  const clearSchedule = () => {
    const updated = { ...scheduleData };
    Object.keys(updated).forEach((key) => {
      if (key.startsWith(`${selectedYear}-`)) delete updated[key];
    });
    setScheduleData(updated);
  };

  const handleSaveSchedule = async () => {
    const payload = {};
    timeSlots.forEach((ts, idx) => {
      payload[idx] = days.map((day) => getSubjectValue(day, ts));
    });

    console.log("Sending Data (by row):", payload);

    try {
      const response = await fetch("https://localhost:7072/LectureSchedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      console.log("LectureSchedule API response:", result);
    } catch (error) {
      console.error("Error sending schedule:", error);
    }
  };

  const handleFileUpload = (event) => {
    setUploadFile(event.target.files[0]);
  };

  const handleUploadExcel = async () => {
    if (!uploadFile) return alert("Please select a file first!");

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("year", selectedYear);

    console.log(
      "Uploading Excel to API:",
      uploadFile.name,
      "for Year:",
      selectedYear
    );

    try {
      const response = await fetch(
        "https://localhost:7072/LectureSchedulerExcel",
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await response.json();
      console.log("LectureSchedulerExcel API response:", result);
    } catch (error) {
      console.error("Error uploading Excel schedule:", error);
    } finally {
      setUploadFile(null);
      document.getElementById("fileInput").value = "";
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
              <h3 className={styles.cardTitle}>Academic Year Selection</h3>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={styles.select}
            >
              <option value="1">Year 1 - First Year</option>
              <option value="2">Year 2 - Second Year</option>
              <option value="3">Year 3 - Third Year</option>
              <option value="4">Year 4 - Final Year</option>
            </select>
          </div>

          <div className={styles.fileUpload}>
            <div className={styles.cardHeader}>
              <div className={styles.uploadIconWrapper}>
                <FaUpload className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>Import Schedule (Excel)</h3>
            </div>
            <div className={styles.uploadSection}>
              <input
                id="fileInput"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className={styles.fileInput}
              />
              <button
                onClick={handleUploadExcel}
                disabled={!uploadFile}
                className={styles.uploadBtn}
              >
                <FaUpload className={styles.uploadIcon} />
                {uploadFile
                  ? `Upload ${uploadFile.name}`
                  : "Select a file first"}
              </button>
            </div>
          </div>
        </div>

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
      </div>
    </>
  );
};

export default LectureScheduler;

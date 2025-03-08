import React from "react";
import styles from "./Hero.module.css";
import { FaNewspaper, FaUserGraduate, FaEdit } from "react-icons/fa";
import adminImage from "../../../assets/images/admin.png";
import { useDarkMode } from "../../../contexts/ThemeContext";

const AdminHero = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`${styles.container} ${isDarkMode && styles.darkSection}`}>
      <div className={styles.content}>
        <h2 className={`${styles.title} ${isDarkMode && styles.darkText}`}>
          Optimizing College Administration
        </h2>
        <p className={`${styles.description} ${isDarkMode && styles.darkText}`}>
          Efficiently manage news, schedules, and regulations, ensuring a
          seamless academic experience through smart digital solutions.
        </p>

        <div className={styles.stats}>
          <div className={styles.statBox}>
            <FaNewspaper
              className={`${styles.icon} ${isDarkMode && styles.darkIcon}`}
            />
            <span>Total News</span>
            <strong>125</strong>
          </div>

          <div className={styles.statBox}>
            <FaUserGraduate
              className={`${styles.icon} ${isDarkMode && styles.darkIcon}`}
            />
            <span>Total Students</span>
            <strong>
              1,230{" "}
              <FaEdit
                className={`${styles.editIcon} ${
                  isDarkMode && styles.darkIcon
                }`}
              />
            </strong>
          </div>
        </div>
      </div>

      <div className={styles.imageContainer}>
        <img
          src={adminImage}
          alt="Admin Illustration"
          className={styles.image}
        />
      </div>
    </div>
  );
};

export default AdminHero;

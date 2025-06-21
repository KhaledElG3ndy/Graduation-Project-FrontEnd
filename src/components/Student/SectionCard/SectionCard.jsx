import React from "react";
import styles from "./SectionCard.module.css";
import { useDarkMode } from "../../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

const SectionCard = ({ title, description, buttonText, image, route }) => {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleClick = () => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <div
      className={`${styles.card} ${
        isDarkMode ? styles.darkMode : styles.lightMode
      }`}
    >
      <div className={styles.imageContainer}>
        <img src={image} alt={title} className={styles.image} />
      </div>
      <div className={styles.textContainer}>
        <div className={styles.topSection}>
          <h3
            className={`${styles.title} ${
              isDarkMode ? styles.lightText : styles.darkText
            }`}
          >
            {title}
          </h3>
          <p
            className={`${styles.description} ${
              isDarkMode ? styles.lightText : styles.darkText
            }`}
          >
            {description}
          </p>
        </div>
        <div className={styles.bottomSection}>
          <button className={styles.button} onClick={handleClick}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionCard;

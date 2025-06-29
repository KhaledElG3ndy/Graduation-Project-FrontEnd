import React from "react";
import styles from "./Footer.module.css";
import { useDarkMode } from "../../../contexts/ThemeContext";

const Footer = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <footer className={styles.footer} data-aos="fade-up">
      <div className={styles.logoSection}>
        <div className={styles.logo}>Team Space</div>
      </div>
      <div className={styles.servicesSection}>
        <p>© 2025 Company, Inc</p>
      </div>
    </footer>
  );
};

export default Footer;

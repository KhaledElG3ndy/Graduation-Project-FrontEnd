import React from "react";
import styles from "./Footer.module.css";
import { useDarkMode } from "../../../contexts/ThemeContext";

const Footer = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <footer className={styles.footer} data-aos="fade-up">
      <div className={styles.contactSection}>
        <h4>Contact Us</h4>
        <ul>
          <li>Email: info@college.com</li>
          <li>Phone: +123 456 789</li>
          <li>Address: 123 College Street</li>
        </ul>
        <div className={styles.socialIcons}>
          <span>🔗</span>
          <span>💬</span>
          <span>📷</span>
        </div>
      </div>
      <div className={styles.logoSection}>
        <div className={styles.logo}>Team Space</div>
        <p>© 2025 Company, Inc</p>
      </div>
      <div className={styles.servicesSection}>
        <h4>Services</h4>
        <ul>
          <li>Study</li>
          <li>News</li>
          <li>Communication</li>
          <li>Guidance</li>
          <li>Schedules</li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;

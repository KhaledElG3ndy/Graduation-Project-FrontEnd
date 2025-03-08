import { useState, useEffect } from "react";
import styles from "./Header.module.css";
import { FiSearch, FiBell, FiSettings } from "react-icons/fi";
import { FaSun, FaMoon } from "react-icons/fa";

import { useDarkMode } from "../../../contexts/ThemeContext";

export default function Header() {
  const [greeting, setGreeting] = useState("");
  const [date, setDate] = useState("");
  const { isDarkMode, toggleTheme } = useDarkMode();

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const formattedDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    let greetingText = "Good Evening";
    if (hours < 12) {
      greetingText = "Good Morning";
    } else if (hours < 18) {
      greetingText = "Good Afternoon";
    }

    setGreeting(greetingText);
    setDate(formattedDate);
  }, []);

  return (
    <header className={`${styles.header} ${isDarkMode && styles.darkHeader}`}>
      <div className={styles.leftSection}>
        <h2 className={`${styles.greeting} ${isDarkMode && styles.lightText}`}>
          {greeting}, Admin
        </h2>
        <p className={`${styles.date} ${isDarkMode && styles.lightText}`}>
          {date}
        </p>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Enter page title to open ..."
            className={styles.searchInput}
          />
        </div>
        <FiBell className={styles.icon} />
        <button
          className={styles.iconButton}
          onClick={toggleTheme}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? (
            <FaMoon size={20} className={styles.icon} />
          ) : (
            <FaSun size={20} className={styles.icon} />
          )}
        </button>
        {/* <Link  */}
      </div>
    </header>
  );
}

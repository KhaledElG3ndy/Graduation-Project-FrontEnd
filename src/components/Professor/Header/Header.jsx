import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";
import { FiBell } from "react-icons/fi";
import { useDarkMode } from "../../../contexts/ThemeContext";
import styles from "./Header.module.css";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { isDarkMode, toggleTheme } = useDarkMode();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const isLogged = sessionStorage.getItem("isLogged");

    if (isLogged) {
      try {
        const parsedUser = JSON.parse(isLogged);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error", error);
      }
    } else {
      console.warn("Not Logged");
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/Login/signin");
  };

  return (
    <header
      className={`${styles.header} ${
        isDarkMode ? styles.darkHeader : styles.lightHeader
      }`}
    >
      <div className={styles.logo}>Team Space</div>
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>
          Home
        </Link>
        <Link to="/about" className={styles.navLink}>
          About
        </Link>
        <Link to="/profile" className={styles.navLink}>
          Profile
        </Link>
      </nav>
      <div className={styles.icons}>
        <button className={styles.iconButton} aria-label="Notifications">
          <FiBell className={styles.icon} />
        </button>

        {user ? (
          <button onClick={handleLogout} className={styles.joinNow}>
            Logout
          </button>
        ) : (
          <Link to="/Login/signin" className={styles.joinNow}>
            Join Now
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;

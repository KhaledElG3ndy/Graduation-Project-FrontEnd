import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";
import { FiBell } from "react-icons/fi";
import { useDarkMode } from "../../../contexts/ThemeContext";
import styles from "./Header.module.css";

const Header = () => {
  const { isDarkMode, toggleTheme } = useDarkMode();
  const [user, setUser] = useState(null);
  const [latestNews, setLatestNews] = useState(null);
  const [showModal, setShowModal] = useState(false);
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
    }
  }, []);

  useEffect(() => {
    const storedNews = localStorage.getItem("latestNews");
    if (storedNews) {
      setLatestNews(JSON.parse(storedNews));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("Token");
    sessionStorage.removeItem("isLogged");
    setUser(null);
    navigate("/Login/signin");
  };

  return (
    <>
      <header
        className={`${styles.header} ${
          isDarkMode ? styles.darkHeader : styles.lightHeader
        }`}
      >
        <div className={styles.logo}>Team Space</div>
        <nav className={styles.nav}>
          <a href="/" className={styles.navLink}>
            Home
          </a>
          <a href="#about" className={styles.navLink}>
            About
          </a>
          <Link to="/student/Profile" className={styles.navLink}>
            Profile
          </Link>
        </nav>
        <div className={styles.icons}>
          <div className={styles.notificationContainer}>
            <button
              className={styles.iconButton}
              onClick={() => setShowModal(true)}
              aria-label="Notifications"
            >
              <FiBell className={styles.icon} />
              {latestNews && (
                <span className={styles.notificationBadge}>1</span>
              )}
            </button>
          </div>

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

      {showModal && (
        <>
          <div
            className={styles.modalBackdrop}
            onClick={() => setShowModal(false)}
          ></div>
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Latest News</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>

              <div className={styles.modalBody}>
                {latestNews ? (
                  <div className={styles.newsItem}>
                    <div className={styles.newsIcon}>
                      <span className={styles.newsIconSymbol}>📰</span>
                    </div>
                    <div className={styles.newsContent}>
                      <h4 className={styles.modalNewsTitle}>
                        {latestNews.title}
                      </h4>
                      <p className={styles.modalNewsContent}>
                        {latestNews.content}
                      </p>
                      <div className={styles.newsFooter}>
                        <span className={styles.modalDate}>
                          {new Date(latestNews.date).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <FiBell className={styles.emptyIcon} />
                    <p className={styles.modalEmpty}>No recent news</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;

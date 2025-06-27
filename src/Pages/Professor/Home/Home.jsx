import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import Header from "../../../components/Professor/Header/Header";
import Footer from "../../../components/Professor/Footer/Footer";
import { useDarkMode } from "../../../contexts/ThemeContext";
import {
  FiTv,
  FiBook,
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiGlobe,
} from "react-icons/fi";

const ProfessorHomePage = () => {
  const { isDarkMode } = useDarkMode();

  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (!token) {
      navigate("/login/signin");
      return;
    }

    const parseJwt = (token) => {
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch (e) {
        console.error("Invalid token", e);
        return null;
      }
    };

    const payload = parseJwt(token);
    if (!payload) {
      navigate("/login/signin");
      return;
    }

    const role =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (role !== "Professor") {
      navigate("/login/signin");
    }
  }, [navigate]);

  const handleNavigateToSubjects = () => {
    navigate("/Professor/Subjects");
  };
  const handleNavigateToChannels = () => {
    navigate("/Professor/Channels");
  };

  return (
    <div className={styles.profHome}>
      <Header />
      <div
        className={`${styles.homeContainer} ${
          isDarkMode ? styles.darkMode : styles.lightMode
        }`}
      >
        <div className={styles.heroSection}>
          <div className={styles.textContent}>
            <div className={styles.titleWrapper}>
              <h1 className={styles.mainTitle}>
                Enhance Your Teaching Experience
              </h1>
              <div className={styles.titleUnderline}></div>
            </div>

            <p
              className={`${styles.subtitle} ${
                isDarkMode ? styles.lightText : styles.darkText
              }`}
            >
              Empower your teaching journey with a modern, intuitive platform
              that makes it easy to manage subjects, share resources, and
              communicate with students—all in one place.
            </p>

            <div className={styles.buttons}>
              <button
                className={`${styles.primaryButton} ${styles.channelsBtn}`}
                onClick={handleNavigateToChannels}
              >
                <FiTv className={styles.buttonIcon} />
                Channels
                <FiArrowRight className={styles.buttonArrow} />
              </button>
              <button
                className={`${styles.secondaryButton} ${styles.subjectsBtn}`}
                onClick={handleNavigateToSubjects}
              >
                <FiBook className={styles.buttonIcon} />
                Manage Subjects
                <FiArrowRight className={styles.buttonArrow} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfessorHomePage;

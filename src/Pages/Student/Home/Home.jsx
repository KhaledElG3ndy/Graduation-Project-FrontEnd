import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import Header from "../../../components/Student/Header/Header";
import SectionCard from "../../../components/Student/SectionCard/SectionCard";
import Footer from "../../../components/Student/Footer/Footer";
import { useDarkMode } from "../../../contexts/ThemeContext";

import { FaRocket, FaInfoCircle } from "react-icons/fa";
import news from "../../../assets/images/news.svg";
import schedule from "../../../assets/images/Schedules.svg";
import guide from "../../../assets/images/guidance.svg";
import Communication from "../../../assets/images/Communication.svg";
import study from "../../../assets/images/study.svg";
import regulation from "../../../assets/images/regulation.svg";
const Home = () => {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  // useEffect(() => {
  //   const isLogged = JSON.parse(sessionStorage.getItem("isLogged"));
  //   const userType = JSON.parse(sessionStorage.getItem("userType"));

  //   if (!isLogged || userType !== "Student") {
  //     navigate("/login/signin");
  //   }
  // }, [navigate]);

  const sections = [
    {
      id: 1,
      title: "Study",
      description:
        "Gain access to a comprehensive collection of study materials, including lecture notes, e-books, and practice questions. Enhance your learning experience with interactive resources tailored to your courses.",
      buttonText: "Explore Study",
      image: study,
      route: "/student/study",
    },
    {
      id: 2,
      title: "News",
      description:
        "Stay informed with the latest updates from your college, including important announcements, event schedules, policy changes, and achievements. Never miss out on crucial information about campus life.",
      buttonText: "Read News",
      image: news,
      route: "/student/news",
    },
    {
      id: 3,
      title: "Communication",
      description:
        "Effortlessly connect with classmates, professors, and academic staff through chat, forums, and discussion boards. Share ideas, collaborate on projects, and stay engaged with your academic community.",
      buttonText: "Start Communicating",
      image: Communication,
      route: "/student/communication",
    },
    {
      id: 4,
      title: "Guidance",
      description:
        "Receive personalized academic advice and career counseling from experienced mentors. Get support for course selection, career planning, and skill development to achieve your academic and professional goals.",
      buttonText: "Seek Guidance",
      image: guide,
      route: "/student/guidance",
    },
    {
      id: 5,
      title: "Schedules",
      description:
        "Easily check your class schedules, faculty office hours, and exam timetables. Stay organized and plan your academic activities efficiently with up-to-date scheduling information.",
      buttonText: "View Schedule",
      image: schedule,
      route: "/student/schedules",
    },
    {
      id: 6,
      title: "Regulation",
      description:
        "Access college rules, academic regulations, and student conduct guidelines to ensure you're informed and aligned with institutional policies.",
      buttonText: "View Regulation",
      image: regulation,
      route: "/student/regulation",
    },
  ];

  return (
    <div>
      <Header />
      <div
        className={`${styles.homeContainer} ${
          isDarkMode ? styles.darkMode : styles.lightMode
        }`}
      >
        <div className={styles.textContent}>
          <h1>Empower Your College Journey</h1>
          <p className={isDarkMode ? styles.lightText : styles.darkText}>
            Organize your studies, track campus events, and engage with your
            academic network — all in one unified space.
          </p>

          <div className={styles.buttons}>
            <button className={styles.primaryButton}>
              <FaRocket /> Get Started
            </button>
            <button className={styles.secondaryButton}>
              <FaInfoCircle /> Learn More
            </button>
          </div>
        </div>
      </div>

      <div
        className={`${styles.cardsContainer} ${
          isDarkMode ? styles.darkMode : styles.lightMode
        }`}
      >
        <div
          className={`${styles.sectionContainer} ${
            isDarkMode ? styles.darkMode : styles.lightMode
          }`}
        >
          {sections.map((section) => (
            <SectionCard key={section.id} {...section} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;

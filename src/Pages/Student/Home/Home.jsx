import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import Header from "../../../components/Student/Header/Header";
import SectionCard from "../../../components/Student/SectionCard/SectionCard";
import Footer from "../../../components/Student/Footer/Footer";
import { useDarkMode } from "../../../contexts/ThemeContext";

import {
  FaRocket,
  FaInfoCircle,
  FaGraduationCap,
  FaUsers,
  FaBullseye,
  FaLightbulb,
} from "react-icons/fa";
import news from "../../../assets/images/news.svg";
import schedule from "../../../assets/images/Schedules.svg";
import guide from "../../../assets/images/guidance.svg";
import Communication from "../../../assets/images/Communication.svg";
import study from "../../../assets/images/study.svg";
import regulation from "../../../assets/images/regulation.svg";

const Home = () => {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("Token");

    if (!token) {
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

    if (role !== "Student") {
      navigate("/login/signin");
    }
  }, [navigate]);

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
      title: "Communication",
      description:
        "Effortlessly connect with classmates, professors, and academic staff through chat, forums, and discussion boards. Share ideas, collaborate on projects, and stay engaged with your academic community.",
      buttonText: "Start Communicating",
      image: Communication,
      route: "/student/communication",
    },
    {
      id: 3,
      title: "Regulation",
      description:
        "Access college rules, academic regulations, and student conduct guidelines to ensure you're informed and aligned with institutional policies.",
      buttonText: "View Regulation",
      image: regulation,
      route: "/student/regulation",
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
      title: "News",
      description:
        "Stay informed with the latest updates from your college, including important announcements, event schedules, policy changes, and achievements. Never miss out on crucial information about campus life.",
      buttonText: "Read News",
      image: news,
      route: "/student/news",
    },
  ];

  const features = [
    {
      icon: <FaGraduationCap />,
      title: "Academic Excellence",
      description:
        "Comprehensive study materials and resources to boost your academic performance",
    },
    {
      icon: <FaUsers />,
      title: "Community Connection",
      description:
        "Connect with peers, faculty, and mentors in a collaborative environment",
    },
    {
      icon: <FaBullseye />,
      title: "Goal Achievement",
      description:
        "Track your progress and achieve your academic and career objectives",
    },
    {
      icon: <FaLightbulb />,
      title: "Innovation Hub",
      description:
        "Access cutting-edge tools and resources for modern learning",
    },
  ];

  return (
    <div className={styles.pageBackground}>
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

      <div className={styles.cardsContainer}>
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

      <section
        id="about"
        className={`${styles.aboutSection} ${
          isDarkMode ? styles.aboutDark : styles.aboutLight
        }`}
      >
        <div className={styles.aboutContainer}>
          <div className={styles.aboutContent}>
            <div className={styles.aboutLeft}>
              <div className={styles.aboutHeader}>
                <span className={styles.aboutBadge}>About Us</span>
                <h2 className={styles.aboutTitle}>
                  Transforming Education Through
                  <span className={styles.titleHighlight}> Innovation</span>
                </h2>
              </div>

              <p className={styles.aboutDescription}>
                Team Space revolutionizes the academic experience by providing
                students with a comprehensive digital ecosystem. Our platform
                seamlessly integrates all aspects of college life, from academic
                resources to social connections, empowering students to excel in
                their educational journey.
              </p>

              <p className={styles.aboutSubDescription}>
                Built with cutting-edge technology and designed with student
                needs in mind, Team Space bridges the gap between traditional
                education and modern digital solutions, creating an environment
                where learning thrives.
              </p>
            </div>

            <div className={styles.aboutRight}>
              <div className={styles.featuresGrid}>
                {features.map((feature, index) => (
                  <div key={index} className={styles.featureCard}>
                    <div className={styles.featureIcon}>{feature.icon}</div>
                    <div className={styles.featureContent}>
                      <h3 className={styles.featureTitle}>{feature.title}</h3>
                      <p className={styles.featureDescription}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.decorativeElements}>
                <div className={styles.floatingShape1}></div>
                <div className={styles.floatingShape2}></div>
                <div className={styles.floatingShape3}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

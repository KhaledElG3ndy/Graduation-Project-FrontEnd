import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./News.module.css";
import { MdOutlinePostAdd, MdEditNote, MdLibraryBooks } from "react-icons/md";
import { useDarkMode } from "../../../contexts/ThemeContext";

const NewsSection = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("Token");

    fetch("https://localhost:7072/api/News", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch news");
        return res.json();
      })
      .then((data) => {
        const sorted = [...data].sort((a, b) => b.id - a.id);
        setNewsList(sorted.slice(0, 2));
      })
      .catch((err) => {
        console.error("Error fetching news:", err);
      });
  }, []);

  return (
    <div
      className={`${styles.container} ${isDarkMode && styles.darkContainer}`}
    >
      <div
        className={`${styles.newsSection} ${
          isDarkMode && styles.darkNewsSection
        }`}
      >
        <h1 className={`${styles.title} ${isDarkMode && styles.darkText}`}>
          Latest News
        </h1>
        <div className={styles.newsList}>
          {newsList.map((news) => (
            <div
              key={news.id}
              className={`${styles.newsItem} ${
                isDarkMode && styles.darkNewsItem
              }`}
            >
              <h2 className={`${isDarkMode && styles.darkText}`}>
                {news.title || "News Item # " + news.id}
              </h2>
              <p className={`${isDarkMode && styles.darkText}`}>
                {news.content.length > 50
                  ? news.content.slice(0, 50) + "..."
                  : news.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`${styles.rightSection} ${
          isDarkMode && styles.darkRightSection
        }`}
      >
        {[
          {
            title: "Add News",
            icon: <MdOutlinePostAdd size={30} />,
            action: () => navigate("/Admin/AddNews"),
          },
          {
            title: "Update News",
            icon: <MdEditNote size={30} />,
            action: () => navigate("/Admin/UpdateNews"),
          },
          {
            title: "Add Subject",
            icon: <MdLibraryBooks size={30} />,
            action: () => navigate("/Admin/AddSubjects"),
          },
        ].map((item, index) => (
          <div
            key={index}
            className={`${styles.card} ${isDarkMode && styles.darkCard}`}
            onClick={item.action}
          >
            <div
              className={`${styles.iconContainer} ${
                isDarkMode && styles.darkIconContainer
              }`}
            >
              {item.icon}
            </div>
            <div className={styles.cardContent}>
              <h2
                className={`${styles.cardTitle} ${
                  isDarkMode && styles.darkText
                }`}
              >
                {item.title}
              </h2>
              <button
                className={`${styles.cardButton} ${
                  isDarkMode && styles.darkCardButton
                }`}
              >
                Go
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;

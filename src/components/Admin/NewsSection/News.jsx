import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./News.module.css";
import { MdOutlinePostAdd, MdEditNote, MdLibraryBooks } from "react-icons/md";
import { useDarkMode } from "../../../contexts/ThemeContext";

const NewsSection = () => {
  const navigate = useNavigate();
  const [newsList] = useState([
    { id: 1, title: "News Title 1", description: "Latest university updates." },
    {
      id: 2,
      title: "News Title 2",
      description: "Upcoming events and changes.",
    },
  ]);

  const { isDarkMode } = useDarkMode();

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
          Added News
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
                {news.title}
              </h2>
              <p className={`${isDarkMode && styles.darkText}`}>
                {news.description}
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
            action: () => console.log("Updating News"),
          },
          {
            title: "Add Subject",
            icon: <MdLibraryBooks size={30} />,
            action: () => console.log("Adding Subject"),
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

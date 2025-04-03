import React, { useEffect, useState } from "react";
import styles from "./News.module.css";
import Header from "../../../components/Student/Header/Header";

export default function News() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("http://localhost:5102/api/News");
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.container}>
          {news.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.contentWrapper}>
                <h3 className={styles.newsTitle}>Title 1</h3>
                <p className={styles.content}>{item.content}</p>
              </div>
              <img
                src={`data:image/jpeg;base64,${item.image}`}
                alt="News"
                className={styles.image}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

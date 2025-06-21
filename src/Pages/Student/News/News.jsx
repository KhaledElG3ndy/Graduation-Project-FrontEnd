import React, { useEffect, useState } from "react";
import styles from "./News.module.css";
import Header from "../../../components/student/Header/Header";

const News = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api_url = "https://localhost:7072/api/News";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(api_url, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("Token")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch news");
        const data = await response.json();
        const converted = data.map((item) => {
          let base64Image = null;

          if (item.image) {
            base64Image = `data:image/jpeg;base64,${item.image}`;
          }

          return {
            ...item,
            imageUrl: base64Image,
            publishedDate: item.publishedDate || new Date().toISOString(),
            category: item.category || "General",
          };
        });

        setNewsList(converted);
      } catch (error) {
        console.error("Error loading news:", error.message);
        setError("Failed to load news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const LoadingSkeleton = () => (
    <div className={styles.newsGrid}>
      {[...Array(6)].map((_, index) => (
        <div key={index} className={`${styles.card} ${styles.skeleton}`}>
          <div className={styles.skeletonImage}></div>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonContent}></div>
          <div className={styles.skeletonContent}></div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.headerSection}>
            <h1 className={styles.heading}>Latest News & Updates</h1>
            <p className={styles.subheading}>
              Stay informed with the latest developments and announcements
            </p>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>⚠️</div>
              <p className={styles.errorMessage}>{error}</p>
              <button
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : newsList.length === 0 ? (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyIcon}>📰</div>
              <h3 className={styles.emptyTitle}>No News Available</h3>
              <p className={styles.emptyMessage}>
                Check back later for the latest updates and announcements.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.resultsInfo}>
                <span className={styles.resultCount}>
                  {newsList.length} article{newsList.length !== 1 ? "s" : ""}{" "}
                  found
                </span>
              </div>

              <div className={styles.newsGrid}>
                {newsList.map((news) => (
                  <article key={news.id} className={styles.card}>
                    {news.imageUrl && (
                      <div className={styles.imageContainer}>
                        <img
                          src={news.imageUrl}
                          alt={`News article ${news.id}`}
                          className={styles.image}
                          loading="lazy"
                        />
                        <div className={styles.imageOverlay}>
                          <span className={styles.category}>
                            {news.category}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={styles.cardContent}>
                      <div className={styles.cardHeader}>
                        <h2 className={styles.title}>
                          {news.title || ` News Item #${news.id}`}
                        </h2>
                        <time
                          className={styles.date}
                          dateTime={news.publishedDate}
                        >
                          {formatDate(news.publishedDate)}
                        </time>
                      </div>

                      <p className={styles.content}>
                        {news.content?.length > 120
                          ? news.content.slice(0, 120) + "..."
                          : news.content ||
                            "No content available for this article."}
                      </p>

                      <div className={styles.cardFooter}>
                        <button className={styles.readMoreBtn}>
                          Read More
                          <span className={styles.arrow}>→</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default News;

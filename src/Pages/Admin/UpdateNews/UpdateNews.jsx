import React, { useEffect, useState } from "react";
import styles from "./UpdateNews.module.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Admin/Header/Header";

const UpdateNews = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNews = async () => {
    try {
      const response = await fetch("https://localhost:7072/api/News");
      const data = await response.json();
      setNewsList(data);
    } catch (error) {
      console.error(error);
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This news item will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `https://localhost:7072/api/News/id?Id=${id}`,
            {
              method: "DELETE",
            }
          );
          if (response.ok) {
            setNewsList(newsList.filter((news) => news.id !== id));
            Swal.fire("Deleted!", "The news item has been deleted.", "success");
          } else {
            Swal.fire("Error!", "Failed to delete the news item.", "error");
          }
        } catch (error) {
          console.error(error);
          Swal.fire("Error!", "Server error occurred.", "error");
        }
      }
    });
  };

  const handleUpdate = (id) => {
    navigate(`/Admin/UpdateNews/UpdateForm/${id}`);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <>
      <Header />

      <div className={styles.container}>
        <h1 className={styles.title}>All News</h1>
        {loading ? (
          <p className={styles.loading}>Loading news...</p>
        ) : newsList.length === 0 ? (
          <p className={styles.error}>No news found.</p>
        ) : (
          <div className={styles.newsList}>
            {newsList.map((news) => (
              <div key={news.id} className={styles.newsItem}>
                <h2 className={styles.newsHeading}>News #{news.id}</h2>
                <p className={styles.newsContent}>{news.content}</p>
                {news.image && (
                  <img
                    src={`data:image/jpeg;base64,${news.image}`}
                    alt={`News ${news.id}`}
                    className={styles.newsImage}
                  />
                )}
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.updateButton}
                    onClick={() => handleUpdate(news.id)}
                  >
                    Update
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(news.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default UpdateNews;

import React, { useEffect, useState } from "react";
import styles from "./NewsCRUD.module.css";
import Header from "../../../components/Student/Header/Header";
import { useNavigate } from "react-router-dom";
export default function NewsCRUD() {
  const [news, setNews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    content: "",
    image: null,
  });
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

    if (role !== "Admin") {
      navigate("/login/signin");
    }
  }, [navigate]);
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch("http://localhost:5102/api/News");
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5102/api/News/id?Id=${id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        fetchNews();
      } else {
        console.error("Delete failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = (newsItem) => {
    setFormData({
      id: newsItem.id,
      title: newsItem.title || "",
      content: newsItem.content,
      image: null,
    });
    setPreviewImage(`data:image/jpeg;base64,${newsItem.image}`);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: null, title: "", content: "", image: null });
    setPreviewImage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = new FormData();
      updateData.append("id", formData.id); // ✅ ID is required
      updateData.append("title", formData.title);
      updateData.append("content", formData.content);
      if (formData.image) {
        updateData.append("image", formData.image);
      }

      const response = await fetch("https://localhost:7072/api/News", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("Token")}`,
          // ⚠️ DO NOT set Content-Type manually with FormData
        },
        body: updateData,
      });

      if (response.ok) {
        closeModal();
        fetchNews();
      } else {
        const error = await response.text();
        console.error("Update failed:", error);
      }
    } catch (error) {
      console.error("Error updating news:", error);
    }
  };
  
  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.container}>
          {news.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.contentWrapper}>
                <h3 className={styles.newsTitle}>{item.title || "Title"}</h3>
                <p className={styles.content}>{item.content}</p>
                <div className={styles.buttonGroup}>
                  <button
                    onClick={() => openModal(item)}
                    className={styles.updateButton}
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <img
                src={`data:image/jpeg;base64,${item.image}`}
                alt="News"
                className={styles.image}
              />
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>Update News</h2>
                <button onClick={closeModal} className={styles.closeButton}>
                  &times;
                </button>
              </div>
              <form onSubmit={handleUpdate} className={styles.form}>
                <label>
                  Title:
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={styles.inputField}
                  />
                </label>
                <label>
                  Content:
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className={styles.textareaField}
                  />
                </label>
                {previewImage && (
                  <div className={styles.imageContainer}>
                    <img
                      src={previewImage}
                      alt="Preview"
                      className={styles.imagePreview}
                    />
                  </div>
                )}
                <label>
                  Change Image:
                  <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    className={styles.inputField}
                  />
                </label>
                <div className={styles.modalButtons}>
                  <button type="submit" className={styles.saveButton}>
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

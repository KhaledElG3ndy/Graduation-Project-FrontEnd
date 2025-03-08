import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./AddNews.module.css";
import img from "../../../assets/images/AddNews2.svg";
import Header from "../../../components/Admin/Header/Header";

export default function AddNews() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImage(reader.result);
        setPreview(URL.createObjectURL(file));
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const api_url = "";

    const data = {
      title,
      content,
      image,
    };

    setLoading(true);
    try {
      const response = await fetch(api_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Error");

      toast.success("News added successfully!");
      setTitle("");
      setContent("");
      setImage(null);
      setPreview(null);
    } catch (error) {
      toast.error("Failed");
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.leftSection}>
            <div className={styles.card}>
              <h2 className={styles.title}>Add News</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter news title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <textarea
                  className={styles.textarea}
                  placeholder="Write news content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
                <label className={styles.fileLabel}>
                  Choose an Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                  />
                </label>
                {preview && (
                  <img src={preview} alt="Preview" className={styles.preview} />
                )}
                <button
                  type="submit"
                  className={styles.button}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit News"}
                </button>
              </form>
            </div>
          </div>

          <div className={styles.rightSection}>
            <img src={img} alt="Illustration" className={styles.bgImage} />
          </div>
        </div>
      </div>
    </>
  );
}

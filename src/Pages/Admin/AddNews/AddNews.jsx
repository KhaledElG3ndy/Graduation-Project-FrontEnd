import React, { useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
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
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "File Too Large",
          text: "Please select an image smaller than 5MB",
          confirmButtonColor: "#0066cc",
        });
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Confirm Submission",
      text: "Are you sure you want to publish this news?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0066cc",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, publish it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const api_url = "https://localhost:7072/api/News";

    const data = new FormData();
    data.append("staffId", 7);
    data.append("title", title);
    data.append("content", content);
    data.append("image", image);

    setLoading(true);
    try {
      const response = await fetch(api_url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("Token")}`,
        },
        body: data,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "News has been published successfully!",
        confirmButtonColor: "#0066cc",
        timer: 3000,
        timerProgressBar: true,
      });

      setTitle("");
      setContent("");
      setImage(null);
      setPreview(null);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Publication Failed",
        text: `Failed to publish news: ${error.message}`,
        confirmButtonColor: "#d33",
        footer: "Please try again or contact support if the problem persists",
      });
    }
    setLoading(false);
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.leftSection}>
            <div className={styles.card}>
              <div className={styles.header}>
                <h1 className={styles.title}>Create News Article</h1>
                <p className={styles.subtitle}>
                  Share important updates and announcements
                </p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Article Title *</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter a news title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Content *</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Write your news content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                  <div className={styles.charCount}>
                    {content.length} characters
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Featured Image</label>
                  <div className={styles.imageUpload}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={styles.fileInput}
                      id="imageUpload"
                    />
                    <label htmlFor="imageUpload" className={styles.fileLabel}>
                      <svg
                        className={styles.uploadIcon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Choose Image
                    </label>
                    <span className={styles.fileInfo}>
                      PNG, JPG, GIF up to 5MB
                    </span>
                  </div>

                  {preview && (
                    <div className={styles.previewContainer}>
                      <img
                        src={preview}
                        alt="Preview"
                        className={styles.preview}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className={styles.removeBtn}
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={`${styles.button} ${
                    loading ? styles.loading : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className={styles.spinner}></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <svg
                        className={styles.buttonIcon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Publish News
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className={styles.rightSection}>
            <img src={img} alt="News illustration" className={styles.bgImage} />
            <p className={styles.rightText}>
              Share your latest news with everyone!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

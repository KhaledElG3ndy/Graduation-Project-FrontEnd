import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./AddPost.module.css";
import img from "../../../assets/images/AddPost.svg";
import Header from "../../../components/Professor/Header/Header";
import { MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";
export default function AddPost() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const maxChars = 500;
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

    if (role !== "Professor") {
      navigate("/login/signin");
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const api_url = "http://localhost:5102/api/News";
    const data = new FormData();
    data.append("content", content);

    if (image) {
      data.append("image", image);
    }

    setLoading(true);
    try {
      const response = await fetch(api_url, {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      toast.success("News added successfully!");
      setContent("");
      setImage(null);
      setPreview(null);
    } catch (error) {
      toast.error("Failed to add news");
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.topSection}>
            <img src={img} alt="Illustration" className={styles.bgImage} />
            <MdClose className={styles.exitIcon} />
          </div>
          <div className={styles.buttomSection}>
            <div className={styles.card}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <textarea
                  className={styles.textarea}
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars) {
                      setContent(e.target.value);
                    }
                  }}
                  required
                />
                <div className={styles.counter}>
                  {content.length} / {maxChars}
                </div>
                <progress
                  className={styles.progressBar}
                  value={content.length}
                  max={maxChars}
                />
                <label className={styles.fileLabel}>
                  Choose an Image (Optional)
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
                  {loading ? "Submitting..." : "Publish"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

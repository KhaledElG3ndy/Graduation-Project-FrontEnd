import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import styles from "./UpdateForm.module.css";
import Header from "../../../components/Admin/Header/Header";

const UpdateForm = () => {
  const { id } = useParams();
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [existingImageBase64, setExistingImageBase64] = useState("");
  const [existingImageFile, setExistingImageFile] = useState(null);
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
    const fetchNews = async () => {
      try {
        const res = await fetch(`https://localhost:7072/api/News/id?Id=${id}`);
        const data = await res.json();
        setContent(data.content);
        setExistingImageBase64(`data:image/jpeg;base64,${data.image}`);
        const blob = await fetch(`data:image/jpeg;base64,${data.image}`).then(
          (r) => r.blob()
        );
        const file = new File([blob], "existing-image.jpg", {
          type: blob.type,
        });
        setExistingImageFile(file);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNews();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("Id", id);
    formData.append("Content", content || "");
    formData.append("Image", image || existingImageFile);

    try {
      const res = await fetch("https://localhost:7072/api/News", {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        Swal.fire("Updated!", "News updated successfully.", "success");
        navigate("/Admin/UpdateNews");
      } else {
        Swal.fire("Update failed", "", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Server error", "", "error");
    }
  };

  return (
    <>
      <Header />

      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.formWrapper}>
          <h1 className={styles.title}>Update News</h1>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="5"
            placeholder="Leave empty to use old content"
            className={styles.textarea}
          />
          {existingImageBase64 && (
            <img
              src={existingImageBase64}
              alt="Current"
              className={styles.image}
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            Submit
          </button>
        </form>
      </div>
    </>
  );
};

export default UpdateForm;

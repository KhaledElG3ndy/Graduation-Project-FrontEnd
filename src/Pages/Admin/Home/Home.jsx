import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar";
import Header from "../../../components/Admin/Header/Header";
import AdminHero from "../../../components/Admin/HeroSection/Hero";
import styles from "./Home.module.css";
import NewsSection from "../../../components/Admin/NewsSection/News";

export default function AdminHomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newsCount, setNewsCount] = useState(0);
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

    const roleClaim =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (roleClaim !== "Admin" && roleClaim !== 0) {
      navigate("/login/signin");
      return;
    }

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
        setNewsCount(Array.isArray(data) ? data.length : 0);
      })
      .catch((err) => {
        console.error("Error fetching news:", err);
      });
  }, [navigate]);

  return (
    <div className={styles.container}>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div
        className={`${styles.mainContent} ${
          isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className={styles.content}>
          <AdminHero newsCount={newsCount} />
          <NewsSection />
        </main>
      </div>
    </div>
  );
}

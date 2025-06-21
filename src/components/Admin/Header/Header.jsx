import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { FiBell } from "react-icons/fi";

export default function Header() {
  const [greeting, setGreeting] = useState("");
  const [date, setDate] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const formattedDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    let greetingText = "Good Evening";
    if (hours < 12) greetingText = "Good Morning";
    else if (hours < 18) greetingText = "Good Afternoon";

    setGreeting(greetingText);
    setDate(formattedDate);

    const isLogged = sessionStorage.getItem("isLogged");
    setIsLoggedIn(isLogged === "true");
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    document.cookie = "token=; path=/; max-age=0";
    setIsLoggedIn(false);
    navigate("/Login/signin");
  };

  const handleLogin = () => {
    navigate("/Login/signin");
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <h2 className={styles.greeting}>{greeting}, Admin</h2>
        <p className={styles.date}>{date}</p>
      </div>

      <div className={styles.rightSection}>
        <FiBell className={styles.icon} />
        {isLoggedIn ? (
          <button onClick={handleLogout} className={styles.authButton}>
            Logout
          </button>
        ) : (
          <button onClick={handleLogin} className={styles.authButton}>
            Login
          </button>
        )}
      </div>
    </header>
  );
}

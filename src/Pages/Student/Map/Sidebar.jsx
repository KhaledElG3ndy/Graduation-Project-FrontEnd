import React from "react";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";

const Sidebar = ({ children, onLocationSelect }) => {
  const handleLinkClick = (coordinates) => {
    if (onLocationSelect) {
      onLocationSelect(coordinates);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>FCI Buildings</h2>

        <button
          className={styles.link}
          onClick={() => handleLinkClick({ lat: 27.185855, lng: 31.16843 })}
        >
          Main Building
        </button>

        <button
          className={styles.link}
          onClick={() => handleLinkClick({ lat: 27.1862711, lng: 31.168343 })}
        >
          Laboratories Building
        </button>

        <Link to="/student/explorePlaces" className={styles.exploreLink}>
          Move inside buildings
        </Link>
      </div>

      <div className={styles.map}>{children}</div>
    </div>
  );
};

export default Sidebar;

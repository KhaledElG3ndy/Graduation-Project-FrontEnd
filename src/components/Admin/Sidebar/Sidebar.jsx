import styles from "./Sidebar.module.css";
import {
  FaChalkboardTeacher,
  FaRegCalendarAlt,
  FaUniversity,
  FaMapMarkedAlt,
  FaClipboardList,
  FaUserPlus,
  FaInfoCircle,
} from "react-icons/fa";

export default function Sidebar({ isOpen }) {
  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
    >
      <h1 className={styles.title}>Team Space</h1>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <FaClipboardList /> Dashboard
        </li>
        <li className={styles.navItem}>
          <FaRegCalendarAlt /> Regulation
        </li>
        <li className={styles.navItem}>
          <FaChalkboardTeacher /> Lecture Scheduler
        </li>
        <li className={styles.navItem}>
          <FaUniversity /> Professor Scheduler
        </li>
        <li className={styles.navItem}>
          <FaMapMarkedAlt /> Campus Map
        </li>
        <li className={styles.navItem}>
          <FaUserPlus /> Create Accounts
        </li>
      </ul>
    </aside>
  );
}

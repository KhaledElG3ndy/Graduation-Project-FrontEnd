import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";
import {
  FaChalkboardTeacher,
  FaRegCalendarAlt,
  FaUniversity,
  FaMapMarkedAlt,
  FaClipboardList,
  FaUserPlus,
  FaUserCog,
  FaBuilding,
} from "react-icons/fa";

export default function Sidebar({ isOpen }) {
  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
    >
      <h1 className={styles.title}>Team Space</h1>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link to="/dashboard">
            <FaClipboardList /> Dashboard
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/regulation">
            <FaRegCalendarAlt /> Regulation
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/lecture-scheduler">
            <FaChalkboardTeacher /> Lecture Scheduler
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/professor-scheduler">
            <FaUniversity /> Professor Scheduler
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/campus-map">
            <FaMapMarkedAlt /> Campus Map
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/Admin/CreateAccounts">
            <FaUserPlus /> Create Accounts
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/Admin/EmailCRUD">
            <FaUserCog /> Account Management
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/Admin/AddDepartment">
            <FaBuilding /> Departments
          </Link>
        </li>
      </ul>
    </aside>
  );
}

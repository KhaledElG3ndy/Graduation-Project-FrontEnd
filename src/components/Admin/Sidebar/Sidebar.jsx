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
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>TS</div>
        </div>
        <h1 className={styles.title}>Team Space</h1>
      </div>

      <nav className={styles.navigation}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link to="/admin" className={styles.navLink}>
              <div className={styles.iconWrapper}>
                <FaClipboardList />
              </div>
              <span className={styles.linkText}>Dashboard</span>
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/admin/regulation" className={styles.navLink}>
              <div className={styles.iconWrapper}>
                <FaRegCalendarAlt />
              </div>
              <span className={styles.linkText}>Regulation</span>
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/admin/lectureScheduler" className={styles.navLink}>
              <div className={styles.iconWrapper}>
                <FaChalkboardTeacher />
              </div>
              <span className={styles.linkText}>Lecture Scheduler</span>
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/admin/professorScheduler" className={styles.navLink}>
              <div className={styles.iconWrapper}>
                <FaUniversity />
              </div>
              <span className={styles.linkText}>Professor Scheduler</span>
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/Admin/guidance" className={styles.navLink}>
              <div className={styles.iconWrapper}>
                <FaMapMarkedAlt />
              </div>
              <span className={styles.linkText}>Campus Map</span>
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/Admin/CreateAccounts" className={styles.navLink}>
              <div className={styles.iconWrapper}>
                <FaUserPlus />
              </div>
              <span className={styles.linkText}>Create Accounts</span>
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/Admin/EmailCRUD" className={styles.navLink}>
              <div className={styles.iconWrapper}>
                <FaUserCog />
              </div>
              <span className={styles.linkText}>Account Management</span>
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/Admin/Departments" className={styles.navLink}>
              <div className={styles.iconWrapper}>
                <FaBuilding />
              </div>
              <span className={styles.linkText}>Departments</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

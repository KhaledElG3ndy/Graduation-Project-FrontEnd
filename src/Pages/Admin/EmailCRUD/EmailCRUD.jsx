import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import styles from "./EmailCRUD.module.css";
import Header from "../../../components/Admin/Header/Header";
import img from "../../../assets/images/EmailCRUD.svg";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import {AccountContext} from "../../../contexts/AccountContext";

export default function EmailCRUD() {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const { setSelectedAccount } = useContext(AccountContext);

  const api_url = "https://localhost:7072/api/Account";

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const studentsResponse = await fetch(`${api_url}/AllByRole?role=0`);
        const staffResponse = await fetch(`${api_url}/AllByRole?role=1`);

        if (!studentsResponse.ok || !staffResponse.ok)
          throw new Error("Failed to fetch");

        const studentsData = await studentsResponse.json();
        const staffData = await staffResponse.json();

        const combinedData = [
          ...studentsData.map((account) => ({
            ...account,
            Type: "Student",
            role: 0,
          })),
          ...staffData.map((account) => ({
            ...account,
            Type: "Staff",
            role: 1,
          })),
        ];

        setAccounts(combinedData);
      } catch (error) {
        toast.error("Error loading accounts");
      }
    };

    fetchAccounts();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm) return;
    try {
      const response = await fetch(`${api_url}/ByEmail?email=${searchTerm}`);

      if (!response.ok) {
        toast.error("Email not found");
        return;
      }

      const data = await response.json();
      setAccounts([{ ...data, Type: data.role === 0 ? "Student" : "Staff" }]);
    } catch (error) {
      toast.error("Search error");
    }
  };

  const handleEdit = async (account) => {
    console.log(account);
    let role = 0;
    if (account.Type == "Staff") {
      role = 1;
    }
    try {
      const response = await fetch(`${api_url}/Update?role=${role}`, {
        method: "PUT",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (email, role) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${api_url}/Delete?role=${role}&email=${email}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete");

      setAccounts((prevAccounts) =>
        prevAccounts.filter((acc) => acc.email !== email)
      );
      Swal.fire("Deleted!", "The account has been deleted.", "success");
    } catch (error) {
      Swal.fire("Error!", "Failed to delete the account.", "error");
    }
  };

  const handleToggle = () => {
    if (selectedRole === "all") setSelectedRole("staff");
    else if (selectedRole === "staff") setSelectedRole("student");
    else setSelectedRole("all");
  };

  const positions = {
    student: 0,
    all: 70,
    staff: 140,
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      selectedRole === "all" || account.Type.toLowerCase() === selectedRole
  );

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.leftSection}>
            <h1>Account Management</h1>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className={styles.searchInput}
              />
              <button className={styles.searchButton} onClick={handleSearch}>
                Search
              </button>
            </div>
            <div className={styles.toggleContainer} onClick={handleToggle}>
              <div
                className={styles.toggleIndicator}
                style={{
                  transform: `translateX(${positions[selectedRole]}px)`,
                }}
              />
              <span className={styles.toggleOption}>Student</span>
              <span className={styles.toggleOption}>All</span>
              <span className={styles.toggleOption}>Staff</span>
            </div>
          </div>
          <div className={styles.rightSection}>
            <img src={img} alt="Illustration" className={styles.img} />
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <tr key={account.email}>
                  <td>{account.name}</td>
                  <td>{account.email}</td>
                  <td>{account.Type}</td>
                  <td>
                    <Link
                      className={styles.editButton}
                      to="/Admin/EditAccount"
                      onClick={() => setSelectedAccount(account)}
                    >
                      <FaEdit size={18} color="#fff" />
                    </Link>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(account.email, account.role)}
                    >
                      <FaTrash size={18} color="#fff" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{ textAlign: "center", padding: "10px" }}
                >
                  No accounts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

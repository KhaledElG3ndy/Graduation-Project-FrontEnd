import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import styles from "./EmailCRUD.module.css";
import Header from "../../../components/Admin/Header/Header";
import img from "../../../assets/images/EmailCRUD.svg";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { AccountContext } from "../../../contexts/AccountContext";
import { useNavigate } from "react-router-dom";
export default function EmailCRUD() {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const { setSelectedAccount } = useContext(AccountContext);

  const API_URL = "https://localhost:7072/api/Account";
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
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const studentsResponse = await fetch(`${API_URL}/GetAllByRole?role=3`);
      const staffResponse1 = await fetch(`${API_URL}/GetAllByRole?role=1`);
      const staffResponse2 = await fetch(`${API_URL}/GetAllByRole?role=2`);

      if (!studentsResponse.ok || !staffResponse1.ok || !staffResponse2.ok)
        throw new Error("Failed to fetch accounts");

      const studentsData = await studentsResponse.json();
      const staffData1 = await staffResponse1.json();
      const staffData2 = await staffResponse2.json();

      const studentList = studentsData.students || [];
      const staffList1 = staffData1.staffs || [];
      const staffList2 = staffData2.staffs || [];

      setAccounts([
        ...studentList.map((account) => ({
          ...account,
          Type: "Student",
          role: 3,
        })),
        ...[...staffList1, ...staffList2].map((account) => ({
          ...account,
          Type: "Staff",
          role: account.role,
        })),
      ]);
    } catch (error) {
      toast.error("Error loading accounts");
      console.error("Fetch Error:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const response = await fetch(
        `${API_URL}/ByEmail?email=${searchTerm.toLowerCase()}`
      );

      if (!response.ok) {
        toast.error("Email not found");
        return;
      }

      const data = await response.json();
      setAccounts([{ ...data, Type: data.role === 3 ? "Student" : "Staff" }]);
    } catch (error) {
      toast.error("Search error");
      console.error("Search Error:", error);
    }
  };

  const handleEdit = async (account) => {
    try {
      const role = account.Type === "Student" ? 3 : 1;
      const response = await fetch(`${API_URL}/Update?role=${role}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(account),
      });

      if (!response.ok) throw new Error("Failed to update account");

      toast.success("Account updated successfully");
    } catch (err) {
      console.error("Edit Error:", err);
      toast.error("Error updating account");
    }
  };

  const handleDelete = async (id, role) => {
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
      const response = await fetch(`${API_URL}/Delete?role=${role}&id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setAccounts((prevAccounts) =>
        prevAccounts.filter((acc) => acc.id !== id)
      );
      Swal.fire("Deleted!", "The account has been deleted.", "success");
    } catch (error) {
      Swal.fire("Error!", "Failed to delete the account.", "error");
      console.error("Delete Error:", error);
    }
  };

  const handleToggle = () => {
    setSelectedRole((prevRole) =>
      prevRole === "all" ? "staff" : prevRole === "staff" ? "student" : "all"
    );
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
                  transform: `translateX(${
                    selectedRole === "student"
                      ? 0
                      : selectedRole === "all"
                      ? 70
                      : 140
                  }px)`,
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
                <tr key={account.id}>
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
                      onClick={() => handleDelete(account.id, account.role)}
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

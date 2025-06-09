import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import Swal from "sweetalert2";
import styles from "./Departments.module.css";
import Header from "../../../components/Admin/Header/Header";
import img from "../../../assets/images/AddSubjects.svg";

function Departments() {
  const navigate = useNavigate(); 
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        "https://localhost:7072/Departments/GetDepartments"
      );
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddDepartment = () => {
    navigate("/admin/AddDepartment"); 
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "This will permanently delete the department.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(
          `https://localhost:7072/Departments/DeleteDepartment/${id}`,
          {
            method: "DELETE",
          }
        );

        if (res.ok) {
          await Swal.fire(
            "Deleted!",
            "The department has been deleted.",
            "success"
          );
          fetchDepartments();
        } else {
          const errorMessage = await res.text();
          Swal.fire(
            "Error",
            errorMessage || "Could not delete the department.",
            "error"
          );
        }
      } catch (error) {
        Swal.fire("Error", "Failed to connect to server.", "error");
      }
    }
  };

  const handleEdit = (id, currentName) => {
    setEditingId(id);
    setNewName(currentName);
  };

  const handleUpdate = async (id) => {
    const exists = departments.some(
      (dept) =>
        dept.name.trim().toLowerCase() === newName.trim().toLowerCase() &&
        dept.id !== id
    );

    if (exists) {
      Swal.fire("Error", "This department name already exists.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("Name", newName);

    const res = await fetch(
      `https://localhost:7072/Departments/PutDepartment/${id}`,
      {
        method: "PUT",
        headers: {
          id: id.toString(),
        },
        body: formData,
      }
    );

    if (res.ok) {
      await Swal.fire(
        "Updated!",
        "Department name updated successfully.",
        "success"
      );
      setEditingId(null);
      setNewName("");
      fetchDepartments();
    } else {
      const errorMessage = await res.text();
      Swal.fire("Error", errorMessage || "Update failed.", "error");
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <h2 className={styles.title}>All Departments</h2>

          <div className={styles.addButtonContainer}>
            <button className={styles.addButton} onClick={handleAddDepartment}>
              <span className={styles.addButtonIcon}>+</span>
              Add New Department
            </button>
          </div>

          {departments.length === 0 ? (
            <p>No departments found.</p>
          ) : (
            <ul className={styles.list}>
              {departments.map((dept) => (
                <li key={dept.id} className={styles.listItem}>
                  {editingId === dept.id ? (
                    <>
                      <input
                        className={styles.inputInline}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                      <button
                        className={styles.buttonInline}
                        onClick={() => handleUpdate(dept.id)}
                      >
                        Save
                      </button>
                      <button
                        className={styles.buttonInlineCancel}
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{dept.name}</span>
                      <button
                        className={styles.buttonInline}
                        onClick={() => handleEdit(dept.id, dept.name)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.buttonInlineDelete}
                        onClick={() => handleDelete(dept.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.imageContainer}>
          <img src={img} alt="Departments Visual" className={styles.image} />
        </div>
      </div>
    </>
  );
}

export default Departments;

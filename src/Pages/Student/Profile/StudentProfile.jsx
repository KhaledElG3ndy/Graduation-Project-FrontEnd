import React, { useEffect, useState } from "react";
import styles from "./Profile.module.css";
import Swal from "sweetalert2";

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("https://localhost:7072/api/Profile/GetById", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        });

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        Swal.fire("Error", err.message || "Failed to fetch profile", "error");
      }
    };

    fetchProfile();
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return Swal.fire(
        "Validation Error",
        "All fields are required",
        "warning"
      );
    }

    try {
      const res = await fetch(
        "https://localhost:7072/api/Profile/ChangePassword",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
          body: JSON.stringify(passwordData),
        }
      );

      if (!res.ok) throw new Error(await res.text());
      Swal.fire("Success", "Password changed successfully!", "success");

      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (err) {
      Swal.fire("Error", err.message || "Password change failed", "error");
    }
  };

  if (!profile) {
    return <div className={styles.loading}>Loading profile...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h2 className={styles.heading}>Student Profile</h2>
      <div className={styles.info}>
        <img
          src={`data:image/jpeg;base64,${profile.imageBase64}`}
          alt="Profile"
          className={styles.profileImage}
        />
        <p>
          <strong>Name:</strong> {profile.name}
        </p>
        <p>
          <strong>Gender:</strong> {profile.gender ? "Male" : "Female"}
        </p>
        <p>
          <strong>Phone:</strong> {profile.phoneNumber}
        </p>
      </div>

      <hr className={styles.divider} />

      <h3 className={styles.subheading}>Change Password</h3>
      <form onSubmit={submitPasswordChange} className={styles.form}>
        <input
          type="password"
          name="currentPassword"
          value={passwordData.currentPassword}
          onChange={handlePasswordChange}
          placeholder="Current Password"
          className={styles.input}
        />
        <input
          type="password"
          name="newPassword"
          value={passwordData.newPassword}
          onChange={handlePasswordChange}
          placeholder="New Password"
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Change Password
        </button>
      </form>
    </div>
  );
};

export default StudentProfile;

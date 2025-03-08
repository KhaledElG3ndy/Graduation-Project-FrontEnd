import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import styles from "./SignInPage.module.css";
import FormInput from "../../../components/Student/FormInput/FormInput";
import Button from "../../../components/Student/Button/Button";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!termsAccepted) {
      setError("You must accept the Terms & Conditions.");
      return;
    }

    setLoading(true);
    setError("");
    const api_url = "https://localhost:44338/User/Login";

    try {
      const response = await fetch(api_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password. Please try again.");
      }

      const data = await response.json();
      console.log("Success:", data);

      sessionStorage.setItem("isLogged", JSON.stringify(true));

      if (data.doctor) {
        if (data.doctor.name === "Admin User") {
          sessionStorage.setItem("userType", JSON.stringify("Admin"));
          navigate("/Admin");
        } else {
          sessionStorage.setItem("userType", JSON.stringify("Professor"));
          navigate("/Professor");
        }
      } else {
        sessionStorage.setItem("userType", JSON.stringify("Student"));
        navigate("/");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageSection}>
        <Link to="/" className={styles.backToWebsite}>
          Back to website →
        </Link>
        <div className={styles.overlay}>Streamline Your College Life</div>
        <div className={styles.pagination}>
          <div className={`${styles.dot} ${styles.active}`}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>
      </div>

      <div className={styles.formSection}>
        <h2>
          Start Learning <strong>Today!</strong>
        </h2>
        <p className={styles.loginP}>
          Log in to explore your courses and track your progress.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}
          <FormInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormInput
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className={styles.terms}>
            <input
              type="checkbox"
              id="terms"
              className={styles.check}
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            <label htmlFor="terms">
              I agree to the <Link to="/terms">Terms & Conditions</Link>
            </label>
          </div>
          <Button className={styles.login} type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignInForm;

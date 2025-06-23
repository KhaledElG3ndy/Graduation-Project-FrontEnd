import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import styles from "./SignInPage.module.css";
import FormInput from "../../../components/Student/FormInput/FormInput";
import Button from "../../../components/Student/Button/Button";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  const handleLogin = async () => {
    if (!termsAccepted) {
      setError("You must accept the Terms & Conditions.");
      return;
    }

    setLoading(true);
    setError("");
    const api_url = "https://localhost:7072/api/Account/Login";

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

      document.cookie = `token=${data.token}; path=/; max-age=1800`;

      sessionStorage.setItem("isLogged", JSON.stringify(true));
      sessionStorage.setItem("Token", data.token);

      const payload = parseJwt(data.token);
      console.log("Decoded JWT Payload:", payload);
      if (payload) {
        const role =
          payload[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];

        if (role === "Admin") {
          sessionStorage.setItem("userType", JSON.stringify("Admin"));
          navigate("/Admin");
        } else if (role === "Professor") {
          sessionStorage.setItem("userType", JSON.stringify("Professor"));
          navigate("/Professor");
        } else {
          sessionStorage.setItem("userType", JSON.stringify("Student"));
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Server Not Found");
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
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <div className={styles.welcomeIcon}>
              <FiArrowRight className={styles.iconRotate} />
            </div>
            <h2 className={styles.title}>
              Welcome <span className={styles.highlight}>Back!</span>
            </h2>
            <p className={styles.subtitle}>
              Sign in to access your learning dashboard and continue your
              educational journey.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.errorMessage}>
                <span className={styles.errorText}>{error}</span>
              </div>
            )}

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <FiMail className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <FiLock className={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                  className={styles.hiddenCheckbox}
                />
                <div className={styles.customCheckbox}>
                  {termsAccepted && <FiCheck className={styles.checkIcon} />}
                </div>
                <span className={styles.checkboxText}>
                  I agree to the{" "}
                  <Link to="/terms" className={styles.termsLink}>
                    Terms & Conditions
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${styles.submitButton} ${
                loading ? styles.loading : ""
              }`}
            >
              <span className={styles.buttonText}>
                {loading ? "Signing in..." : "Sign In"}
              </span>
              {!loading && <FiArrowRight className={styles.buttonIcon} />}
              {loading && <div className={styles.spinner}></div>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;

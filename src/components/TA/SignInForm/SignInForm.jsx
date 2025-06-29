import React from "react";
import styles from "./SignInForm.module.css";
import FormInput from "../../FormInput/FormInput";
import Button from "../../Button/Button";

const SignInForm = () => {
  return (
    <div className={styles.signupContainer}>
      <form className={styles.form}>
        <h2>Start Learning Today!</h2>
        <p>Log in to explore your courses and track your progress.</p>
        <FormInput type="email" placeholder="Email" />
        <FormInput type="password" placeholder="Enter your password" />
        <div className={styles.terms}>
          <input type="checkbox" id="terms" className={styles.check} />
          <label htmlFor="terms">
            I agree to the <a href="/terms">Terms & Conditions</a>
          </label>
        </div>
        <Button className={styles.login}>Login</Button>
      </form>
    </div>
  );
};

export default SignInForm;

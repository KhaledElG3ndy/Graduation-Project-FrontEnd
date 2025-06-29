import React from "react";
import styles from "./Button.module.css";

const Button = ({ children, variant, ...props }) => {
  const buttonClass = `${styles.button} ${styles[variant] || ""}`;
  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};

export default Button;

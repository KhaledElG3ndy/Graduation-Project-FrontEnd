import React from "react";
import styles from "./FormInput.module.css";

const FormInput = ({ type, placeholder, ...props }) => (
  <input
    className={styles.input}
    type={type}
    placeholder={placeholder}
    {...props}
  />
);

export default FormInput;

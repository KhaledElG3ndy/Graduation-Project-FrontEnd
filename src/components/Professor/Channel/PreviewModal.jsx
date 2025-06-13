import React from "react";
import { FiX } from "react-icons/fi";
import styles from "./CoursePage.module.css";

const PreviewModal = ({
  isPreviewModalOpen,
  setIsPreviewModalOpen,
  previewUrl,
  previewType,
  previewFileName,
}) => {
  return (
    <>
      {isPreviewModalOpen && (
        <div className={styles.previewModal}>
          <div
            className={styles.modalOverlay}
            onClick={() => setIsPreviewModalOpen(false)}
          />
          <div className={styles.modalContent}>
            <button
              className={styles.closeButton}
              onClick={() => setIsPreviewModalOpen(false)}
            >
              <FiX />
            </button>
            <h3 className={styles.previewFileName}>
              {previewFileName || "Untitled File"}
            </h3>
            {previewType === "pdf" ? (
              <iframe
                src={previewUrl}
                style={{ width: "100%", height: "600px", border: "none" }}
                title="PDF Preview"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "600px" }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PreviewModal;

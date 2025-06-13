import React from "react";
import { FiFile, FiEye, FiDownload } from "react-icons/fi";
import styles from "./CoursePage.module.css";

const MaterialGrid = ({ materials, getFileIcon, handlePreview }) => {
  return (
    <div className={styles.materialsGrid}>
      <h3>Course Materials</h3>
      {materials.length > 0 ? (
        materials.map((material) => {
          const fileExtension = material.fileName
            ?.split(".")
            .pop()
            ?.toLowerCase();
          const isPreviewable = ["jpg", "jpeg", "png", "gif", "pdf"].includes(
            fileExtension
          );
          return (
            <div key={material.id} className={styles.materialCard}>
              <div className={styles.materialIcon}>
                {getFileIcon(fileExtension)}
              </div>
              <div className={styles.materialInfo}>
                <h4>{material.title}</h4>
                <p className={styles.fileName}>
                  <FiFile className={styles.fileIcon} />
                  {material.fileName || "Untitled File"}
                </p>
                <small>
                  Uploaded: {new Date(material.uploadedAt).toLocaleString()}
                </small>
              </div>
              <div className={styles.materialActions}>
                {isPreviewable && (
                  <button
                    className={styles.previewButton}
                    onClick={() =>
                      handlePreview(
                        material.id,
                        fileExtension,
                        material.fileName
                      )
                    }
                  >
                    <FiEye />
                    Preview
                  </button>
                )}
                <button
                  className={styles.downloadButton}
                  onClick={() =>
                    window.open(
                      `https://localhost:7072/api/Material/download/${material.id}`,
                      "_blank"
                    )
                  }
                >
                  <FiDownload />
                  Download
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <div className={styles.noMaterials}>
          <p>No materials uploaded yet.</p>
        </div>
      )}
    </div>
  );
};

export default MaterialGrid;

import React from "react";
import { FiFileText, FiDownload, FiEye, FiTrash2 } from "react-icons/fi";
import styles from "./CoursePage.module.css";
import Swal from "sweetalert2";

const MaterialGrid = ({
  materials,
  getFileIcon,
  handlePreview,
  formatFileSize,
  handleDeleteFile,
}) => {
  const confirmDelete = (fileId, fileName) => {
    Swal.fire({
      title: "Delete File?",
      text: `Are you sure you want to delete "${fileName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteFile(fileId);
      }
    });
  };

  return (
    <div className={styles.materialGrid}>
      <h3 className={styles.tabTitle}>Course Materials</h3>

      {materials.length === 0 ? (
        <div className={styles.emptyState}>
          <FiFileText size={48} />
          <p>No materials uploaded for this course yet.</p>
        </div>
      ) : (
        <ul className={styles.materialList}>
          {materials.map((material) => (
            <li key={material.id} className={styles.materialCard}>
              <div className={styles.materialHeader}>
                <FiFileText size={24} className={styles.materialIcon} />
                <div>
                  <h4 className={styles.materialTitle}>{material.name}</h4>
                  <p className={styles.uploadDate}>
                    Uploaded at:{" "}
                    {new Date(material.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className={styles.filesContainer}>
                {material.files &&
                  material.files.map((file) => {
                    const isPreviewable = [
                      "jpg",
                      "jpeg",
                      "png",
                      "gif",
                      "pdf",
                    ].includes(file.extension?.toLowerCase());

                    return (
                      <div key={file.id} className={styles.fileItem}>
                        <div className={styles.fileIcon}>
                          {getFileIcon(file.extension)}
                        </div>
                        <div className={styles.fileInfo}>
                          <span className={styles.fileName}>
                            {file.fileName}
                          </span>
                          <span className={styles.fileSize}>
                            {formatFileSize(file.fileSize)}
                          </span>
                        </div>
                        <div className={styles.fileActions}>
                          {isPreviewable && (
                            <button
                              className={styles.previewButton}
                              onClick={() =>
                                handlePreview(
                                  file.id,
                                  file.extension,
                                  file.fileName
                                )
                              }
                            >
                              <FiEye style={{ marginRight: "4px" }} />
                              Preview
                            </button>
                          )}
                          <a
                            href={`https://localhost:7072/api/Materials/download/${file.id}`}
                            download={file.fileName}
                            className={styles.downloadButton}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FiDownload style={{ marginRight: "4px" }} />
                            Download
                          </a>
                          <button
                            className={styles.deleteButton}
                            onClick={() =>
                              confirmDelete(file.id, file.fileName)
                            }
                          >
                            <FiTrash2 style={{ marginRight: "4px" }} />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MaterialGrid;

import React from "react";
import { FiPlus, FiX, FiLoader, FiUpload } from "react-icons/fi";
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileImage,
  FaFileArchive,
  FaFileAlt,
  FaFileCode,
  FaFileAudio,
  FaFileVideo,
} from "react-icons/fa";
import styles from "./CoursePage.module.css";

const MaterialForm = ({
  materialForm,
  handleMaterialInputChange,
  handleMaterialFileChange,
  selectedFiles,
  removeFile,
  clearAllFiles,
  handleMaterialSubmit,
  isUploading,
  getFileIcon,
  formatFileSize,
}) => {
  return (
    <div className={styles.uploadFormCard}>
      <h3>Upload New Materials</h3>
      <form onSubmit={handleMaterialSubmit} className={styles.form}>
        <input
          type="text"
          name="title"
          placeholder="Enter material title..."
          value={materialForm.title}
          onChange={handleMaterialInputChange}
          required
          disabled={isUploading}
          className={styles.inputField}
        />

        <div className={styles.fileInputWrapper}>
          <label htmlFor="file-upload" className={styles.fileInputLabel}>
            <FiPlus className={styles.uploadIcon} />
            Select Files
          </label>
          <input
            id="file-upload"
            type="file"
            name="files"
            onChange={handleMaterialFileChange}
            multiple
            className={styles.fileInput}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className={styles.filePreviewSection}>
            <div className={styles.previewHeader}>
              <h4>Selected Files ({selectedFiles.length})</h4>
              <button
                type="button"
                onClick={clearAllFiles}
                className={styles.clearAllButton}
                disabled={isUploading}
              >
                Clear All
              </button>
            </div>

            <div className={styles.filePreviewGrid}>
              {selectedFiles.map((fileData) => (
                <div key={fileData.id} className={styles.filePreviewCard}>
                  <div className={styles.filePreviewHeader}>
                    <div className={styles.fileIcon}>
                      {getFileIcon(fileData.extension)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(fileData.id)}
                      className={styles.removeFileButton}
                      disabled={isUploading}
                    >
                      <FiX />
                    </button>
                  </div>

                  {fileData.preview && (
                    <div className={styles.imagePreview}>
                      <img
                        src={fileData.preview}
                        alt={fileData.name}
                        className={styles.previewImage}
                      />
                    </div>
                  )}

                  <div className={styles.fileInfo}>
                    <p className={styles.fileName} title={fileData.name}>
                      {fileData.name.length > 20
                        ? `${fileData.name.substring(0, 20)}...`
                        : fileData.name}
                    </p>
                    <p className={styles.fileSize}>
                      {formatFileSize(fileData.size)}
                    </p>
                    <p className={styles.fileType}>
                      {fileData.extension?.toUpperCase() || "Unknown"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading || selectedFiles.length === 0}
          className={styles.submitButton}
        >
          {isUploading ? (
            <>
              <FiLoader className={`${styles.buttonIcon} ${styles.spinning}`} />
              Uploading {selectedFiles.length} file(s)...
            </>
          ) : (
            <>
              <FiUpload className={styles.buttonIcon} />
              Upload {selectedFiles.length} Material(s)
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MaterialForm;

import React, { useState } from "react";
import {
  Clock,
  Calendar,
  FileText,
  Award,
  ArrowRight,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import styles from "./ExamForm.module.css";

const ExamForm = ({ subjectName, courseId, onNext }) => {
  const [examForm, setExamForm] = useState({
    startDate: "",
    duration: "",
    examType: "",
    totalMarks: "",
    passingMarks: "",
    instructions: "",
    shuffleQuestions: false,
    showResults: true,
  });
  console.log(courseId, subjectName);

  const [errors, setErrors] = useState({});

  const examTypes = [
    { value: "0", label: "Final" },
    { value: "1", label: "Midterm" },
    { value: "2", label: "Practical" },
    { value: "3", label: "Quiz" },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamForm({
      ...examForm,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!examForm.startDate) newErrors.startDate = "Start date is required";
    if (!examForm.duration) newErrors.duration = "Duration is required";
    if (!examForm.examType) newErrors.examType = "Exam type is required";
    if (!examForm.totalMarks) newErrors.totalMarks = "Total marks is required";
    if (!examForm.passingMarks)
      newErrors.passingMarks = "Passing marks is required";
    if (!examForm.instructions.trim())
      newErrors.instructions = "Instructions are required";

    if (examForm.totalMarks && examForm.passingMarks) {
      if (parseInt(examForm.passingMarks) > parseInt(examForm.totalMarks)) {
        newErrors.passingMarks = "Passing marks cannot exceed total marks";
      }
    }

    if (examForm.startDate) {
      const now = new Date();
      const selectedDateTime = new Date(examForm.startDate);

      if (selectedDateTime < now) {
        newErrors.startDate = "Start date and time cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("StartDate", examForm.startDate);
    formData.append("Duration", examForm.duration);
    formData.append("type", examForm.examType);
    formData.append("Grade", examForm.totalMarks);
    formData.append("PassingScore", examForm.passingMarks);
    formData.append("Instructions", examForm.instructions);
    formData.append("IsShuffled", examForm.shuffleQuestions ? 1 : 0);
    formData.append("GradeIsSeen", examForm.showResults ? 1 : 0);
    formData.append("CourseId", courseId);
    console.log(courseId);

    try {
      const response = await fetch("https://localhost:7072/Exams/PostExam/0", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to create exam: ${errText}`);
      }

      const data = await response.json();
      console.log("Exam created:", data);

      if (onNext) {
        console.log("Exam data to pass to next step:", data);

        onNext(data);
      }
    } catch (error) {
      console.error("Error posting exam:", error.message);
      alert("Failed to submit exam. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPassRate = () => {
    if (examForm.totalMarks && examForm.passingMarks) {
      return Math.round((examForm.passingMarks / examForm.totalMarks) * 100);
    }
    return 0;
  };

  const getExamTypeLabel = () => {
    const type = examTypes.find((t) => t.value === examForm.examType);
    return type ? type.label : "";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerOverlay}></div>
        <div className={styles.headerContent}>
          <div className={styles.headerCenter}>
            <div className={styles.headerIcon}>
              <FileText className={styles.headerIconSvg} />
            </div>
            <h1 className={styles.title}>Create New Exam</h1>
            <p className={styles.subtitle}>
              Subject: <span className={styles.subjectName}>{subjectName}</span>
            </p>

            <div className={styles.progressSteps}>
              <div className={styles.stepActive}>
                <div className={styles.stepNumberActive}>1</div>
                <span className={styles.stepLabelActive}>Exam Details</span>
              </div>
              <div className={styles.stepConnector}></div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <span className={styles.stepLabel}>Add Questions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formWrapper}>
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.sectionBlue}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIconBlue}>
                    <Calendar className={styles.sectionIconSvg} />
                  </div>
                  <h3 className={styles.sectionTitle}>Schedule</h3>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Start Date <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={examForm.startDate}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.startDate ? styles.inputError : ""
                    }`}
                    min={new Date().toISOString().slice(0, 16)}
                  />

                  {errors.startDate && (
                    <div className={styles.errorMessage}>
                      <AlertCircle className={styles.errorIcon} />
                      <span>{errors.startDate}</span>
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Duration (minutes){" "}
                    <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithIcon}>
                    <Clock className={styles.inputIcon} />
                    <input
                      type="number"
                      name="duration"
                      value={examForm.duration}
                      onChange={handleInputChange}
                      className={`${styles.inputWithIconInput} ${
                        errors.duration ? styles.inputError : ""
                      }`}
                      placeholder="e.g., 120"
                      min="1"
                    />
                  </div>
                  {errors.duration && (
                    <div className={styles.errorMessage}>
                      <AlertCircle className={styles.errorIcon} />
                      <span>{errors.duration}</span>
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Exam Type <span className={styles.required}>*</span>
                  </label>
                  <select
                    name="examType"
                    value={examForm.examType}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.examType ? styles.inputError : ""
                    }`}
                  >
                    <option value="">Select exam type</option>
                    {examTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.examType && (
                    <div className={styles.errorMessage}>
                      <AlertCircle className={styles.errorIcon} />
                      <span>{errors.examType}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.sectionGreen}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIconGreen}>
                    <Award className={styles.sectionIconSvg} />
                  </div>
                  <h3 className={styles.sectionTitle}>Scoring</h3>
                </div>

                <div className={styles.scoreGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      Total Marks <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="number"
                      name="totalMarks"
                      value={examForm.totalMarks}
                      onChange={handleInputChange}
                      className={`${styles.input} ${
                        errors.totalMarks ? styles.inputError : ""
                      }`}
                      placeholder="e.g., 100"
                      min="1"
                    />
                    {errors.totalMarks && (
                      <div className={styles.errorMessage}>
                        <AlertCircle className={styles.errorIcon} />
                        <span>{errors.totalMarks}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      Passing Marks <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="number"
                      name="passingMarks"
                      value={examForm.passingMarks}
                      onChange={handleInputChange}
                      className={`${styles.input} ${
                        errors.passingMarks ? styles.inputError : ""
                      }`}
                      placeholder="e.g., 45"
                      min="1"
                    />
                    {errors.passingMarks && (
                      <div className={styles.errorMessage}>
                        <AlertCircle className={styles.errorIcon} />
                        <span>{errors.passingMarks}</span>
                      </div>
                    )}
                  </div>
                </div>

                {examForm.totalMarks && examForm.passingMarks && (
                  <div className={styles.passRateIndicator}>
                    <div className={styles.passRateHeader}>
                      <span className={styles.passRateLabel}>
                        Pass Rate Required
                      </span>
                      <span className={styles.passRateValue}>
                        {getPassRate()}%
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${getPassRate()}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className={styles.settingsGroup}>
                  <h4 className={styles.settingsTitle}>Exam Settings</h4>
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="shuffleQuestions"
                        checked={examForm.shuffleQuestions}
                        onChange={handleInputChange}
                        className={styles.checkbox}
                      />
                      <span className={styles.checkboxText}>
                        Shuffle Questions
                      </span>
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="showResults"
                        checked={examForm.showResults}
                        onChange={handleInputChange}
                        className={styles.checkbox}
                      />
                      <span className={styles.checkboxText}>
                        Show Results After Submission
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.instructionsSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconPurple}>
                  <BookOpen className={styles.sectionIconSvg} />
                </div>
                <h3 className={styles.sectionTitle}>Instructions</h3>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Exam Instructions <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="instructions"
                  value={examForm.instructions}
                  onChange={handleInputChange}
                  className={`${styles.textarea} ${
                    errors.instructions ? styles.inputError : ""
                  }`}
                  placeholder="Enter detailed instructions for the exam..."
                  rows="6"
                />
                {errors.instructions && (
                  <div className={styles.errorMessage}>
                    <AlertCircle className={styles.errorIcon} />
                    <span>{errors.instructions}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.submitSection}>
              <button type="submit" className={styles.submitButton}>
                <span>Next: Add Questions</span>
                <ArrowRight className={styles.submitIcon} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExamForm;

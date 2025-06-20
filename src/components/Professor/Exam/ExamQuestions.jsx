import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiSave,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiX,
} from "react-icons/fi";
import styles from "./ExamQuestions.module.css";

const ExamQuestions = ({ subjectName, examData, onBack, onSubmit }) => {
  const storageKey = `exam_draft_${subjectName.replace(/\s+/g, "_")}`;

  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return {
          questions: parsed.questions || [],
          currentQuestion: parsed.currentQuestion || {
            id: null,
            type: "multiple-choice",
            question: "",
            options: ["", ""],
            correctAnswer: 0,
            correctAnswers: [],
            marks: 1,
            explanation: "",
            imageFile: null,
            attachmentFile: null,
          },
          editingIndex: parsed.editingIndex || -1,
        };
      }
    } catch (e) {
      localStorage.removeItem(storageKey);
    }
    return {
      questions: [],
      currentQuestion: {
        id: null,
        type: "multiple-choice",
        question: "",
        options: ["", ""],
        correctAnswer: 0,
        correctAnswers: [],
        marks: 1,
        explanation: "",
        imageFile: null,
        attachmentFile: null,
      },
      editingIndex: -1,
    };
  };

  const savedData = loadSavedData();
  const [questions, setQuestions] = useState(savedData.questions);
  const [currentQuestion, setCurrentQuestion] = useState(
    savedData.currentQuestion
  );
  const [editingIndex, setEditingIndex] = useState(savedData.editingIndex);
  const [errors, setErrors] = useState({});
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(
    savedData.questions.length > 0
  );
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  const questionTypes = [
    { value: "multiple-choice", label: "Multiple Choice" },
    { value: "checkbox", label: "Multiple Select (Checkbox)" },
    { value: "essay", label: "Essay" },
  ];

  const saveToLocalStorage = (data) => {
    try {
      const saveData = {
        questions: data.questions.map((q) => ({
          ...q,
          imageFile: null,
          attachmentFile: null,
        })),
        currentQuestion: {
          ...data.currentQuestion,
          imageFile: null,
          attachmentFile: null,
        },
        editingIndex: data.editingIndex,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      setLastSavedTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    saveToLocalStorage({ questions, currentQuestion, editingIndex });
  }, [questions, currentQuestion, editingIndex]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (questions.length > 0) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes! Make sure to save your data before leaving.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [questions]);

  const handleQuestionChange = (field, value) => {
    const updatedQuestion = { ...currentQuestion, [field]: value };
    setCurrentQuestion(updatedQuestion);
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const handleTypeChange = (newType) => {
    let updatedQuestion = { ...currentQuestion, type: newType };
    if (newType === "multiple-choice") {
      updatedQuestion.options = ["", ""];
      updatedQuestion.correctAnswer = 0;
      updatedQuestion.correctAnswers = [];
    } else if (newType === "checkbox") {
      updatedQuestion.options = ["", ""];
      updatedQuestion.correctAnswers = [];
      updatedQuestion.correctAnswer = null;
    } else {
      updatedQuestion.options = [];
      updatedQuestion.correctAnswer = null;
      updatedQuestion.correctAnswers = [];
    }
    setCurrentQuestion(updatedQuestion);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, ""],
    });
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length <= 2) return;
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    let updatedQuestion = { ...currentQuestion, options: newOptions };
    if (currentQuestion.type === "multiple-choice") {
      if (currentQuestion.correctAnswer === index) {
        updatedQuestion.correctAnswer = 0;
      } else if (currentQuestion.correctAnswer > index) {
        updatedQuestion.correctAnswer -= 1;
      }
    }
    if (currentQuestion.type === "checkbox") {
      updatedQuestion.correctAnswers = currentQuestion.correctAnswers
        .filter((ansIndex) => ansIndex !== index)
        .map((ansIndex) => (ansIndex > index ? ansIndex - 1 : ansIndex));
    }
    setCurrentQuestion(updatedQuestion);
  };

  const handleCheckboxAnswer = (index, checked) => {
    let newCorrectAnswers = [...currentQuestion.correctAnswers];
    if (checked) {
      if (!newCorrectAnswers.includes(index)) newCorrectAnswers.push(index);
    } else {
      newCorrectAnswers = newCorrectAnswers.filter((i) => i !== index);
    }
    setCurrentQuestion({
      ...currentQuestion,
      correctAnswers: newCorrectAnswers,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentQuestion({ ...currentQuestion, imageFile: file });
    }
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentQuestion({ ...currentQuestion, attachmentFile: file });
    }
  };

  const handleRemoveImage = () => {
    setCurrentQuestion({ ...currentQuestion, imageFile: null });
  };

  const handleRemoveAttachment = () => {
    setCurrentQuestion({ ...currentQuestion, attachmentFile: null });
  };

  const validateQuestion = () => {
    const newErrors = {};
    if (!currentQuestion.question.trim())
      newErrors.question = "Question text is required";
    if (currentQuestion.type === "multiple-choice") {
      const filledOptions = currentQuestion.options.filter((opt) => opt.trim());
      if (filledOptions.length < 2)
        newErrors.options = "At least 2 options are required";
      if (!currentQuestion.options[currentQuestion.correctAnswer]?.trim())
        newErrors.correctAnswer = "Please select a valid correct answer";
    }
    if (currentQuestion.type === "checkbox") {
      const filledOptions = currentQuestion.options.filter((opt) => opt.trim());
      if (filledOptions.length < 2)
        newErrors.options = "At least 2 options are required";
      if (currentQuestion.correctAnswers.length === 0)
        newErrors.correctAnswers = "Please select at least one correct answer";
      if (
        currentQuestion.correctAnswers.some(
          (index) => !currentQuestion.options[index]?.trim()
        )
      )
        newErrors.correctAnswers =
          "Please ensure all selected correct answers have text";
    }

    if (currentQuestion.marks <= 0)
      newErrors.marks = "Marks must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addQuestion = () => {
    if (validateQuestion()) {
      const newQuestion = { ...currentQuestion, id: Date.now() };
      if (editingIndex >= 0) {
        const updatedQuestions = [...questions];
        updatedQuestions[editingIndex] = newQuestion;
        setQuestions(updatedQuestions);
      } else {
        setQuestions([...questions, newQuestion]);
      }
      resetCurrentQuestion();
      setEditingIndex(-1);
      setIsQuestionModalOpen(false);
    }
  };

  const resetCurrentQuestion = () => {
    setCurrentQuestion({
      id: null,
      type: "multiple-choice",
      question: "",
      options: ["", ""],
      correctAnswer: 0,
      correctAnswers: [],
      marks: 1,
      explanation: "",
      imageFile: null,
      attachmentFile: null,
    });
    setErrors({});
  };

  const openAddQuestionModal = () => {
    resetCurrentQuestion();
    setEditingIndex(-1);
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (index) => {
    setCurrentQuestion({ ...questions[index] });
    setEditingIndex(index);
    setIsQuestionModalOpen(true);
  };

  const cancelQuestion = () => {
    resetCurrentQuestion();
    setEditingIndex(-1);
    setIsQuestionModalOpen(false);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const getTotalMarks = () => {
    return questions.reduce((total, q) => total + parseInt(q.marks), 0);
  };

  const handleSubmitExam = () => {
    const storageKey = `exam_draft_${subjectName.replace(/\s+/g, "_")}`;
    const savedData = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const questions = savedData.questions || [];

    if (questions.length === 0) {
      alert("No Questions");
      return;
    }

    console.log("Saved Questions Draft:", questions);
  };

  const renderQuestionForm = () => (
    <div className={styles.formContent}>
      <div className={styles.formGrid}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Question Type</label>
          <select
            value={currentQuestion.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className={styles.select}
          >
            {questionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Marks <span className={styles.required}>*</span>
          </label>
          <input
            type="number"
            min="1"
            value={currentQuestion.marks}
            onChange={(e) =>
              handleQuestionChange("marks", parseInt(e.target.value))
            }
            className={`${styles.input} ${errors.marks ? styles.error : ""}`}
          />
          {errors.marks && (
            <span className={styles.errorText}>{errors.marks}</span>
          )}
        </div>
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.label}>
          Question <span className={styles.required}>*</span>
        </label>
        <textarea
          value={currentQuestion.question}
          onChange={(e) => handleQuestionChange("question", e.target.value)}
          className={`${styles.textarea} ${
            errors.question ? styles.error : ""
          }`}
          rows="3"
          placeholder="Enter your question here..."
        />
        {errors.question && (
          <span className={styles.errorText}>{errors.question}</span>
        )}
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.label}>Attach Image (Optional)</label>
        {currentQuestion.imageFile ? (
          <div className={styles.filePreview}>
            <img
              src={URL.createObjectURL(currentQuestion.imageFile)}
              alt="Preview"
              className={styles.imagePreview}
            />
            <button onClick={handleRemoveImage} className={styles.removeButton}>
              Remove
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.fileInput}
          />
        )}
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.label}>Attach File (Optional)</label>
        {currentQuestion.attachmentFile ? (
          <div className={styles.filePreview}>
            <span>{currentQuestion.attachmentFile.name}</span>
            <button
              onClick={handleRemoveAttachment}
              className={styles.removeButton}
            >
              Remove
            </button>
          </div>
        ) : (
          <input
            type="file"
            onChange={handleAttachmentChange}
            className={styles.fileInput}
          />
        )}
      </div>
      {currentQuestion.type === "multiple-choice" && (
        <div className={styles.optionsSection}>
          <label className={styles.label}>Options</label>
          {currentQuestion.options.map((option, index) => (
            <div key={index} className={styles.optionRow}>
              <input
                type="radio"
                name="correctAnswer"
                checked={currentQuestion.correctAnswer === index}
                onChange={() => handleQuestionChange("correctAnswer", index)}
                className={styles.radio}
              />
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className={`${styles.input} ${
                  errors.options ? styles.error : ""
                }`}
                placeholder={`Option ${index + 1}`}
              />
              {currentQuestion.options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className={styles.removeOptionButton}
                >
                  <FiX />
                </button>
              )}
            </div>
          ))}
          <button onClick={addOption} className={styles.addOptionButton}>
            Add Option
          </button>
          {errors.options && (
            <span className={styles.errorText}>{errors.options}</span>
          )}
          {errors.correctAnswer && (
            <span className={styles.errorText}>{errors.correctAnswer}</span>
          )}
        </div>
      )}
      {currentQuestion.type === "checkbox" && (
        <div className={styles.optionsSection}>
          <label className={styles.label}>Options</label>
          {currentQuestion.options.map((option, index) => (
            <div key={index} className={styles.optionRow}>
              <input
                type="checkbox"
                checked={currentQuestion.correctAnswers.includes(index)}
                onChange={(e) => handleCheckboxAnswer(index, e.target.checked)}
                className={styles.checkbox}
              />
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className={`${styles.input} ${
                  errors.options ? styles.error : ""
                }`}
                placeholder={`Option ${index + 1}`}
              />
              {currentQuestion.options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className={styles.removeOptionButton}
                >
                  <FiX />
                </button>
              )}
            </div>
          ))}
          <button onClick={addOption} className={styles.addOptionButton}>
            Add Option
          </button>
          {errors.options && (
            <span className={styles.errorText}>{errors.options}</span>
          )}
          {errors.correctAnswers && (
            <span className={styles.errorText}>{errors.correctAnswers}</span>
          )}
        </div>
      )}

      <button onClick={addQuestion} className={styles.addButton}>
        <FiSave className={styles.buttonIcon} />
        {editingIndex >= 0 ? "Update Question" : "Add Question"}
      </button>
    </div>
  );

  const renderQuestionsList = () => (
    <div className={styles.questionsList}>
      <div className={styles.listHeader}>
        <h3>Questions ({questions.length})</h3>
        <div className={styles.totalMarks}>Total Marks: {getTotalMarks()}</div>
      </div>
      {questions.length === 0 ? (
        <div className={styles.emptyState}>
          <FiAlertCircle className={styles.emptyIcon} />
          <p>No questions added yet. Create your first question above.</p>
        </div>
      ) : (
        <div className={styles.questionsGrid}>
          {questions.map((question, index) => (
            <div key={question.id} className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <div className={styles.questionNumber}>
                  Question {index + 1}
                </div>
                <div className={styles.questionMeta}>
                  <span className={styles.questionType}>
                    {
                      questionTypes.find((t) => t.value === question.type)
                        ?.label
                    }
                  </span>
                  <span className={styles.questionMarks}>
                    {question.marks} {question.marks === 1 ? "mark" : "marks"}
                  </span>
                </div>
                <div className={styles.questionActions}>
                  <button
                    onClick={() => openEditQuestionModal(index)}
                    className={styles.editButton}
                    title="Edit Question"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => deleteQuestion(index)}
                    className={styles.deleteButton}
                    title="Delete Question"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <div className={styles.questionContent}>
                <p className={styles.questionText}>{question.question}</p>
                {question.imageFile && (
                  <span className={styles.attachmentIndicator}>
                    📷 Image attached
                  </span>
                )}
                {question.attachmentFile && (
                  <span className={styles.attachmentIndicator}>
                    📎 File attached
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.examQuestionsContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={onBack} className={styles.backButton}>
            <FiArrowLeft />
          </button>
          <div className={styles.headerInfo}>
            <FiFileText className={styles.headerIcon} />
            <div>
              <h1 className={styles.title}>Add Questions</h1>
              <p className={styles.subtitle}>Subject: {subjectName}</p>
            </div>
          </div>
        </div>
        <div className={styles.stepIndicator}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepLabel}>Exam Details</span>
          </div>
          <div className={styles.stepConnector}></div>
          <div className={`${styles.step} ${styles.active}`}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>Add Questions</span>
          </div>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <button
            onClick={openAddQuestionModal}
            className={styles.addQuestionButton}
          >
            <FiPlus /> Add Question
          </button>
          {renderQuestionsList()}
        </div>
      </div>
      {isQuestionModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingIndex >= 0 ? "Edit Question" : "Add Question"}</h2>
              <button onClick={cancelQuestion} className={styles.closeButton}>
                <FiX />
              </button>
            </div>
            <div className={styles.modalBody}>{renderQuestionForm()}</div>
          </div>
        </div>
      )}
      <div className={styles.footer}>
        <button
          onClick={() => {
            onSubmit(examData, questions);
            localStorage.removeItem(storageKey);
          }}
          className={styles.submitButton}
          disabled={questions.length === 0}
        >
          <FiCheckCircle className={styles.buttonIcon} /> Create Exam
        </button>
      </div>
    </div>
  );
};

export default ExamQuestions;

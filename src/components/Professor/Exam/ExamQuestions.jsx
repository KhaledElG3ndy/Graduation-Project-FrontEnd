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
        console.log(`[Auto-Save] Loaded saved data for ${subjectName}`, parsed);
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
          },
          editingIndex: parsed.editingIndex || -1,
        };
      }
    } catch (e) {
      console.error("[Auto-Save] Failed to parse saved data", e);
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

  const questionTypes = [
    { value: "multiple-choice", label: "Multiple Choice" },
    { value: "checkbox", label: "Multiple Select (Checkbox)" },
    { value: "true-false", label: "True/False" },
    { value: "essay", label: "Essay" },
  ];

  const saveToLocalStorage = (data) => {
    try {
      const saveData = {
        questions: data.questions,
        currentQuestion: data.currentQuestion,
        editingIndex: data.editingIndex,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(storageKey, JSON.stringify(saveData));
      setLastSavedTime(new Date().toLocaleTimeString());

      console.log(`[Auto-Save] Saved state (${saveCount + 1})`, {
        questionsCount: data.questions.length,
        currentQuestion: data.currentQuestion,
        editingIndex: data.editingIndex,
      });
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
          "لديك تغييرات غير محفوظة! تأكد من حفظ بياناتك قبل المغادرة.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [questions]);

  const handleQuestionChange = (field, value) => {
    console.log(`[Change] Field updated: ${field}`, value);
    const updatedQuestion = { ...currentQuestion, [field]: value };
    setCurrentQuestion(updatedQuestion);

    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleTypeChange = (newType) => {
    console.log(`[Change] Question type changed to: ${newType}`);
    let updatedQuestion = { ...currentQuestion, type: newType };

    if (newType === "multiple-choice") {
      updatedQuestion.options = ["", ""];
      updatedQuestion.correctAnswer = 0;
      updatedQuestion.correctAnswers = [];
    } else if (newType === "checkbox") {
      updatedQuestion.options = ["", ""];
      updatedQuestion.correctAnswers = [];
      updatedQuestion.correctAnswer = null;
    } else if (newType === "true-false") {
      updatedQuestion.options = [];
      updatedQuestion.correctAnswer = null;
      updatedQuestion.correctAnswers = [];
    } else {
      updatedQuestion.options = [];
      updatedQuestion.correctAnswer = null;
      updatedQuestion.correctAnswers = [];
    }

    setCurrentQuestion(updatedQuestion);
  };

  const handleOptionChange = (index, value) => {
    console.log(`[Change] Option ${index} updated: ${value}`);
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addOption = () => {
    console.log(`[Action] Added new option`);
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, ""],
    });
  };

  const removeOption = (index) => {
    console.log(`[Action] Removed option ${index}`);
    if (currentQuestion.options.length <= 2) return;

    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    let updatedQuestion = { ...currentQuestion, options: newOptions };

    if (currentQuestion.type === "multiple-choice") {
      if (currentQuestion.correctAnswer === index) {
        updatedQuestion.correctAnswer = 0;
      } else if (currentQuestion.correctAnswer > index) {
        updatedQuestion.correctAnswer = currentQuestion.correctAnswer - 1;
      }
    }

    if (currentQuestion.type === "checkbox") {
      const newCorrectAnswers = currentQuestion.correctAnswers
        .filter((ansIndex) => ansIndex !== index)
        .map((ansIndex) => (ansIndex > index ? ansIndex - 1 : ansIndex));
      updatedQuestion.correctAnswers = newCorrectAnswers;
    }

    setCurrentQuestion(updatedQuestion);
  };

  const handleCheckboxAnswer = (index, checked) => {
    console.log(
      `[Change] Checkbox ${index} ${checked ? "checked" : "unchecked"}`
    );
    let newCorrectAnswers = [...currentQuestion.correctAnswers];

    if (checked) {
      if (!newCorrectAnswers.includes(index)) {
        newCorrectAnswers.push(index);
      }
    } else {
      newCorrectAnswers = newCorrectAnswers.filter((i) => i !== index);
    }

    setCurrentQuestion({
      ...currentQuestion,
      correctAnswers: newCorrectAnswers,
    });
  };

  const validateQuestion = () => {
    const newErrors = {};

    if (!currentQuestion.question.trim()) {
      newErrors.question = "Question text is required";
    }

    if (currentQuestion.type === "multiple-choice") {
      const filledOptions = currentQuestion.options.filter((opt) => opt.trim());
      if (filledOptions.length < 2) {
        newErrors.options = "At least 2 options are required";
      }
      if (!currentQuestion.options[currentQuestion.correctAnswer]?.trim()) {
        newErrors.correctAnswer = "Please select a valid correct answer";
      }
    }

    if (currentQuestion.type === "checkbox") {
      const filledOptions = currentQuestion.options.filter((opt) => opt.trim());
      if (filledOptions.length < 2) {
        newErrors.options = "At least 2 options are required";
      }
      if (currentQuestion.correctAnswers.length === 0) {
        newErrors.correctAnswers = "Please select at least one correct answer";
      }
      const hasInvalidCorrectAnswers = currentQuestion.correctAnswers.some(
        (index) => !currentQuestion.options[index]?.trim()
      );
      if (hasInvalidCorrectAnswers) {
        newErrors.correctAnswers =
          "Please ensure all selected correct answers have text";
      }
    }

    if (currentQuestion.type === "true-false") {
      if (
        currentQuestion.correctAnswer === null ||
        currentQuestion.correctAnswer === undefined
      ) {
        newErrors.correctAnswer = "Please select the correct answer";
      }
    }

    if (currentQuestion.marks <= 0) {
      newErrors.marks = "Marks must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addQuestion = () => {
    console.log(
      `[Action] ${editingIndex >= 0 ? "Updating" : "Adding"} question`
    );
    if (validateQuestion()) {
      const newQuestion = {
        ...currentQuestion,
        id: Date.now(),
      };

      if (editingIndex >= 0) {
        const updatedQuestions = [...questions];
        updatedQuestions[editingIndex] = newQuestion;
        setQuestions(updatedQuestions);
        setEditingIndex(-1);
      } else {
        setQuestions([...questions, newQuestion]);
      }

      resetCurrentQuestion();
    }
  };

  const resetCurrentQuestion = () => {
    console.log(`[Action] Resetting current question`);
    setCurrentQuestion({
      id: null,
      type: "multiple-choice",
      question: "",
      options: ["", ""],
      correctAnswer: 0,
      correctAnswers: [],
      marks: 1,
      explanation: "",
    });
    setErrors({});
  };

  const editQuestion = (index) => {
    console.log(`[Action] Editing question ${index}`);
    setCurrentQuestion(questions[index]);
    setEditingIndex(index);
  };

  const deleteQuestion = (index) => {
    console.log(`[Action] Deleting question ${index}`);
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const cancelEdit = () => {
    console.log(`[Action] Canceling edit`);
    resetCurrentQuestion();
    setEditingIndex(-1);
  };

  const getTotalMarks = () => {
    return questions.reduce((total, q) => total + parseInt(q.marks), 0);
  };
  const handleSubmitExam = async () => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      alert("No saved questions to submit.");
      return;
    }

    const parsed = JSON.parse(saved);
    const storedQuestions = parsed.questions || [];

    if (storedQuestions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    const totalMarks = storedQuestions.reduce(
      (sum, q) => sum + parseInt(q.marks || 0),
      0
    );

    const cleanedQuestions = storedQuestions.map((q) => {
      const choices = (q.options || []).map((opt) => ({
        choice: opt,
      }));

      let correctAns = "";
      if (q.type === "checkbox" && Array.isArray(q.correctAnswers)) {
        correctAns = q.correctAnswers.map((i) => q.options[i]).join(",");
      } else if (q.correctAnswer !== undefined && q.options?.length > 0) {
        correctAns = q.options[q.correctAnswer];
      }

      return {
        title: q.question,
        type: mapTypeToEnum(q.type), 
        grade: parseInt(q.marks),
        correctAns: correctAns,
        examId: examData.id,
        choices: choices,
      };
    });

    const examPayload = {
      ...examData,
      questions: cleanedQuestions,
      totalCalculatedMarks: totalMarks,
    };

    try {
      const response = await fetch("https://localhost:7072/api/Question/Add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedQuestions),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to add questions:", errorText);
        alert("حدث خطأ أثناء إرسال الأسئلة.");
        return;
      }

      alert("Exam created successfully!");
      localStorage.removeItem(storageKey);
      onSubmit(examPayload);
    } catch (error) {
      console.error("Submission error:", error);
      alert("فشل إرسال الامتحان. حاول مرة أخرى.");
    }
  };

  
  
  const renderQuestionForm = () => {
    return (
      <div className={styles.questionForm}>
        <div className={styles.formHeader}>
          <h3>{editingIndex >= 0 ? "Edit Question" : "Add New Question"}</h3>
          {editingIndex >= 0 && (
            <button onClick={cancelEdit} className={styles.cancelButton}>
              Cancel
            </button>
          )}
        </div>

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

        {currentQuestion.type === "multiple-choice" && (
          <div className={styles.optionsSection}>
            <div className={styles.optionsHeader}>
              <label className={styles.label}>
                Answer Options <span className={styles.required}>*</span>
              </label>
              <button
                type="button"
                onClick={addOption}
                className={styles.addOptionButton}
              >
                <FiPlus className={styles.buttonIcon} />
                Add Option
              </button>
            </div>
            {currentQuestion.options.map((option, index) => (
              <div key={index} className={styles.optionInput}>
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
                  className={styles.input}
                  placeholder={`Option ${index + 1}`}
                />
                {currentQuestion.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className={styles.removeOptionButton}
                  >
                    <FiX />
                  </button>
                )}
              </div>
            ))}
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
            <div className={styles.optionsHeader}>
              <label className={styles.label}>
                Answer Options <span className={styles.required}>*</span>
                <span className={styles.optionHint}>
                  (Select multiple correct answers)
                </span>
              </label>
              <button
                type="button"
                onClick={addOption}
                className={styles.addOptionButton}
              >
                <FiPlus className={styles.buttonIcon} />
                Add Option
              </button>
            </div>
            {currentQuestion.options.map((option, index) => (
              <div key={index} className={styles.optionInput}>
                <input
                  type="checkbox"
                  checked={currentQuestion.correctAnswers.includes(index)}
                  onChange={(e) =>
                    handleCheckboxAnswer(index, e.target.checked)
                  }
                  className={styles.checkbox}
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className={styles.input}
                  placeholder={`Option ${index + 1}`}
                />
                {currentQuestion.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className={styles.removeOptionButton}
                  >
                    <FiX />
                  </button>
                )}
              </div>
            ))}
            {errors.options && (
              <span className={styles.errorText}>{errors.options}</span>
            )}
            {errors.correctAnswers && (
              <span className={styles.errorText}>{errors.correctAnswers}</span>
            )}
          </div>
        )}

        {currentQuestion.type === "true-false" && (
          <div className={styles.trueFalseSection}>
            <label className={styles.label}>
              Correct Answer <span className={styles.required}>*</span>
            </label>
            <div className={styles.trueFalseOptions}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="trueFalse"
                  checked={currentQuestion.correctAnswer === 1}
                  onChange={() => handleQuestionChange("correctAnswer", 1)}
                  className={styles.radio}
                />
                True
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="trueFalse"
                  checked={currentQuestion.correctAnswer === 0}
                  onChange={() => handleQuestionChange("correctAnswer", 0)}
                  className={styles.radio}
                />
                False
              </label>
            </div>
            {errors.correctAnswer && (
              <span className={styles.errorText}>{errors.correctAnswer}</span>
            )}
          </div>
        )}

        {(currentQuestion.type === "short-answer" ||
          currentQuestion.type === "essay") && (
          <div className={styles.inputGroup}>
            <label className={styles.label}>Sample Answer (Optional)</label>
            <textarea
              value={currentQuestion.sampleAnswer || ""}
              onChange={(e) =>
                handleQuestionChange("sampleAnswer", e.target.value)
              }
              className={styles.textarea}
              rows={currentQuestion.type === "essay" ? "4" : "2"}
              placeholder="Provide a sample answer or key points for grading..."
            />
          </div>
        )}

        <button onClick={addQuestion} className={styles.addButton}>
          <FiSave className={styles.buttonIcon} />
          {editingIndex >= 0 ? "Update Question" : "Add Question"}
        </button>
      </div>
    );
  };

  const renderQuestionsList = () => {
    return (
      <div className={styles.questionsList}>
        <div className={styles.listHeader}>
          <h3>Questions ({questions.length})</h3>
          <div className={styles.totalMarks}>
            Total Marks: {getTotalMarks()}
          </div>
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
                      onClick={() => editQuestion(index)}
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

                  {question.type === "multiple-choice" && (
                    <div className={styles.optionsList}>
                      {question.options.map(
                        (option, optIndex) =>
                          option.trim() && (
                            <div
                              key={optIndex}
                              className={`${styles.option} ${
                                optIndex === question.correctAnswer
                                  ? styles.correctOption
                                  : ""
                              }`}
                            >
                              <span className={styles.optionLetter}>
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              {option}
                              {optIndex === question.correctAnswer && (
                                <FiCheckCircle className={styles.correctIcon} />
                              )}
                            </div>
                          )
                      )}
                    </div>
                  )}

                  {question.type === "checkbox" && (
                    <div className={styles.optionsList}>
                      {question.options.map(
                        (option, optIndex) =>
                          option.trim() && (
                            <div
                              key={optIndex}
                              className={`${styles.option} ${
                                question.correctAnswers.includes(optIndex)
                                  ? styles.correctOption
                                  : ""
                              }`}
                            >
                              <span className={styles.optionLetter}>
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              {option}
                              {question.correctAnswers.includes(optIndex) && (
                                <FiCheckCircle className={styles.correctIcon} />
                              )}
                            </div>
                          )
                      )}
                      <div className={styles.correctAnswersInfo}>
                        <strong>Correct Answers:</strong>{" "}
                        {question.correctAnswers
                          .map((index) => String.fromCharCode(65 + index))
                          .join(", ")}
                      </div>
                    </div>
                  )}

                  {question.type === "true-false" && (
                    <div className={styles.trueFalseAnswer}>
                      <span className={styles.correctAnswer}>
                        Correct Answer:{" "}
                        {question.correctAnswer === 1 ? "True" : "False"}
                      </span>
                    </div>
                  )}

                  {(question.type === "short-answer" ||
                    question.type === "essay") &&
                    question.sampleAnswer && (
                      <div className={styles.sampleAnswer}>
                        <strong>Sample Answer:</strong> {question.sampleAnswer}
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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
        <div className={styles.leftPanel}>{renderQuestionForm()}</div>
        <div className={styles.rightPanel}>{renderQuestionsList()}</div>
      </div>

      <div className={styles.footer}>
        <div className={styles.examSummary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Questions:</span>
            <span className={styles.summaryValue}>{questions.length}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Marks:</span>
            <span className={styles.summaryValue}>{getTotalMarks()}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Duration:</span>
            <span className={styles.summaryValue}>{examData.duration} min</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Last saved</span>
            <span className={styles.summaryValue}>
              {lastSavedTime ? `${lastSavedTime}` : "Saving now..."}
            </span>
          </div>
        </div>
        <button
          onClick={handleSubmitExam}
          className={styles.submitButton}
          disabled={questions.length === 0}
        >
          <FiCheckCircle className={styles.buttonIcon} />
          Create Exam
        </button>
      </div>
    </div>
  );
};

export default ExamQuestions;

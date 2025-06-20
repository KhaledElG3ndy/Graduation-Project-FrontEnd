import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import styles from "./ExamPage.module.css";

const ExamPage = () => {
  const { examId } = useParams();
  const location = useLocation();
  const passedExamInfo = location.state?.exam;

  const [examInfo, setExamInfo] = useState(passedExamInfo || null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `https://localhost:7072/api/Question/GetAll?examId=${examId}`
        );
        const data = await res.json();
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [examId]);

  useEffect(() => {
    if (examInfo?.duration) {
      setTimeRemaining(examInfo.duration * 60);
    }
  }, [examInfo]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0) {
      alert("Time's up! Exam will be submitted automatically.");
      handleSubmit();
    }
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId, choiceId, checked) => {
    setAnswers((prev) => {
      const currentAnswers = Array.isArray(prev[questionId])
        ? prev[questionId]
        : [];
      if (checked) {
        return { ...prev, [questionId]: [...currentAnswers, choiceId] };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter((id) => id !== choiceId),
        };
      }
    });
  };

  const handleSubmit = async () => {
    const formattedAnswers = questions.map((q, idx) => {
      const answer = answers[q.id];
      let formattedAnswer = "";

      if (q.type === 1) {
        let bitmask = 0;
        if (Array.isArray(answer)) {
          answer.forEach((choiceId) => {
            const index = q.choices.findIndex((c) => c.id === choiceId);
            if (index !== -1) {
              bitmask |= 1 << (q.choices.length - 1 - index);
            }
          });
        }
        formattedAnswer = bitmask.toString();
      } else if (q.type === 0) {
        const index = q.choices.findIndex((c) => c.id === answer);
        formattedAnswer = index !== -1 ? index.toString() : "";
      } else if (q.type === 2) {
        formattedAnswer = answer || "";
      }

      return {
        studentId: 1, // أو من localStorage حسب حالتك
        questionId: q.id,
        studentAns: formattedAnswer,
        grade: 0,
      };
    });

    console.log("Submitting answers:", formattedAnswers);

    try {
      const res = await fetch(
        `https://localhost:7072/Answer/PutQuestionAns/${examId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedAnswers),
        }
      );

      if (res.ok) {
        alert("Your answers were submitted successfully!");
      } else {
        const err = await res.json();
        console.error("Submission failed:", err);
        alert("Submission failed!");
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert("Error submitting exam!");
    }
  };

  const getAnsweredCount = () =>
    Object.values(answers).filter(
      (val) =>
        (Array.isArray(val) && val.length > 0) ||
        (typeof val === "string" && val.trim() !== "") ||
        typeof val === "number"
    ).length;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading exam...</p>
      </div>
    );
  }

  return (
    <div className={styles.examLayout}>
      <div className={styles.container}>
        {examInfo && (
          <div className={styles.examHeader}>
            <h1 className={styles.examTitle}>{examInfo.description}</h1>
            <div className={styles.examInfo}>
              <div className={styles.examInfoGrid}>
                <div className={styles.infoCard}>
                  <span className={styles.infoLabel}>Duration</span>
                  <span className={styles.infoValue}>
                    {examInfo.duration} mins
                  </span>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.infoLabel}>Grade</span>
                  <span className={styles.infoValue}>{examInfo.grade}</span>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.infoLabel}>Total Questions</span>
                  <span className={styles.infoValue}>{questions.length}</span>
                </div>
              </div>
              <div className={styles.timerRow}>
                <div className={styles.timerCard}>
                  <span className={styles.infoLabel}>Time Remaining </span>
                  <span
                    className={`${styles.timerValue} ${
                      timeRemaining <= 300 ? styles.timerWarning : ""
                    }`}
                  >
                    {timeRemaining !== null
                      ? formatTime(timeRemaining)
                      : "--:--"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.questionsContainer}>
          {questions.map((q, idx) => (
            <div key={q.id} className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span className={styles.questionNumber}>
                  Question {idx + 1}
                </span>
              </div>
              <p className={styles.questionText}>{q.title}</p>

              {q.image && (
                <div className={styles.imageWrapper}>
                  <img
                    src={`data:image/jpeg;base64,${q.image}`}
                    alt={`Question ${idx + 1}`}
                    className={styles.questionImage}
                  />
                </div>
              )}
              {q.file && (
                <div className={styles.filePreview}>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileIcon}>📎</span>
                    <span className={styles.fileName}>Attachment File</span>
                  </div>
                  <button
                    className={styles.downloadButton}
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `data:application/octet-stream;base64,${q.file}`;
                      link.download = `Attachment_${q.id}.xlsx`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    Download
                  </button>
                </div>
              )}

              {q.type === 2 ? (
                <textarea
                  className={styles.writtenAnswer}
                  placeholder="Write your answer here..."
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              ) : q.type === 1 ? (
                <div className={styles.choicesContainer}>
                  {q.choices.map((choice, choiceIdx) => (
                    <div key={choice.id} className={styles.choiceOption}>
                      <label className={styles.choiceLabel}>
                        <input
                          type="checkbox"
                          name={`question_${q.id}`}
                          value={choice.id}
                          checked={
                            Array.isArray(answers[q.id]) &&
                            answers[q.id].includes(choice.id)
                          }
                          onChange={(e) =>
                            handleCheckboxChange(
                              q.id,
                              choice.id,
                              e.target.checked
                            )
                          }
                          className={styles.checkboxInput}
                        />
                        <span className={styles.choiceIndicator}>
                          {String.fromCharCode(65 + choiceIdx)}
                        </span>
                        <span className={styles.choiceText}>
                          {choice.choice}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.choicesContainer}>
                  {q.choices.map((choice, choiceIdx) => (
                    <div key={choice.id} className={styles.choiceOption}>
                      <label className={styles.choiceLabel}>
                        <input
                          type="radio"
                          name={`question_${q.id}`}
                          value={choice.id}
                          checked={answers[q.id] === choice.id}
                          onChange={() => handleChange(q.id, choice.id)}
                          className={styles.radioInput}
                        />
                        <span className={styles.choiceIndicator}>
                          {String.fromCharCode(65 + choiceIdx)}
                        </span>
                        <span className={styles.choiceText}>
                          {choice.choice}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.submitSection}>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={getAnsweredCount() === 0}
          >
            Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;

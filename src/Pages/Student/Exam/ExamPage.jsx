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

  const handleSubmit = () => {
    console.log("Submitted answers:", answers);
    // Submit answers to API
  };

  const getAnsweredCount = () =>
    Object.values(answers).filter((val) => val !== "" && val !== undefined)
      .length;

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
                  <span className={styles.infoLabel}>Passing Score</span>
                  <span className={styles.infoValue}>
                    {examInfo.passingScore}
                  </span>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.infoLabel}>Total Questions</span>
                  <span className={styles.infoValue}>{questions.length}</span>
                </div>
              </div>
              <div className={styles.timerRow}>
                <div className={styles.timerCard}>
                  <span className={styles.infoLabel}>Time Remaining</span>
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

              {q.type === 2 ? (
                <textarea
                  className={styles.writtenAnswer}
                  placeholder="Write your answer here..."
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
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

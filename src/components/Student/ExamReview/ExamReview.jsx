import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./ExamReview.module.css";
import Header from "../Header/Header";
const ExamReview = () => {
  const { state } = useLocation();
  const { examId, studentId } = state || {};
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchQuestionsAndAnswers = async () => {
      try {
        const qRes = await fetch(
          `https://localhost:7072/api/Question/GetAll?examId=${examId}`
        );
        const aRes = await fetch(
          `https://localhost:7072/Exams/GetStudentExam?studentId=${studentId}&examId=${examId}`
        );

        const qData = await qRes.json();
        const aData = await aRes.json();

        setQuestions(qData);
        setAnswers(aData);
      } catch (err) {
        console.error("Error loading review data", err);
      }
    };

    fetchQuestionsAndAnswers();
  }, [examId, studentId]);

  const getAnswerObj = (questionId) =>
    answers.find((ans) => ans.questionId === questionId);

  const decodeBitAnswer = (bitString, length) => {
    const intVal = parseInt(bitString);
    if (isNaN(intVal)) return [];

    const bits = intVal.toString(2).padStart(length, "0").split("").reverse();
    return bits
      .map((bit, i) => (bit === "1" ? i : null))
      .filter((i) => i !== null);
  };

  return (
    <>
      <Header />
    <div className={styles.reviewContainer}>
      <h2>Exam Review</h2>
      {questions.map((q, index) => {
        const answerObj = getAnswerObj(q.id);
        const studentAns = answerObj?.studentAns || "";
        const selectedIndexes =
          q.type === 0 || q.type === 1
            ? decodeBitAnswer(studentAns, q.choices?.length || 0)
            : [];

        const correctIndexes =
          q.type === 0 || q.type === 1
            ? decodeBitAnswer(q.correctAns, q.choices?.length || 0)
            : [];

        return (
          <div key={q.id} className={styles.questionCard}>
            <h4>
              Q{index + 1}: {q.title}
            </h4>

            {q.image && (
              <div className={styles.imageWrapper}>
                <img
                  src={`data:image/jpeg;base64,${q.image}`}
                  alt={`Question ${index + 1}`}
                  className={styles.questionImage}
                />
              </div>
            )}

            {(q.type === 0 || q.type === 1) && q.choices?.length > 0 && (
              <>
                <ul className={styles.choiceList}>
                  {q.choices.map((choice, idx) => {
                    const isCorrect =
                      String(q.correctAns) === String(choice.id) ||
                      correctIndexes.includes(idx);
                    const isStudentAns = selectedIndexes.includes(idx);

                    return (
                      <li
                        key={choice.id}
                        className={`${isCorrect ? styles.correct : ""} ${
                          isStudentAns ? styles.studentAnswer : ""
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}. {choice.choice}
                      </li>
                    );
                  })}
                </ul>
                <p>
                  <strong>Correct Answer:</strong>{" "}
                  {q.choices
                    ?.filter((_, idx) => correctIndexes.includes(idx))
                    .map(
                      (choice, i) =>
                        `${String.fromCharCode(65 + correctIndexes[i])}. ${
                          q.choices[correctIndexes[i]]?.choice
                        }`
                    )
                    .join(", ") || "N/A"}
                </p>
              </>
            )}

            {q.type === 2 && (
              <>
                <p>
                  <strong>Your Answer:</strong> {studentAns || "Not answered"}
                </p>
                <p>
                  <strong>Correct Answer:</strong>{" "}
                  {q.correctAns || "Not provided"}
                </p>
                <p>
                  <strong>Reasoning:</strong> {answerObj?.reasoning || "N/A"}
                </p>
              </>
            )}

            <p>
              <strong>Grade:</strong> {answerObj?.grade ?? "N/A"}
            </p>
          </div>
        );
      })}
    </div>
    </>
  );
};

export default ExamReview;

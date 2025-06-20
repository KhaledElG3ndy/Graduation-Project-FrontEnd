import React, { useState } from "react";
import ExamForm from "./ExamForm";
import ExamQuestions from "./ExamQuestions";

const ExamMain = ({ subjectName, courseId, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [examData, setExamData] = useState(null);

  const handleNext = (formData) => {
    setExamData(formData);
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };
  const handleSubmit = async (finalExamData, questions) => {
    try {
      if (!questions || questions.length === 0) {
        return;
      }

      const emptyFile = new File([""], "empty.txt");
      const formData = new FormData();

      questions.forEach((q, index) => {
        formData.append(`Questions[${index}].Title`, q.question);
        formData.append(`Questions[${index}].Grade`, q.marks);
        formData.append(
          `Questions[${index}].Type`,
          q.type === "multiple-choice" ? 0 : q.type === "checkbox" ? 1 : 2
        );

        const correctAns =
          q.type === "checkbox"
            ? q.correctAnswers.map((i) => q.options[i]).join(",")
            : q.type === "multiple-choice"
            ? q.options[q.correctAnswer]
            : q.correctAnswer?.toString() || "";

        formData.append(`Questions[${index}].CorrectAns`, correctAns);

        (q.options || []).forEach((opt, i) => {
          formData.append(`Questions[${index}].Choices[${i}].choice`, opt);
        });

        formData.append(
          `Questions[${index}].File`,
          q.attachmentFile instanceof File ? q.attachmentFile : emptyFile
        );
        formData.append(
          `Questions[${index}].Image`,
          q.imageFile instanceof File ? q.imageFile : emptyFile
        );
      });

      const response = await fetch(
        `https://localhost:7072/api/Question/Add?examId=${finalExamData.id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to add questions:", error);
        alert("فشل إرسال الأسئلة.");
        return;
      }

      const result = await response.text();
      console.log("Questions submitted:", result);
      alert("تم إرسال الأسئلة بنجاح!");
      if (onSuccess) onSuccess("Questions added successfully!");
    } catch (error) {
      console.error("🚨 Error submitting questions:", error);
      alert("حدث خطأ أثناء إرسال الأسئلة.");
    }
  };
  
  
  

  return (
    <>
      {currentStep === 1 && (
        <ExamForm
          subjectName={subjectName}
          courseId={courseId}
          onNext={handleNext}
        />
      )}
      {currentStep === 2 && (
        <ExamQuestions
          subjectName={subjectName}
          examData={examData}
          onBack={handleBack}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default ExamMain;

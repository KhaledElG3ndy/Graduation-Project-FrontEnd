import React, { useState } from "react";
import ExamForm from "./ExamForm";
import ExamQuestions from "./ExamQuestions";

const ExamMain = ({ subjectName, courseId, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [examData, setExamData] = useState(null);
  console.log(courseId, subjectName);

  const handleNext = (formData) => {
    setExamData(formData);
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (finalExamData) => {
    try {
      console.log("Exam data to submit:", finalExamData);

      const response = await fetch("https://localhost:7072/api/Exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...finalExamData,
          courseId: courseId,
          staffId: 1,
        }),
      });

      if (response.ok) {
        if (onSuccess) {
          onSuccess("Exam created successfully!");
        }
        alert("Exam created successfully!");
      } else {
        throw new Error("Failed to create exam");
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      alert("Failed to create exam. Please try again.");
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

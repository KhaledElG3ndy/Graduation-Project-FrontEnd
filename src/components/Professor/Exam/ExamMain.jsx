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

      const storageKey = `exam_draft_${subjectName.replace(/\s+/g, "_")}`;
      const savedData = JSON.parse(localStorage.getItem(storageKey) || "{}");
      const questions = savedData.questions || [];

      if (questions.length === 0) {
        alert("لا يوجد أسئلة لإرسالها.");
        return;
      }

      // loop على الأسئلة وبعتها واحدة واحدة
      for (const question of questions) {
        const formData = new FormData();
        formData.append("Title", question.question);
        formData.append("Type", question.type);
        formData.append("Grade", question.marks);
        formData.append("CorrectAns", question.correctAnswer?.toString() || "");
        formData.append("ExamId", examData.id); // ده جاي من ExamForm
        formData.append("Image", ""); // لو هتضيف لاحقًا
        formData.append("File", "");

        const response = await fetch(
          "https://localhost:7072/api/Question/Add",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const result = await response.text(); // علشان تشوف الخطأ الحقيقي
          console.error("Failed to add question:", result);
          alert("فشل إرسال أحد الأسئلة. راجع الكونسول.");
          return;
        }
      }

      localStorage.removeItem(storageKey); // نظف المسودة بعد النجاح
      alert("تم إرسال الأسئلة بنجاح!");
      if (onSuccess) {
        onSuccess("Questions added successfully!");
      }
    } catch (error) {
      console.error("Error submitting questions:", error);
      alert("حصل خطأ أثناء إرسال الأسئلة. حاول تاني.");
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

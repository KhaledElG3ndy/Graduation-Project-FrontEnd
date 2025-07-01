import React, { useEffect } from "react";
import "./index.css";
import { Routes, Route } from "react-router-dom";

import SignInPage from "./Pages/Student/Login/SignInPage";
import Home from "./Pages/Student/Home/Home";
import AdminCreateAccounts from "./Pages/Admin/CreateAccounts/CreateAccounts";
import AdminHomePage from "./Pages/Admin/Home/Home";
import Professor from "./Pages/Professor/Home/Home";
import AddNews from "./Pages/Admin/AddNews/AddNews";
import EmailCRUD from "./Pages/Admin/EmailCRUD/EmailCRUD";

import AOS from "aos";
import "aos/dist/aos.css";

import { useDarkMode } from "./contexts/ThemeContext";
import EditAccount from "./Pages/Admin/EditAccount/EditAccount";
import News from "./Pages/Student/News/News";
import NewsCRUD from "./Pages/Admin/NewsCRUD/NewsCRUD";
import AddPost from "./Pages/Professor/AddPost/AddPost";
import AddSubjects from "./Pages/Admin/AddSubjects/AddSubjects";
import StudentProfile from "./Pages/Student/Profile/StudentProfile";
import AddDepartmentPage from "./Pages/Admin/AddDepartment/AddDepartment";
import Departments from "./Pages/Admin/Departments/Departments";
import Channels from "./Pages/Professor/Channels/Channels";
import Subjects from "./Pages/Professor/Subjects/Subjects";
import CreateChannel from "./Pages/Professor/CreateChannel/CreateChannel";
import UpdateNews from "./Pages/Admin/UpdateNews/UpdateNews";
import UpdateForm from "./Pages/Admin/UpdateNews/UpdateForm";
import CoursePage from "./Pages/Professor/CoursePage/CoursePage";
import LectureScheduler from "./Pages/Admin/LectureScheduler/LectureScheduler";
import ProfessorScheduler from "./Pages/Admin/ProfessorScheduler/ProfessorScheduler";
import Study from "./Pages/Student/Study/Study";
import SubjectPage from "./Pages/Student/SubjectPage/SubjectPage";
import StudentRegulation from "./Pages/Student/Regulation/StudentRegulation";
import AdminRegulation from "./Pages/Admin/Regulation/AdminRegulation";
import ExamPage from "./Pages/Student/Exam/ExamPage";
import Guidance from "./Pages/Student/Guidance/Guidance";
import AdminGuidance from "./Pages/Admin/Guidance/AdminGuidance";
import Schedules from "./Pages/Student/Schedules/Schedules";
import SubjectRegistration from "./Pages/Student/SubjectRegistration/SubjectRegistration";
import Chat from "./Pages/Student/Chat/Chat";
import CroupChat from "./Pages/Student/GroupChat";
import ExamReview from "./components/Student/ExamReview/ExamReview";
import Map from "./Pages/Student/Map/Map";
import TAHomePage from "./Pages/TA/Home/Home";
import AddPostTA from "./Pages/TA/AddPost/AddPost";
import CoursePageTA from "./Pages/TA/CoursePage/CoursePage";
import Room from "./Pages/Student/Room"
function App() {
  const { isDarkMode, toggleTheme } = useDarkMode();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  useEffect(() => {
    document.body.className = isDarkMode ? "darkMode" : "lightMode";
  }, [isDarkMode]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login/signin" element={<SignInPage />} />
        <Route path="/student/study" element={<Study />} />
        <Route path="/student/regulation" element={<StudentRegulation />} />
        <Route path="/student/News" element={<News />} />
        <Route path="/student/guidance" element={<Map />} />
        <Route path="/student/explorePlaces" element={<Guidance />} />
        <Route path="/student/Schedules" element={<Schedules />} />
        <Route
          path="/student/subjectRegistration"
          element={<SubjectRegistration />}
        />
        <Route path="student/communication" element={<Chat />} />
        <Route path="student/GroupChat" element={<CroupChat />} />
        <Route path="/room/:roomName" element={<Room />} />
        <Route path="/student/subject/:id" element={<SubjectPage />} />
        <Route path="/exam/:examId" element={<ExamPage />} />
        <Route path="/exam-review/:id" element={<ExamReview />} />

        <Route path="/Admin" element={<AdminHomePage />} />
        <Route path="/Admin/AddNews" element={<AddNews />} />
        <Route path="/Admin/CreateAccounts" element={<AdminCreateAccounts />} />
        <Route path="/Admin/EmailCRUD" element={<EmailCRUD />} />
        <Route path="/Admin/EditAccount" element={<EditAccount />} />
        <Route path="/Admin/AddSubjects" element={<AddSubjects />} />
        <Route path="/Admin/UpdateNews" element={<UpdateNews />} />
        <Route path="/Admin/regulation" element={<AdminRegulation />} />
        <Route path="/Admin/guidance" element={<AdminGuidance />} />

        <Route
          path="/Admin/UpdateNews/UpdateForm/:id"
          element={<UpdateForm />}
        />
        <Route path="/Admin/Departments" element={<Departments />} />
        <Route path="/Admin/AddDepartment" element={<AddDepartmentPage />} />
        <Route path="/Admin/LectureScheduler" element={<LectureScheduler />} />
        <Route
          path="/Admin/professorScheduler"
          element={<ProfessorScheduler />}
        />
        <Route path="/NewsCRUD" element={<NewsCRUD />} />
        <Route path="/student/Profile" element={<StudentProfile />} />

        <Route path="/Professor" element={<Professor />} />
        <Route path="/Professor/AddPost" element={<AddPost />} />
        <Route path="/Professor/Channels" element={<Channels />} />
        <Route path="/Professor/Subjects" element={<Subjects />} />
        <Route path="/Professor/CreateChannel" element={<CreateChannel />} />
        <Route path="/course/:id" element={<CoursePage />} />
        <Route path="/TA" element={<TAHomePage />} />
        <Route path="/TA/Channels" element={<Channels />} />
        <Route path="/TA/AddPost" element={<AddPostTA />} />
        <Route path="/TA/course/:id" element={<CoursePageTA />} />
      </Routes>
    </div>
  );
}

export default App;

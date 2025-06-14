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
import Posts from "./Pages/Student/Posts/Posts";
import AddSubjects from "./Pages/Admin/AddSubjects/AddSubjects";
import Profile from "./Pages/Student/Profile/Profile";
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
        <Route path="/Admin" element={<AdminHomePage />} />
        <Route path="/Admin/AddNews" element={<AddNews />} />
        <Route path="/Admin/CreateAccounts" element={<AdminCreateAccounts />} />
        <Route path="/Admin/EmailCRUD" element={<EmailCRUD />} />
        <Route path="/Admin/EditAccount" element={<EditAccount />} />
        <Route path="/Admin/AddSubjects" element={<AddSubjects />} />
        <Route path="/Admin/UpdateNews" element={<UpdateNews />} />

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
        <Route path="/News" element={<News />} />
        <Route path="/NewsCRUD" element={<NewsCRUD />} />
        <Route path="/Posts" element={<Posts />} />
        <Route path="/Profile" element={<Profile />} />

        <Route path="/Professor" element={<Professor />} />
        <Route path="/Professor/AddPost" element={<AddPost />} />
        <Route path="/Professor/Channels" element={<Channels />} />
        <Route path="/Professor/Subjects" element={<Subjects />} />
        <Route path="/Professor/CreateChannel" element={<CreateChannel />} />
        <Route path="/course/:id" element={<CoursePage />} />
      </Routes>
    </div>
  );
}

export default App;

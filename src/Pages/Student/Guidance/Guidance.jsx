import React, { useState, useEffect } from "react";
import styles from "./Guidance.module.css";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { FaArrowAltCircleDown } from "react-icons/fa";
import Header from "../../../components/student/Header/Header";
import { useNavigate } from "react-router-dom";
const Guidance = () => {
  const [isLaboratoriesOpen, setIsLaboratoriesOpen] = useState(false);
  const [isDoctorsOfficesOpen, setIsDoctorsOfficesOpen] = useState(false);
  const [isLectureHallOpen, setIsLectureHallOpen] = useState(false);
  const [isOtherOpen, setIsOtherOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (!token) {
      navigate("/login/signin");
      return;
    }

    const parseJwt = (token) => {
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch (e) {
        console.error("Invalid token", e);
        return null;
      }
    };

    const payload = parseJwt(token);
    if (!payload) {
      navigate("/login/signin");
      return;
    }

    const role =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (role !== "Student") {
      navigate("/login/signin");
    }
  }, [navigate]);

  const toggleLaboratories = () => setIsLaboratoriesOpen(!isLaboratoriesOpen);
  const toggleDoctorsOffices = () =>
    setIsDoctorsOfficesOpen(!isDoctorsOfficesOpen);
  const toggleLectureHall = () => setIsLectureHallOpen(!isLectureHallOpen);
  const toggleOther = () => setIsOtherOpen(!isOtherOpen);

  const handleClick = (room) => {
    switch (room) {
      case "أ.د. عادل أبو المجد":
        setSelectedImage("/Locations/Offices/First Floor/2.png");
        break;
      case "أ.د. مرغني حسن":
        setSelectedImage("/Locations/Offices/First Floor/3.png");
        break;
      case "د. عبدالرحمن حيدر":
        setSelectedImage("/Locations/Offices/First Floor/4.png");
        break;
      case "د. خالد فتحي":
        setSelectedImage("/Locations/Offices/First Floor/5.png");
        break;
      case "د. ماجد عسكر":
        setSelectedImage("/Locations/Offices/First Floor/6.png");
        break;
      case "د. ممدوح فاروق":
        setSelectedImage("/Locations/Offices/First Floor/6.png");
        break;
      case "د. محمد مصطفى":
        setSelectedImage("/Locations/Offices/First Floor/7.png");
        break;
      case "د. مصطفى أبو بكر":
        setSelectedImage("/Locations/Offices/First Floor/8.png");
        break;
      case "د. سارة طارق":
        setSelectedImage("/Locations/Offices/First Floor/9.png");
        break;
      case "أ.د. يوسف بسيوني مهدي":
        setSelectedImage("/Locations/Offices/First Floor/12.png");
        break;
      case "د. سها أحمد":
        setSelectedImage("/Locations/Offices/Second Floor/4.png");
        break;
      case " أ.د. حسنى محمد ابراهيم":
        setSelectedImage("/Locations/Offices/Third Floor/18.png");
        break;
      case "  د. داليا محمد":
        setSelectedImage("/Locations/Offices/Third Floor/17.png");
        break;
      case "  د. طارق محمد":
        setSelectedImage("/Locations/Offices/Third Floor/16.png");
        break;
      case "  د. نجوي محمد":
        setSelectedImage("/Locations/Offices/Third Floor/15.png");
        break;
      case "د. إسلام تاج الدين":
        setSelectedImage("/Locations/Offices/Third Floor/14.png");
        break;
      case "د. فاطمة عبد العليم":
        setSelectedImage("/Locations/Offices/Third Floor/13.png");
        break;
      case "د. ابرام كمال":
        setSelectedImage("/Locations/Offices/Third Floor/12.png");
        break;
      case "د. علي حسين":
        setSelectedImage("/Locations/Offices/Third Floor/12.png");
        break;
      case "د. مصطفي قرشي":
        setSelectedImage("/Locations/Offices/Third Floor/11.png");
        break;
      case "معمل 0 - أ":
        setSelectedImage("/Locations/Labs/Ground Floor/3.png");
        break;
      case "معمل 0 - ب":
        setSelectedImage("/Locations/Labs/Ground Floor/5.png");
        break;
      case "معمل 0 - ج":
        setSelectedImage("/Locations/Labs/Ground Floor/7.png");
        break;
      case "معمل 0 - د":
        setSelectedImage("/Locations/Labs/Ground Floor/9.png");
        break;
      case "معمل 0 - ه":
        setSelectedImage("/Locations/Labs/Ground Floor/11.png");
        break;
      case "معمل 1 - أ":
        setSelectedImage("/Locations/Labs/First Floor/18.png");
        break;
      case "معمل 1 - ب":
        setSelectedImage("/Locations/Labs/First Floor/20.png");
        break;
      case "معمل 1 - ج":
        setSelectedImage("/Locations/Labs/First Floor/22.png");
        break;
      case "معمل 1 - د":
        setSelectedImage("/Locations/Labs/First Floor/24.png");
        break;
      case "معمل 1 - ه":
        setSelectedImage("/Locations/Labs/First Floor/26.png");
        break;
      case "معمل 2 - أ":
        setSelectedImage("/Locations/Labs/Second Floor/14.png");
        break;
      case "معمل 2 - ب":
        setSelectedImage("/Locations/Labs/Second Floor/15.png");
        break;
      case "معمل 2 - ج":
        setSelectedImage("/Locations/Labs/Second Floor/16.png");
        break;
      case "معمل 2 - د":
        setSelectedImage("/Locations/Labs/Second Floor/18.png");
        break;
      case "معمل 2 - ه":
        setSelectedImage("/Locations/Labs/Second Floor/20.png");
        break;
      case "معمل 3 - أ":
        setSelectedImage("/Locations/Labs/Third Floor/7.png");
        break;
      case "معمل 3 - ب":
        setSelectedImage("/Locations/Labs/Third Floor/6.png");
        break;
      case "معمل 3 - ج":
        setSelectedImage("/Locations/Labs/Third Floor/5.png");
        break;
      case "معمل 3 - د":
        setSelectedImage("/Locations/Labs/Third Floor/3.png");
        break;
      case "معمل 3 - ه":
        setSelectedImage("/Locations/Labs/Third Floor/1.png");
        break;
      case "معمل 4 - أ":
        setSelectedImage("/Locations/Labs/Fourth Floor/9.png");
        break;
      case "معمل 4  - ب":
        setSelectedImage("/Locations/Labs/Fourth Floor/11.png");
        break;
      case "معمل 4  - ج":
        setSelectedImage("/Locations/Labs/Fourth Floor/13.png");
        break;
      case "معمل 4 - د":
        setSelectedImage("/Locations/Labs/Fourth Floor/15.png");
        break;
      case "معمل 4 - ه":
        setSelectedImage("/Locations/Labs/Fourth Floor/17.png");
        break;
      case "مدرج 1":
        setSelectedImage("/Locations/Halls/1.png");
        break;
      case "مدرج 2":
        setSelectedImage("/Locations/Halls/2.png");
        break;
      case "مدرج 3":
        setSelectedImage("/Locations/Halls/3.png");
        break;
      case "مدرج 4":
        setSelectedImage("/Locations/Halls/4.png");
        break;
      case "مدرج 5":
        setSelectedImage("/Locations/Halls/5.png");
        break;
      case "مدرج 6":
        setSelectedImage("/Locations/Halls/6.png");
        break;
      case "مدرج 7":
        setSelectedImage("/Locations/Halls/7.png");
        break;
      case "مدرج 8":
        setSelectedImage("/Locations/Halls/8.png");
        break;
      case "مدرج 9":
        setSelectedImage("/Locations/Halls/9.png");
        break;
      case "مدرج 1-أ":
        setSelectedImage("/Locations/Halls/مدرج 1-أ.png");
        break;
      case "مدرج 2-أ":
        setSelectedImage("/Locations/Halls/مدرج 2-أ.png");
        break;
      case "مدرج 3-أ":
        setSelectedImage("/Locations/Halls/مدرج 3-أ.png");
        break;
      case "مدرج 4-أ":
        setSelectedImage("/Locations/Halls/مدرج 4-أ.png");
        break;
      case "رعاية الشباب":
        setSelectedImage("/Locations/Others/رعاية الشباب.png");
        break;
      case "شؤون الطلاب":
        setSelectedImage("/Locations/Others/شؤون الطلاب.png");
        break;
      case "Free lab":
        setSelectedImage("/Locations/Others/Free lab.png");
        break;
      case "صالة الانشطة":
        setSelectedImage("/Locations/Others/صالة الانشطة.png");
        break;
      case "مصلى طلبة":
        setSelectedImage("/Locations/Others/مصلى طلبة.png");
        break;
      case "مصلى الطالبات":
        setSelectedImage("/Locations/Others/مصلى الطالبات.png");
        break;
      case "المكتبة":
        setSelectedImage("/Locations/Others/المكتبة.png");
        break;
      case "ICPC Room":
        setSelectedImage("/Locations/Others/ICPC Room.png");
        break;
      default:
        setSelectedImage("");
    }
  };

  return (
    <>
      <Header />

      <div className={styles.container} dir="rtl">
        <div className={styles.sidebar}>
          <h1 className={styles.header}>أماكن كلية الحاسبات والمعلومات</h1>
          <div className={styles.section} onClick={toggleLaboratories}>
            <h2>
              المعامل{" "}
              <span className={styles.arrow}>
                {isLaboratoriesOpen ? (
                  <FaArrowAltCircleDown className={styles.downIcon} />
                ) : (
                  <FaArrowAltCircleLeft className={styles.rightIcon} />
                )}
              </span>
            </h2>
            {isLaboratoriesOpen && (
              <ul>
                <li onClick={() => handleClick("معمل 0 - أ")}>معمل 0 - أ</li>
                <li onClick={() => handleClick("معمل 0 - ب")}>معمل 0 - ب</li>
                <li onClick={() => handleClick("معمل 0 - ج")}>معمل 0 - ج</li>
                <li onClick={() => handleClick("معمل 0 - د")}>معمل 0 - د</li>
                <li onClick={() => handleClick("معمل 0 - ه")}>معمل 0 - ه</li>
                <li onClick={() => handleClick("معمل 1 - أ")}>معمل 1 - أ</li>
                <li onClick={() => handleClick("معمل 1 - ب")}>معمل 1 - ب</li>
                <li onClick={() => handleClick("معمل 1 - ج")}>معمل 1 - ج</li>
                <li onClick={() => handleClick("معمل 1 - د")}>معمل 1 - د</li>
                <li onClick={() => handleClick("معمل 1 - ه")}>معمل 1 - ه</li>
                <li onClick={() => handleClick("معمل 2 - أ")}>معمل 2 - أ</li>
                <li onClick={() => handleClick("معمل 2 - ب")}>معمل 2 - ب</li>
                <li onClick={() => handleClick("معمل 2 - ج")}>معمل 2 - ج</li>
                <li onClick={() => handleClick("معمل 2 - د")}>معمل 2 - د</li>
                <li onClick={() => handleClick("معمل 2 - ه")}>معمل 2 - ه</li>
                <li onClick={() => handleClick("معمل 3 - أ")}>معمل 3 - أ</li>
                <li onClick={() => handleClick("معمل 3 - ب")}>معمل 3 - ب</li>
                <li onClick={() => handleClick("معمل 3 - ج")}>معمل 3 - ج</li>
                <li onClick={() => handleClick("معمل 3 - د")}>معمل 3 - د</li>
                <li onClick={() => handleClick("معمل 3 - ه")}>معمل 3 - ه</li>
                <li onClick={() => handleClick("معمل 4 - أ")}>معمل 4 - أ</li>
                <li onClick={() => handleClick("معمل 4 - ب")}>معمل 4 - ب</li>
                <li onClick={() => handleClick("معمل 4 - ج")}>معمل 4 - ج</li>
                <li onClick={() => handleClick("معمل 4 - د")}>معمل 4 - د</li>
                <li onClick={() => handleClick("معمل 4 - ه")}>معمل 4 - ه</li>
              </ul>
            )}
          </div>
          <div className={styles.section} onClick={toggleDoctorsOffices}>
            <h2>
              مكاتب الدكاترة{" "}
              <span className={styles.arrow}>
                {isDoctorsOfficesOpen ? (
                  <FaArrowAltCircleDown className={styles.downIcon} />
                ) : (
                  <FaArrowAltCircleLeft className={styles.rightIcon} />
                )}
              </span>
            </h2>
            {isDoctorsOfficesOpen && (
              <ul>
                <li onClick={() => handleClick("أ.د. عادل أبو المجد")}>
                  أ.د. عادل أبو المجد
                </li>
                <li onClick={() => handleClick("أ.د. مرغني حسن")}>
                  أ.د. مرغني حسن
                </li>
                <li onClick={() => handleClick("د. عبدالرحمن حيدر")}>
                  د. عبدالرحمن حيدر
                </li>
                <li onClick={() => handleClick("د. خالد فتحي")}>
                  د. خالد فتحي
                </li>
                <li onClick={() => handleClick("د. ماجد عسكر")}>
                  د. ماجد عسكر
                </li>
                <li onClick={() => handleClick("د. ممدوح فاروق")}>
                  د. ممدوح فاروق
                </li>
                <li onClick={() => handleClick("د. محمد مصطفى")}>
                  د. محمد مصطفى
                </li>
                <li onClick={() => handleClick("د. مصطفى أبو بكر")}>
                  د. مصطفى أبو بكر
                </li>
                <li onClick={() => handleClick("د. سارة طارق")}>
                  د. سارة طارق
                </li>
                <li onClick={() => handleClick("أ.د. يوسف بسيوني مهدي")}>
                  أ.د. يوسف بسيوني مهدي
                </li>
                <li onClick={() => handleClick("د. سها أحمد")}>د. سها أحمد</li>
                <li onClick={() => handleClick(" أ.د. حسنى محمد ابراهيم")}>
                  أ.د. حسنى محمد ابراهيم{" "}
                </li>
                <li onClick={() => handleClick("  د. داليا محمد")}>
                  د. داليا محمد{" "}
                </li>
                <li onClick={() => handleClick("  د. طارق محمد")}>
                  د. طارق محمد{" "}
                </li>
                <li onClick={() => handleClick("  د. نجوي محمد")}>
                  د. نجوي محمد{" "}
                </li>
                <li onClick={() => handleClick("د. إسلام تاج الدين")}>
                  د. إسلام تاج الدين{" "}
                </li>
                <li onClick={() => handleClick("د. فاطمة عبد العليم")}>
                  د. فاطمة عبد العليم{" "}
                </li>
                <li onClick={() => handleClick("د. ابرام كمال")}>
                  د. ابرام كمال{" "}
                </li>
                <li onClick={() => handleClick("د. علي حسين")}>د. علي حسين </li>
                <li onClick={() => handleClick("د. مصطفي قرشي")}>
                  د. مصطفي قرشي{" "}
                </li>
              </ul>
            )}
          </div>
          <div className={styles.section} onClick={toggleLectureHall}>
            <h2>
              قاعة المحاضرات{" "}
              <span className={styles.arrow}>
                {isLectureHallOpen ? (
                  <FaArrowAltCircleDown className={styles.downIcon} />
                ) : (
                  <FaArrowAltCircleLeft className={styles.rightIcon} />
                )}
              </span>
            </h2>
            {isLectureHallOpen && (
              <ul>
                <li onClick={() => handleClick("مدرج 1")}>مدرج 1</li>
                <li onClick={() => handleClick("مدرج 2")}>مدرج 2</li>
                <li onClick={() => handleClick("مدرج 3")}>مدرج 3</li>
                <li onClick={() => handleClick("مدرج 4")}>مدرج 4</li>
                <li onClick={() => handleClick("مدرج 5")}>مدرج 5</li>
                <li onClick={() => handleClick("مدرج 6")}>مدرج 6</li>
                <li onClick={() => handleClick("مدرج 7")}>مدرج 7</li>
                <li onClick={() => handleClick("مدرج 8")}>مدرج 8</li>
                <li onClick={() => handleClick("مدرج 9")}>مدرج 9</li>
                <li onClick={() => handleClick("مدرج 1-أ")}>مدرج 1-أ </li>
                <li onClick={() => handleClick("مدرج 2-أ")}>مدرج 2-أ </li>
                <li onClick={() => handleClick("مدرج 3-أ")}>مدرج 3-أ </li>
                <li onClick={() => handleClick("مدرج 2-أ")}>مدرج 4-أ </li>
              </ul>
            )}
          </div>
          <div className={styles.section} onClick={toggleOther}>
            <h2>
              أخرى{" "}
              <span className={styles.arrow}>
                {isOtherOpen ? (
                  <FaArrowAltCircleDown className={styles.downIcon} />
                ) : (
                  <FaArrowAltCircleLeft className={styles.rightIcon} />
                )}
              </span>
            </h2>
            {isOtherOpen && (
              <ul>
                <li onClick={() => handleClick("رعاية الشباب")}>
                  رعاية الشباب
                </li>
                <li onClick={() => handleClick("شؤون الطلاب")}>شؤون الطلاب</li>
                <li onClick={() => handleClick("صالة الانشطة")}>
                  صالة الانشطة
                </li>
                <li onClick={() => handleClick("مصلى طلبة")}>مصلى طلبة</li>
                <li onClick={() => handleClick("مصلى الطالبات")}>
                  مصلى الطالبات{" "}
                </li>
                <li onClick={() => handleClick("المكتبة")}>المكتبة </li>
                <li onClick={() => handleClick("Free lab")}>Free lab</li>
                <li onClick={() => handleClick("ICPC Room")}>ICPC Room</li>
              </ul>
            )}
          </div>
        </div>
        <div className={styles.content}>
          {selectedImage && (
            <div className={styles.imageContainer}>
              <img
                src={selectedImage}
                alt="المكان المحدد"
                className={styles.image}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Guidance;

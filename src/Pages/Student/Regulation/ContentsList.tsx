import React from "react";
import styles from "./ContentsList.module.css";

interface ContentsListProps {
  onItemClick: (item: string) => void;
}

const ContentsList: React.FC<ContentsListProps> = ({ onItemClick }) => {
  const items = [
    "الرؤيه والرساله",
    "أهداف الكلية",
    "أقسام الكلية",
    "الدرجات العلمية",
    "شروط القبول بالكلية",
    "نظام الدراسة",
    "لغة التدريس",
    "مواعيد الدراسة والتخرج",
    "التسجيل والحذف والإضافة",
    "الانسحاب من المقرر",
    "الإرشاد الأكاديمي",
    "المواظبة والغياب",
    "الانقطاع عن الدراسة",
    "نظام الامتحانات",
    "نظام التقييم",
    "الرسوب والاعاده",
    "السجل الاكاديمي",
    "وضع الطالب تحت الملاحظه الاكاديميه وفصله من الكليه",
    "الانذار",
    "احكام تنظيميه",
    "تطبيق قانون تنظيم الجامعات ولائحته التنفذيه",
    "تطبيق اللائحه",
    "المقررات الدراسيه",
    "ساعات التمارين النظريه والعمليه",
    "قواعد النظام الكودي للمقررات الدراسيه",
    "المتطلبات العامه",
    "متطلبات الكليه",
    "متطلبات التخصص",
    "متطلبات التدريب والتعلم الذاتي",
    "مستويات ومتطلبات المقررات",
    "ملحق المواد العلمية",
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>المحتويات</div>
      <ul className={styles.list}>
        {items.map((item) => (
          <li
            key={item}
            className={styles.item}
            onClick={() => onItemClick(item)}
          >
            <button className={styles.button}>{item}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContentsList;

"use strict";

/*
  Student class:
  Private fields keep the data protected from direct modification.
  Setters validate every value before storing it.
*/
class Student {
  #name;
  #grade1;
  #grade2;
  #grade3;
  #attendance;

  constructor(name, grade1, grade2, grade3, attendance) {
    this.name = name;
    this.grade1 = grade1;
    this.grade2 = grade2;
    this.grade3 = grade3;
    this.attendance = attendance;
  }

  set name(value) {
    const cleanName = String(value ?? "").trim();
    if (!cleanName) throw new Error("من فضلك اكتب اسم الطالب.");
    this.#name = cleanName;
  }

  set grade1(value) { this.#grade1 = this.#validateNumber(value, "درجة المادة الأولى"); }
  set grade2(value) { this.#grade2 = this.#validateNumber(value, "درجة المادة الثانية"); }
  set grade3(value) { this.#grade3 = this.#validateNumber(value, "درجة المادة الثالثة"); }
  set attendance(value) { this.#attendance = this.#validateNumber(value, "نسبة الحضور"); }

  get name() { return this.#name; }
  get grade1() { return this.#grade1; }
  get grade2() { return this.#grade2; }
  get grade3() { return this.#grade3; }
  get attendance() { return this.#attendance; }

  get average() {
    return (this.#grade1 + this.#grade2 + this.#grade3) / 3;
  }

  #validateNumber(value, fieldName) {
    if (value === "" || value === null || value === undefined) {
      throw new Error(`حقل ${fieldName} مطلوب ولا يمكن تركه فارغاً.`);
    }

    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      throw new Error(`من فضلك أدخل رقماً صحيحاً في ${fieldName}.`);
    }
    if (numberValue < 0 || numberValue > 100) {
      throw new Error(`${fieldName} يجب أن تكون بين 0 و100.`);
    }
    return numberValue;
  }
}

// مصفوفة حفظ بيانات الطلاب.
const studentsList = [];

// الإمساك بعناصر الشاشة باستخدام getElementById.
const studentForm = document.getElementById("studentForm");
const studentNameInput = document.getElementById("studentName");
const grade1Input = document.getElementById("grade1");
const grade2Input = document.getElementById("grade2");
const grade3Input = document.getElementById("grade3");
const attendanceInput = document.getElementById("attendance");
const errorBox = document.getElementById("errorBox");
const successBox = document.getElementById("successBox");
const studentsTableBody = document.getElementById("studentsTableBody");
const studentsTableWrap = document.getElementById("studentsTableWrap");
const studentsEmpty = document.getElementById("studentsEmpty");
const listCount = document.getElementById("listCount");
const totalStudents = document.getElementById("totalStudents");
const overallAverage = document.getElementById("overallAverage");
const graceCount = document.getElementById("graceCount");
const reportBox = document.getElementById("reportBox");
const graceBtn = document.getElementById("graceBtn");

const formatNumber = (number) => Number(number).toFixed(2);

// حماية النصوص التي ستظهر داخل HTML من إدخال وسوم غير مرغوبة.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function showMessage(element, message) {
  element.textContent = message;
  element.classList.remove("d-none");
}

function hideMessages() {
  errorBox.textContent = "";
  successBox.textContent = "";
  errorBox.classList.add("d-none");
  successBox.classList.add("d-none");
}

function clearForm() {
  studentForm.reset();
  studentNameInput.focus();
}

// تحديث الجدول والإحصائيات بعد أي تغيير في القائمة.
function renderStudents() {
  studentsTableBody.innerHTML = "";

  studentsList.forEach((student, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="fw-bold">${escapeHTML(student.name)}</td>
      <td><span class="grade-badge">${formatNumber(student.average)}</span></td>
      <td><span class="attendance-text">${formatNumber(student.attendance)}%</span></td>
      <td><button class="delete-btn" type="button" data-index="${index}" aria-label="حذف الطالب">حذف</button></td>
    `;
    studentsTableBody.appendChild(row);
  });

  const hasStudents = studentsList.length > 0;
  studentsEmpty.classList.toggle("d-none", hasStudents);
  studentsTableWrap.classList.toggle("d-none", !hasStudents);
  totalStudents.textContent = studentsList.length;
  listCount.textContent = `${studentsList.length} ${studentsList.length === 1 ? "طالب" : "طلاب"}`;

  if (hasStudents) {
    const sum = studentsList.reduce((total, student) => total + student.average, 0);
    overallAverage.textContent = formatNumber(sum / studentsList.length);
  } else {
    overallAverage.textContent = "—";
  }
}

// إضافة طالب مع استخدام try/catch لعرض أخطاء التحقق للمستخدم.
studentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  hideMessages();

  try {
    const student = new Student(
      studentNameInput.value,
      grade1Input.value,
      grade2Input.value,
      grade3Input.value,
      attendanceInput.value
    );

    studentsList.push(student);
    renderStudents();
    graceCount.textContent = "0";
    reportBox.innerHTML = '<div class="report-placeholder">تم تحديث قائمة الطلاب. فعّل لجنة الرأفة لإعداد تقرير جديد.</div>';
    showMessage(successBox, `تمت إضافة الطالب "${student.name}" بنجاح.`);
    clearForm();
  } catch (error) {
    showMessage(errorBox, error.message);
  }
});

// حذف طالب من القائمة (ميزة إضافية لتسهيل إدارة السجل).
studentsTableBody.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".delete-btn");
  if (!deleteButton) return;

  const studentIndex = Number(deleteButton.dataset.index);
  studentsList.splice(studentIndex, 1);
  hideMessages();
  renderStudents();
  graceCount.textContent = "0";
  reportBox.innerHTML = '<div class="report-placeholder">تم تعديل قائمة الطلاب. فعّل لجنة الرأفة لتحديث التقرير.</div>';
});

// لجنة الرأفة: Filter ثم Map ثم Reduce.
graceBtn.addEventListener("click", () => {
  hideMessages();

  const strugglingStudents = studentsList.filter((student) => {
    return student.average >= 40 && student.average <= 49;
  });

  const adjustedStudents = strugglingStudents.map((student) => ({
    name: student.name,
    oldAverage: student.average,
    newAverage: student.average + 5
  }));

  // Reduce يجمع المتوسطات بعد إضافة درجات الرأفة.
  const totalAfterGrace = adjustedStudents.reduce(
    (total, student) => total + student.newAverage, 0
  );

  // منع القسمة على صفر إذا لم يوجد طلاب متعثرون.
  const finalAverage = adjustedStudents.length > 0
    ? totalAfterGrace / adjustedStudents.length
    : 0;

  graceCount.textContent = adjustedStudents.length;

  if (adjustedStudents.length === 0) {
    reportBox.innerHTML = `
      <div class="report-title">التقرير النهائي للجنة الرأفة</div>
      <div class="report-summary">
        <span class="report-chip">عدد الطلاب المتعثرين: 0</span>
      </div>
      <div class="no-candidates">لا يوجد طلاب متوسط درجاتهم بين 40 و49 حالياً.</div>
    `;
    return;
  }

  const studentsHTML = adjustedStudents.map((student) => `
    <li>
      <span>${escapeHTML(student.name)} <small class="text-secondary">(قبل الرأفة: ${formatNumber(student.oldAverage)})</small></span>
      <span class="report-average">${formatNumber(student.newAverage)} / 100</span>
    </li>
  `).join("");

  reportBox.innerHTML = `
    <div class="report-title">التقرير النهائي للجنة الرأفة</div>
    <div class="report-summary">
      <span class="report-chip">عدد الطلاب المتعثرين: ${adjustedStudents.length}</span>
      <span class="report-chip">درجات الرأفة: +5 لكل طالب</span>
    </div>
    <ul class="report-list">${studentsHTML}</ul>
    <div class="d-flex justify-content-between align-items-center pt-2 border-top">
      <span class="fw-bold small">المتوسط العام بعد الرأفة</span>
      <span class="report-average">${formatNumber(finalAverage)} / 100</span>
    </div>
  `;
});

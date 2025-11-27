import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as 'vi' | 'en')) {
    locale = routing.defaultLocale;
  }

  // Load Common translations
  const commonMessages = (await import(`../language/Common/${locale}.json`)).default;

  // Load Student translations
  const studentModules = [
    'Course',
    'Dashboard',
    'Departments',
    'Documents',
    'ExamSchedule',
    'Grades',
    'Notification',
    'Profile',
    'Regulations',
    'Schedule',
    'Tuition',
  ];

  const studentMessages: Record<string, unknown> = {};

  // Load and merge each student module
  for (const module of studentModules) {
    try {
      const moduleMessages = (await import(`../language/Student/${module}/${locale}.json`)).default;
      // Merge student namespace from module
      if (moduleMessages.student) {
        Object.assign(studentMessages, moduleMessages.student);
      }
    } catch (error) {
      // Silently skip if module file doesn't exist
      console.warn(`Failed to load language module: Student/${module}/${locale}.json`, error);
    }
  }

  // Load Instructor translations
  const instructorDashboard = (await import(`../language/Instructor/Dashboard/${locale}.json`)).default;
  const instructorExams = (await import(`../language/Instructor/Exams/${locale}.json`)).default;
  const instructorGrades = (await import(`../language/Instructor/Grades/${locale}.json`)).default;
  const instructorMaterials = (await import(`../language/Instructor/Materials/${locale}.json`)).default;
  const instructorNotification = (await import(`../language/Instructor/Notification/${locale}.json`)).default;
  const instructorProfile = (await import(`../language/Instructor/Profile/${locale}.json`)).default;
  const instructorRegulations = (await import(`../language/Instructor/Regulations/${locale}.json`)).default;
  const instructorSchedule = (await import(`../language/Instructor/Schedule/${locale}.json`)).default;

  // Load Admin translations
  const adminBuildingManagement = (await import(`../language/Admin/BuildingManagement/${locale}.json`)).default;
  const adminClassManagement = (await import(`../language/Admin/ClassManagement/${locale}.json`)).default;
  const adminCourseManagement = (await import(`../language/Admin/CourseManagement/${locale}.json`)).default;
  const adminCurriculumManagement = (await import(`../language/Admin/CurriculumManagement/${locale}.json`)).default;
  const adminDashboard = (await import(`../language/Admin/Dashboard/${locale}.json`)).default;
  const adminDepartmentManagement = (await import(`../language/Admin/DepartmentManagement/${locale}.json`)).default;
  const adminDivisionManagement = (await import(`../language/Admin/DivisionManagement/${locale}.json`)).default;
  const adminExamApproval = (await import(`../language/Admin/ExamApproval/${locale}.json`)).default;
  const adminExamScheduleManagement = (await import(`../language/Admin/ExamScheduleManagement/${locale}.json`)).default;
  const adminFacultyManagement = (await import(`../language/Admin/FacultyManagement/${locale}.json`)).default;
  const adminGradeApproval = (await import(`../language/Admin/GradeApproval/${locale}.json`)).default;
  const adminInstructorProfile = (await import(`../language/Admin/InstructorProfile/${locale}.json`)).default;
  const adminModals = (await import(`../language/Admin/Modals/${locale}.json`)).default;
  const adminNotification = (await import(`../language/Admin/Notification/${locale}.json`)).default;
  const adminNotificationManagement = (await import(`../language/Admin/NotificationManagement/${locale}.json`)).default;
  const adminRegulations = (await import(`../language/Admin/Regulations/${locale}.json`)).default;
  const adminRoomRequests = (await import(`../language/Admin/RoomRequests/${locale}.json`)).default;
  const adminScheduleChangeManagement = (await import(`../language/Admin/ScheduleChangeManagement/${locale}.json`)).default;
  const adminStudentProfile = (await import(`../language/Admin/StudentProfile/${locale}.json`)).default;
  const adminSubjectManagement = (await import(`../language/Admin/SubjectManagement/${locale}.json`)).default;
  const adminThemeConfiguration = (await import(`../language/Admin/ThemeConfiguration/${locale}.json`)).default;
  const adminTuition = (await import(`../language/Admin/Tuition/${locale}.json`)).default;

  // Merge all translations
  // Each student file has structure: { student: { module: {...} } }
  // Each instructor file has structure: { instructor: { module: {...} } }
  // Each admin file has structure: { admin: { module: {...} } }
  // We need to merge all modules together
  const messages = {
    ...commonMessages,
    student: studentMessages,
    instructor: {
      ...(instructorDashboard.instructor || {}),
      ...(instructorExams.instructor || {}),
      ...(instructorGrades.instructor || {}),
      ...(instructorMaterials.instructor || {}),
      ...(instructorNotification.instructor || {}),
      ...(instructorProfile.instructor || {}),
      ...(instructorRegulations.instructor || {}),
      ...(instructorSchedule.instructor || {}),
    },
    admin: {
      ...(adminBuildingManagement.admin || {}),
      ...(adminClassManagement.admin || {}),
      ...(adminCourseManagement.admin || {}),
      ...(adminCurriculumManagement.admin || {}),
      ...(adminDashboard.admin || {}),
      ...(adminDepartmentManagement.admin || {}),
      ...(adminDivisionManagement.admin || {}),
      ...(adminExamApproval.admin || {}),
      ...(adminExamScheduleManagement.admin || {}),
      ...(adminFacultyManagement.admin || {}),
      ...(adminGradeApproval.admin || {}),
      ...(adminInstructorProfile.admin || {}),
      ...(adminModals.admin || {}),
      ...(adminNotification.admin || {}),
      ...(adminNotificationManagement.admin || {}),
      ...(adminRegulations.admin || {}),
      ...(adminRoomRequests.admin || {}),
      ...(adminScheduleChangeManagement.admin || {}),
      ...(adminStudentProfile.admin || {}),
      ...(adminSubjectManagement.admin || {}),
      ...(adminThemeConfiguration.admin || {}),
      ...(adminTuition.admin || {}),
    },
  };

  return {
    locale,
    messages,
  };
});

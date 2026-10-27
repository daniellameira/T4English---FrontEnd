import type { ProfessorDashboardData, StudentDashboardData } from '../types/dashboard';

export const professorDashboardMock: ProfessorDashboardData = {
  totalStudents: 6,
  studentsAtRiskCount: 1,
  pendingGradingCount: 8,
  completedLessonsPercentage: 68,
  completedAssignmentsPercentage: 74,
  students: [
    { id: 'demo-1', name: 'Ana Souza', email: 'ana@example.com', attendancePercentage: 92, isAtRisk: false },
    { id: 'demo-2', name: 'Bruno Lima', email: 'bruno@example.com', attendancePercentage: 84, isAtRisk: false },
    { id: 'demo-3', name: 'Camila Rocha', email: 'camila@example.com', attendancePercentage: 71, isAtRisk: true },
    { id: 'demo-4', name: 'Diego Alves', email: 'diego@example.com', attendancePercentage: 88, isAtRisk: false },
    { id: 'demo-5', name: 'Elisa Costa', email: 'elisa@example.com', attendancePercentage: 96, isAtRisk: false },
    { id: 'demo-6', name: 'Felipe Santos', email: 'felipe@example.com', attendancePercentage: 90, isAtRisk: false },
  ],
};

export const studentDashboardMock: StudentDashboardData = {
  subLevelId: null,
  subLevelName: 'Basic Level',
  attendancePercentage: 88,
  completedLessonsCount: 5,
  totalLessonsCount: 8,
  completedAssignmentsCount: 3,
  totalAssignmentsCount: 5,
  lessons: [],
};

export interface StudentSummary {
  id: string;
  name: string;
  email: string;
  attendancePercentage: number;
  isAtRisk?: boolean;
  averageGrade?: number | null;
}

export interface ProfessorDashboardApiStudent {
  studentId: string;
  name: string;
  email: string;
  attendancePercentage: number;
  isAtRisk: boolean;
  averageGrade: number | null;
}

export interface ProfessorDashboardApiResponse {
  totalActiveStudents: number;
  studentsAtRiskCount: number;
  pendingGradingCount: number;
  studentsSummary: ProfessorDashboardApiStudent[];
}

export interface ProfessorDashboardData {
  totalStudents: number;
  studentsAtRiskCount: number;
  pendingGradingCount: number;
  completedLessonsPercentage?: number;
  completedAssignmentsPercentage?: number;
  students: StudentSummary[];
}

export interface LessonProgress {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  canvaEmbedUrl?: string;
}

export interface StudentDashboardData {
  subLevelId: string | null;
  subLevelName: string;
  attendancePercentage: number;
  completedLessonsCount?: number;
  totalLessonsCount?: number;
  completedAssignmentsCount?: number;
  totalAssignmentsCount?: number;
  lessons: LessonProgress[];
}
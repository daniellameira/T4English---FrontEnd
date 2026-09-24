export interface StudentSummary {
  id: string;
  name: string;
  email: string;
  attendancePercentage: number;
  pendingAssignmentsCount: number;
}

export interface ProfessorDashboardData {
  totalStudents: number;
  studentsAtRiskCount: number;
  pendingAssignmentsTotal: number;
  students: StudentSummary[];
}
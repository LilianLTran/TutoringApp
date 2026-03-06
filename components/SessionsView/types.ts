export type SessionStatus = 
  "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export type SessionRow = {
  id: string;
  date: string; // yyyy-mm-dd
  startMin: number;
  endMin: number;
  status: SessionStatus;
  location: string;
  courseName: string;
  tutorName?: string;
  tutorEmail?: string;
  studentName?: string;
  studentEmail?: string;
};
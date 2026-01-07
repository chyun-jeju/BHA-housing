

export enum UserRole {
  STAFF = 'STAFF',
  WORKER = 'WORKER',
  ADMIN = 'ADMIN'
}

export enum RequestCategory {
  ELECTRIC = 'Electric',
  MACHINERY = 'Machinery (AC)', // Renamed from Facility
  REPAIR = 'Repair/Maintenance', // Renamed from Architecture
  SECURITY = 'Security (Gate)', // Renamed from Communication
  MOVING = 'Easy Stuff Moving', // Renamed from Event Support
  CLEANING = 'Cleaning', // New
  FIRE_SYSTEM = 'Fire System', // New
  OTHER = 'Other'
}

export enum RequestLocation {
  H3_OUTDOOR = 'H-3 Outdoor',
  H4_OUTDOOR = 'H-4 Outdoor',
  PAC = 'PAC',
  SCHOOL_CENTER = 'School Center',
  STMEV = 'STMEV',
  MS_POD = 'MS Pod',
  SS_POD = 'SS Pod',
  UJS = 'UJS',
  WELLNESS = 'Wellness Center',
  SHIN_SAIMDANG = 'Shin Saimdang',
  SHERBORN = 'Sherborn',
  SEONDEOK = 'Seondeok',
  OTHER = 'Other'
}

export enum UrgencyLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum RequestStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface User {
  id: string;
  userCode?: string; // Auto-generated unique code
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  contactNo?: string; // Added Contact Number
  avatarUrl: string;
  isApproved: boolean;
  password?: string;
  createdAt?: string; // For date filtering
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: string;
}

export interface TimelineEvent {
  status: RequestStatus;
  timestamp: string;
  note?: string;
}

export interface ServiceRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  title: string;
  description: string;
  category: RequestCategory;
  location: RequestLocation;
  specificLocation?: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  timeline: TimelineEvent[];
  comments: Comment[];
  workerComment?: string;
  holdReason?: string;
  feedbackRating?: number;
  feedbackComment?: string;
  createdAt: string;
}

export interface Stats {
  total: number;
  pending: number;
  completed: number;
  avgCompletionTimeHours: number;
  categoryBreakdown: { name: string; value: number }[];
}
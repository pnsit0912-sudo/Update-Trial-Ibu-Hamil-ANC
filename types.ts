
export enum UserRole {
  ADMIN = 'ADMIN',
  NAKES = 'NAKES',
  USER = 'USER'
}

export interface BabyLog {
  id: string;
  date: string;
  ageInMonths: number;
  weight: number; // kg
  height: number; // cm
  headCircumference: number; // cm
  immunization: string;
  condition: 'SEHAT' | 'GIZI_KURANG' | 'GIZI_BURUK' | 'STUNTING' | 'SAKIT';
  notes: string;
  nakesId: string;
}

export interface DeliveryData {
  deliveryDate: string;
  deliveryType: 'NORMAL' | 'SC' | 'VAKUM' | 'INDUKSI';
  maternalCondition: 'SEHAT' | 'KOMPLIKASI' | 'MENINGGAL';
  babyCondition: 'SEHAT' | 'BBLR' | 'ASFIKSIA' | 'MENINGGAL';
  babyGender: 'L' | 'P';
  babyWeight: number;
}

export interface User {
  id: string;
  username?: string;
  password?: string;
  name: string;
  dob: string;
  address: string;
  kecamatan: string;
  kelurahan: string;
  lat?: number;
  lng?: number;
  hpht: string;
  pregnancyMonth: number; 
  pregnancyNumber: number; // Gravida (G)
  parityP: number; // Para (P)
  parityA: number; // Abortus (A)
  medicalHistory: string;
  selectedRiskFactors: string[];
  totalRiskScore: number;
  role: UserRole;
  phone: string;
  isActive: boolean;
  isPostpartum?: boolean; 
  deliveryData?: DeliveryData;
  pregnancyHistory?: DeliveryData[]; 
  babyLogs?: BabyLog[]; 
  isBabyMonitoringActive?: boolean; // Default true jika isPostpartum
  babyMonitoringEndReason?: 'LULUS_USIA' | 'MENINGGAL';
}

export interface ANCVisit {
  id: string;
  patientId: string;
  visitDate: string;
  scheduledDate: string;
  nextVisitDate: string;
  weight: number;
  bloodPressure: string;
  tfu: number;
  djj: number;
  hb: number;
  complaints: string;
  dangerSigns: string[];
  edema: boolean;
  fetalMovement: string;
  followUp: string;
  nakesNotes: string;
  nakesId: string;
  status: 'COMPLETED' | 'MISSED' | 'SCHEDULED';
}

export interface SystemAlert {
  id: string;
  type: 'EMERGENCY' | 'MISSED' | 'DELIVERY';
  patientId: string;
  patientName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  ancVisits: ANCVisit[];
  alerts: SystemAlert[];
  selectedPatientId: string | null;
  logs: SystemLog[];
  userChecklists: Record<string, Record<string, boolean>>;
}

export interface EducationContent {
  id: string;
  title: string;
  type: 'TEXT' | 'VIDEO' | 'IMAGE';
  category: string;
  content: string;
  thumbnail: string;
  url: string;
}

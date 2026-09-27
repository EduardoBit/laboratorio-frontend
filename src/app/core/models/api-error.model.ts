export interface ApiError {
  status: number;
  code?: string;      // RN-INV-001, RN-VEN-002, etc.
  message: string;
  timestamp?: string;
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: 'doctor' | 'patient';
  }
  
  export interface Doctor extends User {
    specialty: string;
  }
  
  export interface Patient extends User {
    healthHistory?: string;
  }
  
  export interface Appointment {
    id: number;
    doctorId: number;
    patientId: number;
    scheduleId: number;
    startTime: Date;
    endTime: Date;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    paymentId?: string;
  }
  
  export interface ScheduleSlot {
    id: number;
    doctorId: number;
    startTime: Date;
    endTime: Date;
    isBooked: boolean;
  }
  
  export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: string;
    clientSecret: string;
  }
  
import api from './api';
import { Appointment, ScheduleSlot } from '../types/types';

export const getDoctorAppointments = async (doctorId: number): Promise<Appointment[]> => {
  const response = await api.get(`/doctors/${doctorId}/appointments`);
  return response.data;
};

export const createAppointment = async (
  doctorId: number,
  patientId: number,
  slot: ScheduleSlot
): Promise<Appointment> => {
  const response = await api.post('/appointments', {
    doctorId,
    patientId,
    scheduleId: slot.id
  });
  return response.data;
};

export const cancelAppointment = async (appointmentId: number): Promise<void> => {
  await api.patch(`/appointments/${appointmentId}/cancel`);
};

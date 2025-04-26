import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../../services/api';

const localizer = momentLocalizer(moment);

interface ScheduleEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  isBooked: boolean;
}

interface ScheduleCalendarProps {
  doctorId: number;
}

export default function ScheduleCalendar({ doctorId }: ScheduleCalendarProps) {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctorSchedule = async () => {
      try {
        const response = await api.get(`/doctors/${doctorId}/schedules`);
        const formattedEvents = response.data.map((schedule: any) => ({
          id: schedule.id,
          title: schedule.isBooked ? 'Booked' : 'Available',
          start: new Date(schedule.startTime),
          end: new Date(schedule.endTime),
          isBooked: schedule.isBooked
        }));
        setEvents(formattedEvents);
      } catch (err) {
        setError('Failed to load schedule');
        console.error('Error fetching schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorSchedule();
  }, [doctorId]);

  const handleSelectSlot = async (slotInfo: { start: Date; end: Date }) => {
    try {
      await api.post('/schedules', {
        doctorId,
        startTime: slotInfo.start,
        endTime: slotInfo.end
      });
      // Refresh events after adding new slot
      const response = await api.get(`/doctors/${doctorId}/schedules`);
      setEvents(response.data.map((schedule: any) => ({
        id: schedule.id,
        title: schedule.isBooked ? 'Booked' : 'Available',
        start: new Date(schedule.startTime),
        end: new Date(schedule.endTime),
        isBooked: schedule.isBooked
      })));
    } catch (err) {
      console.error('Error creating schedule:', err);
    }
  };

  const eventStyleGetter = (event: ScheduleEvent) => {
    const backgroundColor = event.isBooked ? '#ff6b6b' : '#51cf66';
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (loading) return <div>Loading schedule...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        eventPropGetter={eventStyleGetter}
        defaultView="week"
        min={new Date(0, 0, 0, 8, 0, 0)} // 8:00 AM
        max={new Date(0, 0, 0, 20, 0, 0)} // 8:00 PM
      />
    </div>
  );
}
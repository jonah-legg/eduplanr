import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const styles = {
  container: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 4,
    boxShadow: '0 0px 4px rgba(0, 0, 0, 0.2)',
    maxWidth: '1100px',
    margin: '20px auto'
  }
}

const Calendar = ({ assignments, handleEventClick }) => {
  return (
    <div style={styles.container}>
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridWeek"
      events={assignments}
      eventClick={handleEventClick}
    />
    </div>
  );
};

export default Calendar;
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import AddAssignmentModal from './AddAssignmentModal';
import AddClassModal from './AddClassModal';
import EventModal from './EventModal';
import Calendar from './Calendar';
import Sidebar from './Sidebar';
import ClassView from './ClassView';
import DailyPlanner from './DailyPlanner';
import useIsMobile from './useIsMobile';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import '../styles/HomePage.css';

const HomePage = () => {
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [content, setContent] = useState('calendar');
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleAssignmentModalClose = () => setShowAssignmentModal(false);
  const handleClassModalClose = () => setShowClassModal(false);
  const handleEventModalClose = () => setSelectedEvent(null);
  const [classes, setClasses] = useState([]);

  const handleEventClick = (arg) => {
    setSelectedEvent({
      title: arg.event.title,
      start: arg.event.start,
      class: arg.event.extendedProps.class,
      id: arg.event.extendedProps.id
    });
    console.log(arg);
  };

  const getClassIdByName = (className) => {
    const classObj = classes.find(cls => cls.name === className);
    return classObj ? classObj.id : null;
  };

  let classId = null;
  if (content.startsWith("classView")) {
    const className = content.split('|')[1].trim();
    classId = getClassIdByName(className);
  }

  const refreshAssignments = async () => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    const token = localStorage.getItem('token');
    console.log('Token retrieved from localStorage:', token); // Debugging line
  
    if (!token) {
      console.log('No token found, redirecting to login.'); // Debugging line
      navigate('/login');
      return;
    }
  
    try {
      const response = await fetch(`${baseURL}/assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized, possibly due to an expired token
          localStorage.removeItem('token'); // Clear the token
          navigate('/login');
        } else {
          // Handle other HTTP errors
          throw new Error('Network response was not ok.');
        }
      }
  
      const assignments = await response.json();
  
      // Helper function to get class name by ID
      const getClassNameById = async (id) => {
        const classResponse = await fetch(`${baseURL}/classes/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
  
        if (!classResponse.ok) {
          throw new Error(`Error fetching class with ID ${id}: ${classResponse.statusText}`);
        }
  
        const classData = await classResponse.json();
        return classData[0].name; // Assuming that the response has a name property
      };
  
      // Map over the assignments and create a new promise for each to get the class name
      const formattedAssignmentsPromises = assignments.map(async (assignment) => {
        console.log(assignment.date);
        const className = await getClassNameById(assignment.Class);
        return {
          title: assignment.name,
          start: assignment.date,
          allDay: true,
          color: assignment.completed ? '#d3d3d3' : assignment.color,
          extendedProps: {
            class: className, // Assign the class name from the response
            id: assignment.id
          }
        };
      });
  
      // Resolve all promises to get the formatted assignments with class names
      const formattedAssignments = await Promise.all(formattedAssignmentsPromises);
  
      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments or class names:', error);
    }
  };

  useEffect(() => {

    const fetchClasses = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const token = localStorage.getItem('token'); // Ensure the token is managed correctly

        const response = await axios.get(`${baseURL}/classes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
        // Handle errors as appropriate for your application
      }
    };

    if (!isMobile) {
      // Only run the effect if not on a mobile device
      refreshAssignments();
      fetchClasses();
    }
  }, [isMobile]);
  
  if (isMobile) {
    // Render nothing or a mobile-specific message/component
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
        width: '75vw',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <div className="alert alert-warning" role="alert" style={{textAlign: 'center'}}>
          This application is only available on desktop.
        </div>
      </div>
    );
  }// The dependency array is empty, so this effect runs once on mount

  return (
    <div className="home-page-container">

      <Sidebar setShowAssignmentModal={setShowAssignmentModal} setShowClassModal={setShowClassModal} setContent={setContent} refreshAssignments={refreshAssignments}/>

      {/* Main Content */}
      <Analytics />
      <div className="main-content">
        <div className="calendar-container">
          {content === 'calendar' ? (
            <Calendar assignments={assignments} handleEventClick={handleEventClick} />
          ) : content === 'dailyPlanner' ? (
            <DailyPlanner />
          ) : content.startsWith("classView") && classId ? (
            <ClassView classId={classId} />
          ) : (
            <p>Invalid content or class not found</p>
          )}
        </div>
        <AddAssignmentModal show={showAssignmentModal} handleClose={handleAssignmentModalClose} refreshAssignments={refreshAssignments}/>
        <AddClassModal show={showClassModal} handleClose={handleClassModalClose} />
        {selectedEvent && (
          <EventModal
            show={!!selectedEvent}
            event={selectedEvent}
            handleClose={handleEventModalClose}
            refreshAssignments={refreshAssignments}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;

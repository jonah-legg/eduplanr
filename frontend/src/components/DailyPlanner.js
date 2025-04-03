import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DailyPlanner = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseURL}/assignments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        // Assuming the server returns all assignments, filter and sort them here
        const nextWeekAssignments = response.data.filter(assignment => {
          const today = new Date();
          const nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
          const assignmentDate = new Date(assignment.date);
          assignmentDate.setDate(assignmentDate.getDate() + 1);
          return assignmentDate.toISOString() >= today.toISOString() && assignmentDate.toISOString() <= nextWeek.toISOString();
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
        setAssignments(nextWeekAssignments);
      } catch (error) {
        console.error('Error fetching assignments', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error(error.response.data);
          console.error(error.response.status);
          console.error(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error', error.message);
        }
      }
    };

    fetchAssignments();
  }, []);

  const markAsCompleted = async (id) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/assignments/complete/${id}`, {
        completed: true,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with your token management
        },
      });
      // Update the state to reflect the change
      setAssignments(assignments.map(assignment => 
        assignment.id === id ? { ...assignment, completed: true } : assignment
      ));
    } catch (error) {
      console.error('Error marking assignment as completed', error);
    }
  };

  const styles = {
    container: {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      padding: 20,
      backgroundColor: '#fff',
      borderRadius: 4,
      boxShadow: '0 0px 4px rgba(0, 0, 0, 0.2)',
      maxWidth: 400,
      margin: '20px auto'
    },
    header: {
      fontSize: 24,
      color: '#333',
      borderBottom: '1px solid #eee',
      paddingBottom: 10,
      marginBottom: 20
    },
    item: {
      padding: '10px 0',
      borderBottom: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    completedItem: {
      color: '#aaa',
      textDecoration: 'line-through'
    },
    button: {
      backgroundColor: '#22b8cf',
      border: 'none',
      padding: '5px 10px',
      borderRadius: 4,
      color: 'white',
      cursor: 'pointer'
    }
  };

  const noAssignmentsStyle = {
    textAlign: 'center',
    marginTop: 20
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>To-Do List</div>
      {assignments.length > 0 ? (
        <ul>
          {assignments.map(assignment => (
            <li key={assignment.id} style={styles.item}>
              <span style={assignment.completed ? styles.completedItem : {}}>
                {assignment.name} - Due: {assignment.date}
              </span>
              {assignment.completed ? (
                <span>✓</span>
              ) : (
                <button style={styles.button} onClick={() => markAsCompleted(assignment.id)}>Complete</button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        // This div will be displayed when there are no assignments
        <div style={noAssignmentsStyle}>All assignments are completed!</div>
      )}
      {/* Add your input and button for new items here */}
    </div>
  );
};

export default DailyPlanner;

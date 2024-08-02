import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClassView = ({ classId }) => {
  const [assignments, setAssignments] = useState([]);
  const [className, setClassName] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseURL}/assignments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Assume token is managed correctly
          },
        });

        const classResponse = await axios.get(`${baseURL}/classes/${classId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`, // Assume token is managed correctly
            },
          });

        setClassName(classResponse.data[0].name);
        // Filter assignments for a specific class and sort them
        const classAssignments = response.data.filter(assignment => assignment.Class == classId);
        setAssignments(classAssignments);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }
    };

    fetchAssignments();
  }, [classId]);  // Dependency on classId to refetch when it changes

  const markAsCompleted = async (id) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/assignments/complete/${id}`, {
        completed: true,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // Optimistically update the assignment to completed
      setAssignments(prevAssignments =>
        prevAssignments.map(assignment =>
          assignment.id === id ? { ...assignment, completed: true } : assignment
        )
      );
    } catch (error) {
      console.error('Error marking assignment as completed:', error);
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>{className}</div>
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
        <div style={{ textAlign: 'center', marginTop: 20 }}>No assignments found for this class.</div>
      )}
    </div>
  );
};

export default ClassView;
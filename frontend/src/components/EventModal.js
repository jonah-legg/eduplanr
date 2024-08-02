// EventModal.js
import React from 'react';
import moment from 'moment';
import { Modal, Button } from 'react-bootstrap';

const EventModal = ({ show, event, handleClose, refreshAssignments }) => {
  if (!show) return null;
  const formattedDate = moment(event.start).format('MMMM D, YYYY');

  const deleteAssignment = async (assignmentId) => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;;
    const token = 'secret-token';
    console.log(`Attempting to delete assignment with ID: ${assignmentId}`);
  
    try {
      const response = await fetch(`${baseURL}/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      handleClose();
      console.log('Delete Success:', response);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const markAssignmentAsCompleted = async (assignmentId, completed) => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;;
    const token = 'secret-token';
  
    try {
      const response = await fetch(`${baseURL}/assignments/complete/${assignmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ completed })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Update Success:', data);
      handleClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async () => {
    await deleteAssignment(event.id);
    await refreshAssignments();
  };

  const handleComplete = async () => {
    await markAssignmentAsCompleted(event.id, true);
    await refreshAssignments();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{event.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
            <label>Class:  {event.class}</label>
            <br></br>
            <label>Due Date:  {formattedDate}</label>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleDelete}>
          Delete
        </Button>
        <Button variant="primary" onClick={handleComplete}>
          Mark as Completed
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EventModal;
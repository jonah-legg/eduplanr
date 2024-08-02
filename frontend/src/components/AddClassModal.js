import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Modal, Button } from 'react-bootstrap';

const AddClassModal = ({ show, handleClose }) => {
  const [nameInput, setNameInput] = useState('');

  const addClass = (className) => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;;
    
    // Retrieve the token from localStorage
    const token = localStorage.getItem('token');
    const secretToken = 'secret-token';
    // Decode the token to extract the user ID
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.id; // Assuming the token has an 'id' claim

    fetch(`${baseURL}/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',

      },
      body: JSON.stringify({ name: className, user: userId }) // The keys match the Sequelize model and Express endpoint
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      handleClose(); // Close the modal after saving
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  const handleSubmit = () => {
    addClass(nameInput);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Class</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <label className='my-2'>Enter the Name:&nbsp;&nbsp;&nbsp;
            <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
        </label>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Class
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddClassModal;
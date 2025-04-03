import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const AddAssignmentModal = ({ show, handleClose, refreshAssignments }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');
  const [colorInput, setColorInput] = useState('#ffffff');

  const colorOptions = [
    '#FF6900', // orange
    '#FCB900', // yellow
    '#7BDCB5', // teal
    '#00D084', // green
    '#8ED1FC', // blue
    '#0693E3', // dark blue
    '#ABB8C3', // grey
    '#EB144C', // red
    '#F78DA7', // pink
    '#9900EF'  // purple
  ];

  const ColorCircle = ({ color, isSelected, onClick }) => {
    const style = {
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      display: 'inline-block',
      margin: '5px',
      cursor: 'pointer',
      border: isSelected ? '2px solid black' : '1px solid #ddd',
      backgroundColor: color
    };
    return <div style={style} onClick={onClick} />;
  };

  const renderColorOptions = () => {
    return colorOptions.map((color) => (
      <ColorCircle
        key={color}
        color={color}
        isSelected={color === colorInput}
        onClick={() => setColorInput(color)}
      />
    ));
  };

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true); // Set loading to true before fetching data
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${baseURL}/classes`, {
          method: 'GET', // Specify the method, if not GET is default
          headers: {
            'Content-Type': 'application/json', // Specify the content type
            'Authorization': `Bearer ${token}`  // Properly formatted Authorization header
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }
        const data = await response.json();
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setIsLoading(false); // Set loading to false after fetching data
      }
    };

    fetchClasses();
  }, [show]); // Remove the dependency on `show` if classes can be added while the modal is open
  const addAssignment = async (assignment) => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${baseURL}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assignment)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Success:', data);
      handleClose();
      refreshAssignments();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async () => {
    if (!nameInput.trim() || !dueDateInput.trim()) {
      console.error('Name and due date must be provided.');
      return;
    }

    // Only proceed if selectedClass is set
    if (!selectedClass) {
      console.error('A class must be selected.');
      return;
    }

    const assignment = {
      Class: selectedClass,
      name: nameInput.trim(),
      date: dueDateInput.trim(),
      color: colorInput,
      completed: false
    };

    await addAssignment(assignment);
    await refreshAssignments();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Assignment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {classes.length > 0 ? (
          <>
            <div className='my-2'>
              <label>Choose a Class:&nbsp;&nbsp;</label>
              <select
                style={{ width: '50%' }}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='my-2'>
              <label>Enter Name:&nbsp;&nbsp;</label>
              <input
                type="text"
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>
            <div className='my-2'>
              <label>Enter Due Date:&nbsp;&nbsp;</label>
              <input
                type="date"
                onChange={(e) => setDueDateInput(e.target.value)}
              />
            </div>
            <div className='my-2'>
              <label>Choose Color:&nbsp;&nbsp;</label>
              <div>
                {renderColorOptions()}
              </div>
            </div>
          </>
        ) : (
          <div className="alert alert-warning" role="alert">
            You need to add classes before you can assign assignments.
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!selectedClass || !nameInput.trim() || !dueDateInput.trim()}>
          Save Assignment
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddAssignmentModal;

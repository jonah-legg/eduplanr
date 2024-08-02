import React, { useState, useEffect } from 'react';

const Sidebar = ({ setShowAssignmentModal, setShowClassModal, setContent, refreshAssignments }) => {
    const [classes, setClasses] = useState([]);
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);
    const [showClassesDropdown, setShowClassesDropdown] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const baseURL = process.env.REACT_APP_API_BASE_URL;
                const response = await fetch(`${baseURL}/classes`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setClasses(data);
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        };

        fetchClasses();
    }, []);

    const toggleCreateDropdown = () => {
        setShowCreateDropdown(!showCreateDropdown);
    };

    const toggleClassesDropdown = () => {
        setShowClassesDropdown(!showClassesDropdown);
    };

    const handleSelectCreateOption = (option) => {
        if (option === 'addAssignment') {
            setShowAssignmentModal(true);
        } else if (option === 'addClass') {
            setShowClassModal(true);
        }
        setShowCreateDropdown(false);
    };

    const handleClassSelection = (className) => {
        setContent("classView | " + className);
    };

    return (
        <div className="sidebar" style={sidebarStyle}>
            <button onClick={toggleCreateDropdown} style={dropdownButtonStyle}>
                Create ▼
            </button>
            {showCreateDropdown && (
                <div style={{ paddingTop: '-10px', marginTop: '-25px' }}>
                    <button onClick={() => handleSelectCreateOption('addAssignment')} style={dropdownItemStyleTop}>
                        Add Assignment
                    </button>
                    <button onClick={() => handleSelectCreateOption('addClass')} style={dropdownItemStyle}>
                        Add Class
                    </button>
                </div>
            )}

            <button className="drpdwn px-1 py-2 h6 mt-3" onClick={() => { setContent('calendar'); refreshAssignments(); }} style={actionButtonStyle}>
                Calendar
            </button>
            <button className="drpdwn px-1 py-2 h6 mt-2" onClick={() => { setContent('dailyPlanner'); refreshAssignments(); }} style={actionButtonStyle}>
                Daily Planner
            </button>

            <button className="drpdwn px-1 py-2 h6 mt-2" onClick={toggleClassesDropdown} style={actionButtonStyle}>
                Classes ▼
            </button>
            {showClassesDropdown && (
                <div>
                    {classes.map(cls => (
                        <button className="drpdwn px-1 py-2 h6 mt-2" key={cls.id} onClick={() => handleClassSelection(cls.name)} style={actionButtonStyle}>
                            {cls.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const sidebarStyle = {
    height: '100vh', // Adjust height as per your layout requirements
    overflowY: 'auto', // Enables vertical scroll
    width: '250px', // Set a fixed width or adjust as necessary
    borderRight: '1px solid #dcdcdc', // Optional: adds a border to the right
    padding: '20px' // Optional: adds padding inside the sidebar for better spacing
};

const dropdownButtonStyle = {
    position: 'relative',
    zIndex: 2,
    backgroundColor: '#fff',
    border: '1px solid #dcdcdc',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    transition: 'box-shadow 0.2s ease-in-out',
    outline: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    color: '#5f6368',
    width: '100%',
    padding: '10px 20px'
};

const dropdownItemStyle = {
    position: 'relative',
    zIndex: 1,
    backgroundColor: '#fff',
    border: '1px solid #dcdcdc',
    borderRadius: '0px',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease-in-out',
    outline: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    color: '#5f6368',
    width: '100%',
    paddingTop: '5px',
    paddingBottom: '5px'
};

const dropdownItemStyleTop = {
  position: 'relative',
  zIndex: 1,
  backgroundColor: '#fff',
  border: '1px solid #dcdcdc',
  borderRadius: '0px',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s ease-in-out',
  outline: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none',
  color: '#5f6368',
  width: '100%',
  paddingTop: '25px',
  paddingBottom: '5px'
};

const actionButtonStyle = {
  backgroundColor: '#fff',
  border: '1px solid #dcdcdc',
  borderRadius: '0px',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
  outline: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none',
  color: '#5f6368',
  width: '100%'
};

export default Sidebar;
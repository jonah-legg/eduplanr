const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const jwtSecret = "secret-token";

const app = express();
const saltRounds = 10; // You can adjust the number of rounds as needed
const baseURL = 'http://localhost:3000';

app.use(cors({
    // Configure CORS to allow requests from the origin of the front-end app
    origin: baseURL
  }));

// Connect to MySQL database from the server
const sequelize = new Sequelize('defaultdb', 'doadmin', 'AVNS_fpbOPn0PpEQHX8ocGv_', {
  host: 'db-mysql-nyc3-90514-eduplanr-do-user-16321376-0.c.db.ondigitalocean.com',
  dialect: 'mysql',
  port: 25060,
  dialectOptions: {
    useUTC: true, // for reading from database
  },
  timezone: '+00:00',
  dialectModule: require('mysql2')
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ message: 'Authorization header is missing' });
  }
  const token = authHeader.split(' ')[1];
  console.log('Token:', token); // To check the actual token received
  if (!token) {
    return res.status(403).json({ message: 'A token is required for authentication' });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Decoded:', decoded); // To check the decoded token
    req.user = decoded;
  } catch (err) {
    console.log('Token verification error:', err); // To log any errors from jwt.verify
    return res.status(401).json({ message: 'Invalid Token' });
  }
  next();
};

// Define a model
const Assignment = sequelize.define('Assignment', {
  name: Sequelize.STRING,
  Class: Sequelize.STRING,
  date: Sequelize.STRING,
  color: Sequelize.STRING,
  completed: Sequelize.BOOLEAN
});

const Class = sequelize.define('Class', {
  name: Sequelize.STRING,
  user: Sequelize.INTEGER
});

const User = sequelize.define('User', {
  name: {
    type: Sequelize.STRING,
    allowNull: false // Update this according to your requirements (e.g., false for NOT NULL)
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false // Update this according to your requirements
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false // Update this according to your requirements
  }
});

// Sync the model with the database
sequelize.sync();

// Middleware to parse JSON
app.use(express.json());

// Endpoint for user login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        jwtSecret,
        { expiresIn: '1h' }
      );
      return res.json({ token, id: user.id, name: user.name });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Endpoints for assignments
app.get('/assignments', verifyToken, async (req, res) => {
  const userId = req.user.id; // User ID from the JWT token

  try {
    // Find all classes that belong to the user
    const userClasses = await Class.findAll({
      where: { user: userId }
    });

    // Extract the class IDs from the userClasses
    const classIds = userClasses.map(c => c.id);

    // Find all assignments that belong to the user's classes
    const assignments = await Assignment.findAll({
      where: {
        Class: classIds // Filter assignments where the Class ID is in the user's class IDs
      }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
});

app.post('/assignments', verifyToken, async (req, res) => {
  const { name, Class, date, color, completed } = req.body;
  const assignment = await Assignment.create({ name, Class, date, color, completed });
  res.json(assignment);
});

// Edit an existing assignment
app.post('/assignments/complete/:id', verifyToken, async (req, res) => {
    console.log("Message Received");
    const { id } = req.params; // Extract the assignment ID from the URL parameter
    const { completed } = req.body; // Extract the completed status from the request body
  
    try {
      // Find the assignment by primary key (ID)
      const assignment = await Assignment.findByPk(id);
      if (!assignment) {
        // If the assignment doesn't exist, return a 404 error
        return res.status(404).json({ message: 'Assignment not found' });
      }
  
      // Update the 'completed' field of the assignment
      const updatedAssignment = await assignment.update({ completed });
  
      // Return the updated assignment data
      res.json(updatedAssignment);
    } catch (error) {
      // If something goes wrong, return a 500 error
      res.status(500).json({ message: 'Error updating assignment', error: error.message });
    }
  });

// DELETE an existing assignment
app.delete('/assignments/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
  
    try {
      const assignment = await Assignment.findByPk(id);
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
  
      await assignment.destroy();
      res.status(204).send(); // No content
    } catch (error) {
      res.status(500).json({ message: 'Error deleting assignment', error });
    }
  });

// Endpoints for classes
app.get('/classes', verifyToken, async (req, res) => {
  const userId = req.user.id; // User ID from the JWT token
  try {
    // Find all classes that belong to the user
    const classes = await Class.findAll({
      where: { user: userId }
    });

    res.json(classes);
  } catch (error) {
    // It's good practice to handle potential errors
    res.status(500).json({ error: error.message });
  }
});

app.get('/classes/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {

    const classes = await Class.findAll({
      where: { id: id }
    });

    res.json(classes);
  } catch (error) {
    // It's good practice to handle potential errors
    res.status(500).json({ error: error.message });
  }
});

app.post('/classes', verifyToken, async (req, res) => {
  const { name, user } = req.body;
  try {
    const classToCreate = await Class.create({ name, user });
    res.json(classToCreate);
  } catch (error) {
    // It's good practice to handle potential errors
    res.status(500).json({ error: error.message });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name, password, email } = req.body;

    // Simple data validation
    if (!name || !password || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Additional validations can be added here

    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      name,
      password: hashedPassword,
      email
    });

    const userResponse = { ...newUser.toJSON(), password: undefined };

    return res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating new user:', error); // Log the full error
    return res.status(500).json({ message: 'Error creating new user', error: error.message });
  }
});

// Endpoint to retrieve a user by id
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract the user's id from the URL parameter

    const user = await User.findByPk(id); // Find the user by their primary key (id)

    if (!user) {
      // If the user isn't found, return a 404 Not Found response
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the found user
    res.json(user);
  } catch (error) {
    // If there's an error, return a 500 Internal Server Error response
    res.status(500).json({ message: 'Error retrieving user', error: error.message });
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: 'eduplanrteam@gmail.com',
    clientId: '28997021305-4d2pgqrse7u7mphs50gipqu3ro14uqj2.apps.googleusercontent.com',
    clientSecret: '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',
    refreshToken: '1//04wEB8U02CVUHCgYIARAAGAQSNwF-L9Irzygo7g78HxNsnCXjJLL0bORHa3cETrw4cXMEZQ47BS6oUM2zDgEcq-4oeKvkzVFXCWI',
    accessToken: 'ya29.a0Ad52N3_UtRZldUllXYFTYRTU9581OLNnn4zDHJ7_WjWdDgrm9e9dBt2RNyNak7XrZvMHzXVpws_qukXLS215LF045VE7x1Q4dgjqmcL3fhLgVgV67XO3xQdxmr6-DRS2tiIzkMTZuhOBKNRs6TKjk-Kc2BI9X6aQOV1EaCgYKAfsSARISFQHGX2MixfKzL_OP08GGWuFD-TVw9Q0171', // Optional, will be obtained automatically if not provided
}
});

// Function to send emails
async function sendAssignmentsEmail(to, content) {
  const mailOptions = {
      from: 'eduplanrteam@gmail.com',
      to: to,
      subject: 'Weekly Assignments',
      text: content
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
  } catch (error) {
      console.error('Error sending email:', error);
  }
}

// Function to gather assignments and initiate sending emails
async function processWeeklyAssignments() {
  const users = await User.findAll(); // Fetch all users
  for (const user of users) {
      // Assuming 'Class' has a userId field and 'Assignment' has a classId field
      const classes = await Class.findAll({
          where: { user: user.id }
      });

      // Collect all class IDs for the user to use in the Assignment query
      const classIds = classes.map(c => c.id);

      const assignments = await Assignment.findAll({
          where: {
              Class: { [Sequelize.Op.in]: classIds }, // Filter assignments by class IDs
              date: {
                  [Sequelize.Op.gt]: new Date(), // Greater than today
                  [Sequelize.Op.lt]: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) // Less than one week from now
              }
          }
      });

      if (assignments.length > 0) {
          let message = "Your assignments for the next week:\n\n";
          assignments.forEach(asgmt => {
              message += `${asgmt.name} - Due: ${asgmt.date}\n`;
          });

          await sendAssignmentsEmail(user.email, message);
      }
  }
}

// Start the server
app.listen(3001, () => {
  console.log('Server started on port 3001');
});



// Schedule the task to run every Monday at 9 AM
cron.schedule('0 9 * * 1', () => {
  console.log('Executing weekly assignment notifications');
  processWeeklyAssignments();
});

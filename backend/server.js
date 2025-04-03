const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const jwtSecret = "secret-token";

const app = express();
const saltRounds = 10;
const baseURL = 'http://localhost:3000';

app.use(cors({
    // Configure CORS to allow requests from the origin of the front-end app
    origin: baseURL
  }));

const sequelize = new Sequelize('defaultdb', 'doadmin', 'key', {
  host: 'hostname.com',
  dialect: 'mysql',
  port: 25060,
  dialectOptions: {
    useUTC: true,
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
  console.log('Token:', token);
  if (!token) {
    return res.status(403).json({ message: 'A token is required for authentication' });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Decoded:', decoded);
    req.user = decoded;
  } catch (err) {
    console.log('Token verification error:', err);
    return res.status(401).json({ message: 'Invalid Token' });
  }
  next();
};

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
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

sequelize.sync();

app.use(express.json());

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

app.get('/assignments', verifyToken, async (req, res) => {
  const userId = req.user.id; // User ID from the JWT token

  try {
    const userClasses = await Class.findAll({
      where: { user: userId }
    });

    const classIds = userClasses.map(c => c.id);

    const assignments = await Assignment.findAll({
      where: {
        Class: classIds
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

app.post('/assignments/complete/:id', verifyToken, async (req, res) => {
    console.log("Message Received");
    const { id } = req.params;
    const { completed } = req.body;
  
    try {
      const assignment = await Assignment.findByPk(id);
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
  
      const updatedAssignment = await assignment.update({ completed });
  
      res.json(updatedAssignment);
    } catch (error) {
      res.status(500).json({ message: 'Error updating assignment', error: error.message });
    }
  });

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

app.get('/classes', verifyToken, async (req, res) => {
  const userId = req.user.id; // User ID from the JWT token
  try {
    const classes = await Class.findAll({
      where: { user: userId }
    });

    res.json(classes);
  } catch (error) {
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
    res.status(500).json({ error: error.message });
  }
});

app.post('/classes', verifyToken, async (req, res) => {
  const { name, user } = req.body;
  try {
    const classToCreate = await Class.create({ name, user });
    res.json(classToCreate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name, password, email } = req.body;

    if (!name || !password || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      name,
      password: hashedPassword,
      email
    });

    const userResponse = { ...newUser.toJSON(), password: undefined };

    return res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating new user:', error);
    return res.status(500).json({ message: 'Error creating new user', error: error.message });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
      
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error: error.message });
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: 'email@gmail.com',
    clientId: 'client',
    clientSecret: 'secret',
    refreshToken: 'refresh',
    accessToken: 'access',
}
});

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

async function processWeeklyAssignments() {
  const users = await User.findAll(); // Fetch all users
  for (const user of users) {
      const classes = await Class.findAll({
          where: { user: user.id }
      });

      const classIds = classes.map(c => c.id);

      const assignments = await Assignment.findAll({
          where: {
              Class: { [Sequelize.Op.in]: classIds },
              date: {
                  [Sequelize.Op.gt]: new Date(),
                  [Sequelize.Op.lt]: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
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

app.listen(3001, () => {
  console.log('Server started on port 3001');
});

cron.schedule('0 9 * * 1', () => {
  console.log('Executing weekly assignment notifications');
  processWeeklyAssignments();
});

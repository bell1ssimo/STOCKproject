const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const autToken = require('./middleware/aut');
const cookieParser = require('cookie-parser');
const adminRouter = require('./admin'); 
const Item = require('./models/items');
const axios = require('axios');
const NewsAPI = require('newsapi');

const { Chart } = require('chart.js');



app.use('/uploads',express.static('uploads'))
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/login', { family: 4 })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
    });

app.use('/admin', adminRouter);

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/admin', async (req, res) => {
    try {
        const items = await Item.find();

        res.render('admin', { items: items });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items');
    }
});

const newsapi = new NewsAPI('5daecf6f718342f2b20c700b00e2c3e1');

// Route to fetch stock news and render in EJS template
app.get('/stock-news', async (req, res) => {
  try {
    const response = await newsapi.v2.everything({
      q: 'Microsoft OR stock', // Search query
      language: 'en', 
      sortBy: 'publishedAt', 
    });

    const articles = response.articles;
    res.render('stock-news', { articles: articles }); 
  } catch (error) {
    console.error('Error fetching stock news:', error);
    res.status(500).send('Error fetching stock news');
  }
});

//____________________________________________________________________
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'anurmiyashev@gmail.com',
        pass: 'bmifhbzdzigqtbwh'
    }
});

//__________________________________________________

//___________________________________________________________

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/main', async (req, res) => {
    autToken(req, res);
    try {
        const user = await User.findOne({ _id: req.userId }, { isAdmin: 1 });
        if (!user) {
            return res.status(404).send('User not found');
        }

        const isAdmin = user.isAdmin;

        const items = await Item.find();

        res.render('main', { isAdmin, items });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items');
    }
});







app.post('/register', (req, res) => {
    const { username, password, confirmPassword, email } = req.body;
    if (!username || !password || !confirmPassword || !email) {
        return res.status(400).send('All fields are required');
    }

    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).send('Error hashing password');
        }

        // Create a new user object
        const newUser = new User({
            username: username,
            password: hash, // Store the hashed password
            email: email
        });

        // Save the new user to the database
        newUser.save()
            .then(() => {
                // Send a registration success email to the user
                transporter.sendMail({
                    from: 'anurmiyashev@gmail.com',
                    to: email,
                    subject: 'Registration Successful',
                    text: 'Congratulations! You have successfully registered.'
                }, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                    } else {
                        console.log('Email sent:', info.response);
                    }
                });

                res.redirect('/login');
            })
            .catch(err => {
                console.error('Error saving user:', err.message);
                res.status(500).send('Error registering user');
            });
    });
});

//_____________________________________________________________________________________

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//______________________________________________________________________________________
app.get('/logout', async (req, res) => {
    res.clearCookie('token');
    res.redirect('/login'); // Redirect to the login page after logging out
});


app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const user = await User.findOne({username: req.body.username});

    if(user){
        const passwordResult = bcrypt.compareSync(req.body.password, user.password);
        if(passwordResult){
        const token = jwt.sign({
            username: user.username,
            userId: user._id
        }, 'bellissimo', {expiresIn: '1h'});

        res.cookie('token',token);
        res.redirect('/main');
        } else{
        res.status(401).render('login', {message:'email or password is incorrect'});
        }
    }else{
        res.status(401).render('login', {message:'email or password is incorrect'});
    }
});


//____________________________________________________


app.get('/stock', async (req, res) => {
    try {
        res.render('stock');
    } catch (error) {
        console.error('Error rendering stock page:', error);
        res.status(500).send('Internal server error');
    }
});
// Endpoint to fetch stock data
app.get('/stock-data', async (req, res) => {
    const API_KEY = '/JYRNV39J1RA6Y6TP'; 
    const symbol = 'MSFT'; // Example: Microsoft Corporation

    try {
        const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEY}`);
        console.log('Response data:', response.data);
        const stockData = response.data['Time Series (5min)'];
        const timestamps = Object.keys(stockData).reverse();
        const openValues = timestamps.map(timestamp => parseFloat(stockData[timestamp]['1. open']));

        res.json({ timestamps, openValues });
    } catch (error) {
        console.error('Error fetching stock data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
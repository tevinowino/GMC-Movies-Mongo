var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { MongoClient, ObjectId } = require('mongodb'); // Import MongoClient and ObjectId

require('dotenv').config();

// MongoDB connection URI
let uri = `mongodb+srv://tevinowino65:${process.env.MONGO_PW}@contact.19wbm.mongodb.net/?retryWrites=true&w=majority&appName=Contact`;
let client = new MongoClient(uri);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Home Route
app.get('/', async (req, res) => {
  res.render('home');
});

app.get('/movies', async (req, res) => {
  try {
    await client.connect();
    const db = client.db('movies');

    // Get the genre from query parameters
    const genre = req.query.genre;

    // Query the movies collection, filtering by genre if provided
    const query = genre ? { genre: genre } : {};
    const movies = await db.collection('movies').find(query).toArray();
    res.json(movies);

  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Individual Movie Route
app.get('/movies/:id', async (req, res) => {
  try {
    await client.connect();
    const db = client.db('movies');
    const movie = await db.collection('movies').findOne({ _id: new ObjectId(req.params.id) });
    if (!movie) {
      return res.status(404).render('error', { message: 'Movie not found' });
    }
    res.json(movie)
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

module.exports = app;

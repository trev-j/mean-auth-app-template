const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./routes/user');

const app = express();

mongoose.connect('mongodb://' + process.env.MONGO_DB_USER + ':' + process.env.MONGO_DB_PW + '@' + process.env.MONGO_DB_HOST + ':' + process.env.MONGO_DB_PORT + '/node-angular?authSource=admin')
.then(()=> {
  console.log('Connected to MongoDB server');
})
.catch((err)=> {
  console.error(err.message);
  console.error('Failed to connect to MongoDB server');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join("backend/images")));

app.use((req, res, next) => {

  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  res.setHeader(
    'Access-Control-Allow-Methods',
    "GET, POST, PATCH, DELETE, OPTIONS, PUT"
  );

  next();
});

app.use('/api/user', userRoutes);

module.exports = app;

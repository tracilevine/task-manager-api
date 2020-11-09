require('./db/config');

const express = require('express'),
  app = express();

// Parse incoming JSON into objects
app.use(express.json());

module.exports = app;
require('./db/config');

const express = require('express'),
  app = express(),
  openRoutes = require('./routes/open/index');

// Parse incoming JSON into objects
app.use(express.json());

//Unauthenticated routes
app.use('/api/users', openRoutes);

module.exports = app;
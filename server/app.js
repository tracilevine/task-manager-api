require('./db/config');

const express = require('express'),
  app = express(),
  openRoutes = require('./routes/open/index'),
  userRouter = require('./routes/secure/users'),
  passport = require('./middleware/authentication/index'),
  cookieParser = require('cookie-parser');

// Parse incoming JSON into objects
app.use(express.json());

//Unauthenticated routes
app.use('/api/users', openRoutes);

//Middleware to parse through incoming cookies in the requests.
app.use(cookieParser());

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.resolve(__dirname, '..', 'client', 'build')));
}

//Authenticated Routes 
//this will require all Authenticated API's to uses passport 
app.use('/api/*', passport.authenticate('jwt', { session: false }));

app.use('/api/users', userRouter);

module.exports = app;
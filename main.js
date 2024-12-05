require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;

//database connection
mongoose.connect(process.env.DB_URI,)
.then(() => {
    console.log('Database connected successfully');
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
   
  //middlewares
  app.use(express.urlencoded({extended:false}))
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
  }))

  app.use((req, res, next)=>{
    res.locals.message = req.session.message;
     req.session.message = null;
    next();
  });
  app.use('/', require('./routes/routes'));
  app.use(express.static('uploads'))

  //set template engine

  app.set('view engine', 'ejs');

// route prefix
// app.use('',require('./routes/routes'))

app.listen(PORT, ()=>{
    console.log(`Server started at  ${PORT}`)
})


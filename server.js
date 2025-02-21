const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const users=require('./routes/api/users');
const profile=require('./routes/api/profile');
const posts=require('./routes/api/posts');
const app = express();

//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//db config
const db= require('./config/keys').mongoURI;
mongoose.connect(db).then(()=>console.log("Mongo DB connection established!")).catch(err=>console.log(err));

//passport middleware
app.use(passport.initialize());

//passport config
require('./config/passport')(passport);

//user routes
app.use('/api/users',users);                                
app.use('/api/profile',profile);
app.use('/api/posts',posts);
const port = process.env.PORT || 7878;
app.listen(port,()=> console.log('listening on port',port));
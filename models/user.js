const mongoose = require('mongoose');

// User Schema
const userSchema = mongoose.Schema({
  username:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  }
});

var User=module.exports =mongoose.model("User",userSchema);
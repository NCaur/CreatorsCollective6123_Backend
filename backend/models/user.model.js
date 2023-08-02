const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define your Mongoose schema and models here (e.g., User)
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
    required:true
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
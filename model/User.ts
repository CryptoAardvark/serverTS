
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true
  },

  email: {
    type: String,
    require: true
  },

  password: {
    type: String,
    require: true
  },

  role: {
    type: String,
    require: true
  },

  gender: {
    type: String,
    require: true,
    default: "male"
  },
  //status 0, 1, 2, 3 
  status: {
    type: String,
    require: true,
    default: "1"
  }
});
//definition function
UserSchema.pre("save", async function (next)  {
  console.log("Pre save function is running.");
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const User = mongoose.model("user", UserSchema);
module.exports = User;


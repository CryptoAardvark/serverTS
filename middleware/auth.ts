import { Request, Response, Next } from 'express';
const expAsyncHandler = require("express-async-handler");
const Users = require('../model/User');
const cookie = require('cookie');
const jwt = require('jsonwebtoken')

//define middleware
const AuthHandler = expAsyncHandler(async (req: Request, res: Response, next: Next) => {
  let token;
  if (!req.headers.cookie) {
    return res.status(401).json({ error: "Please signin again.", isAuthenticated: false });
  }
  token = cookie.parse(req.headers.cookie)
    if (token) {
      let jwttoken = token.token;
      await jwt.verify(jwttoken, "secretOrkey", (err, decoded) => {
        if (decoded) {
          Users.findOne({ email: decoded.data.email })
            .then(user => {
              req.body.users = user;
              next();
            })
            .catch(err => {
              return res.status(401).json({isAuthenticated: false})
            })
        }else return res.status(401).json({ isAuthenticated: false });
      })
      
    } 
})

module.exports = AuthHandler;

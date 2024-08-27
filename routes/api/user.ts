import { Request, Response } from 'express';
const express = require('express');
const bcrypt = require('bcrypt')
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
//load model User
const User = require('../../model/User');
//define router
const userRouter = express.Router();
//define userdata for typescript
interface UserData{
  name: string,
  email: string,
  password: string,
  role: string,
  gender: string,
  avatar: string
}
//user sign up
userRouter.post('/signup', async (req: Request, res: Response) => {
  const userdata: Partial<UserData> = req.body;
  if (!userdata.email || !userdata.name || !userdata.password || !userdata.gender || !userdata.avatar) {
    return res.status(400).josn({ error: "Input type is invalid!" });
  }
  const isMatch = await User.findOne({ email: userdata.email });
  if (isMatch) {
    return res.status(409).json({ error: "User already existed!" });
  }
  const newUser = new User(userdata);
  newUser.save().then((user) => {
    res.status(201).json({ success: "Sign up successful!" });
    console.log(user);
  }).catch(err => {
    res.status(500).json({ error: "Server error" });
    console.log(err);
  })
});

//user sign in
userRouter.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Input type is invalid!" });
    }
    // console.log(req.body)
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.status == 0) {
        return res.status(401).json({ msg: "waiting" });
      } else {
        if (userData.status == 2) return res.status(401).josn({ msg: "Your account is blocked! Please contact admin!" });
      }
      const isMatch = await bcrypt.compare(password, userData.password);
      if (!isMatch) {
        res.status(404).json({error: "Email or password is invalid!"})
      } else {
        const tokenData = { email: userData.email, gender: userData.gender, name: userData.name };
        const token = jwt.sign({ exp: (Date.now() + 600000000), data: tokenData }, "secretOrkey");
        res.cookie("token", token, {
          expires: new Date(Date.now() + 200000000),
          httpOnly: true
        })
        res.status(202).send({ msg: "success", token: token });
      }
    } else {
      res.status(404).json({ error: "Email or password is invalid!" });
    }
  } catch (err) {
    console.log(err);
  }
})

//user check current
userRouter.get('/current', async (req: Request, res: Response) => {
  if (req.headers.cookie) {
    const myCookie = cookie.parse(req.headers.cookie);
    const jwttoken = myCookie.token;
    if (jwttoken) {
      await jwt.verify(jwttoken, "secretOrkey", (err, decoded) => {
        if (decoded) {
          User.findOne({ email: decoded.email })
            .then(user => {
              res.status(202).json({ isAuthenticated: true });
            })
            .catch(err => {
              res.status(401).json({ isAuthenticated: false })
            })
        } else return res.status(401).json({ isAuthenticated: false })
      });
    } else {
      res.status(401).json({ isAuthenticated: false });
    }
  } else res.status(401).json({ isAuthenticated: false });
})

//user signout
userRouter.post('/signout', (req: Request, res: Response) => {
  res.status(204).clearCookie("token").json({msg:"User signout successful!"});
}  )

module.exports = userRouter;
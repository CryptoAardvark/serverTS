import { Request, Response } from "express"
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const port = 5000;

//load userRouter
const userRouter = require('./routes/api/user');
//load middleware
const AuthHandler = require('./middleware/auth');
//define server
const app = express();

//Mongodb connect
mongoose.connect('mongodb://127.0.0.1:27017/apiexam', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}).then(() => console.log('Mongodb connected!')).catch(err => console.log(err));

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api/users', userRouter);
// api 
app.get('/', (req: Request, res: Response) => {
 
  res.status(200).json({msg: "Okay"});
})
//api middleware test
app.get('/test', AuthHandler, (req: Request, res: Response) => {
   if (req.body.users) {
    console.log(req.body.users)
  }
  res.status(200).json({ msg: "Passed!" });
} )

app.listen(port, () => {
  console.log(`Server is running on ${port} port.`);
})
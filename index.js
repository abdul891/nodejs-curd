

const express = require("express");
const cors = require("cors");
const taskRouter = require("./routes/taskRoutes");
const authRouter = require("./routes/authRoutes");
const mongoose = require("mongoose");
require('dotenv').config();
// require("./config/database").connect();

const app = express();
const PORT = process.env.PORT || 5000;
const con = require('./config/database');
app.use(express.json());
app.use(cors());


app.get("/",(req,res)=>{res.send('<h1>Welcome</h1>');})
app.use("/api/user", authRouter);
app.use("/api/task", taskRouter);
mongoose.connect(process.env.DATABASE_URL)
.then(()=>{
    app.listen(port, () => {
        console.log(`app listening on port ${PORT}`)
      })
})
.catch((err)=>{
    console.log(err);
})
// app.listen(PORT, () => console.log(`Server is running at port ${PORT}`));


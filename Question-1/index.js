const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const bcrypt = require("bcrypt");
const session = require("express-session")
const port = 8000;

app.use(session({
  secret: "this is secret",
  resave: false,
  saveUninitialized: false,
  cookie:{
    maxAge: 60000
  }
}))
const saltRounds = 10;
const myPlaintextPassword = "s0//P4$$w0rD";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/userDatails");

const mySchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const MyModel = mongoose.model("User", mySchema);

app.set("view engine", "ejs");

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, saltRounds, async function (err, hash) {
    await MyModel.create({ name: name, email: email, password: hash });
  });
  res.send("<h1>Welcome to dashboard</h1>");
});
app.get("/form", function (req, res) {
  res.render("profile", { title: "Signup Page", message: "signupMessage" });
});
app.get("/",(req,res)=>{
  res.redirect("/form")
})
app.listen(port, () => {
  console.log("server is listening to this port " + port);
});

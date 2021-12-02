const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
var port = 8000;

app.use(
  session({
    secret: "keyisuser",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 600000,
    },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("User", userSchema);
mongoose.connect("mongodb://localhost:27017/myapp");

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new LocalStrategy(function (username, password, done) {
    User.findOne({ username: username}, function (err, user) {
      // console.log(user);
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (!(user.password === password)) {
        return done(null, false);
      }
      return done(null, user);
    });
  })
);

app.get("/",(req, res)=>{
  res.send(`<h1>Welcome</h1>
  <a href="/login">Login</a>
  <a href="/register">register</a>
  `)
})

app.get("/dashboard",(req, res)=>{
  res.send("Welcome To dashboard")
})

//LOGIN

app.get("/login",(req, res)=>{
  res.sendFile(__dirname+ "/Files" + "/SignIn.html")
})

app.post("/login", passport.authenticate("local",{ session: true}), function (req, res) {
    console.log(req.user)
    res.redirect("/dashboard")
  }
);

//REGISTRATION

app.get("/register",(req, res)=>{
  res.sendFile(__dirname + "/Files/" + "registration.html")
})

app.post("/register",async (req, res)=>{
  User.findOne({ username: req.body.email}, async(err, doc)=>{
    if(err) return err;
    if(doc) res.send(`User already exits. Register again - <a href="/register">Register</a>`)
    if(!doc){
      await User.create({ username: req.body.email , password: req.body.password})
      res.send(`Registration successful. Please Login - <a href="/login">Login</a>`)
    }
  })
})

app.listen(port, () => {
  console.log("Server is listening to this port " + port);
});

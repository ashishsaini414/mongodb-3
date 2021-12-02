const express= require("express");
const app = express()
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const passport = require("passport")
const facebookStrategy = require("passport-facebook").Strategy
const session = require("express-session")
const User = require("./dbData/users")
var port = 5000

app.set("view engine","ejs")

app.use(session({ 
    secret: "this is my secret key",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())


//make our facebook strategy

passport.use(new facebookStrategy({
    clientID: "992839188242046",
    clientSecret: "4439b52aa3ec85afb43edb88e3280d2f" ,
    callbackURL: "http://localhost:5000/facebook/callback",
    profileFields: [ "id","displayName","name","gender","picture.type(large)","email"]
},function(token, refreshToken, profile,done){
    process.nextTick(function(){
        User.findOne({ 'uid': profile.id}, function(err, user){
            if(err) return done(err);
            if(user){
                console.log("User found")
                // console.log(user)
                return done(null, user)
            }
            else {
                var newUser = new User();
                newUser.uid = profile.id;
                newUser.token = token;
                newUser.name = profile.name.givenName + " " + profile.name.familyName;
                newUser.email = profile.emails[0].value;
                newUser.gender = profile.gender;
                newUser.pic = profile.photos[0].value;

                newUser.save(function(err){
                    if(err){
                        throw err;
                    }
                    return done(null, newUser)
                })
            }
        })
    })
}))

passport.serializeUser(function(user, done){
    done(null, user.id);
})
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user)
    })
})

app.get("/profile", isLoggedIn, (req, res)=>{
    // console.log(req.user)
    res.render("profile.ejs",{
        user : req.user
    })
})

app.get("/logout", function(req, res){
    res.logout();
    res.redirect("/")
})


function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/")
}

app.get("/auth/facebook",passport.authenticate("facebook",{ scope: "email"}))


app.get("/facebook/callback",passport.authenticate("facebook",{
    successRedirect: "/profile",
    failureRedirect: "/"
}))

app.get("/",(req, res)=>{
    res.render("index.ejs")
})

app.listen(port,()=>{
    console.log("server is running at this port "+ port)
})
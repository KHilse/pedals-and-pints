const router = require("express").Router();
const db = require("../models");
const bcrypt = require("bcryptjs");
const passport = require('../config/passportConfig');

router.get("/signup", (req, res) => {
	res.render("auth/signup");
})

router.post('/signup', (req, res, next) => {
	if (req.body.password !== req.body.passwordverify) {
		req.flash("error", "The passwords don't match!");
		res.redirect("/auth/signup");
	} else {
	    //res.send('POST to signup:', req.body);
	    // Passwords matched, create user if they don't already exist
	    var hashedPassword = bcrypt.hashSync(req.body.password, 10);
	    req.body.password = hashedPassword;
	    db.participant.findOrCreate({
	    	where: { email: req.body.email },
	    	defaults: req.body
	    })
	    .spread((participant, wasCreated) => {
	    	if (wasCreated) {
	    		// Legit new user
	    		passport.authenticate("local", {
					successRedirect: "/",
					successFlash: "Login success",
					failureRedirect: "/auth/login",
					failureFlash: "This should never happen!"
	    		})(req, res, next);
	    	} else {
	    		// Existing user was found, don't let them create a new account
	    		// Make them log in instead
	    		req.flash('error', 'Account already exists, please log in!');
	    		res.redirect('/auth/login');
	    	}
	    })
	    .catch((err) => {
	    	console.log('Error in post-auth signup:', err);
	    	req.flash('error', 'Hey something went wrong with your signup');

	    	// Validation errors
	    	if (err && err.errors) {
		    	err.errors.forEach((e) => {
					if (e.type == 'Validation error') {
						req.flash('error', 'Validation issue: ' + e.message);
					}
		    	})
		    }
			res.redirect('/auth/signup');
	    })
	}
})

router.get("/login", (req, res) => {
	res.render("auth/login");
})

router.post('/login', (req, res, next) => {
	console.log("Login POST route");
	if (!req.body.username || !req.body.password) {
		req.flash("error", "Please enter your username and password");
		res.redirect("/auth/login");
	} else {
	    //res.send('POST to signup:', req.body);
	    // Passwords matched, create user if they don't already exist
	    var hashedPassword = bcrypt.hashSync(req.body.password, 10);
	    req.body.password = hashedPassword;
	    console.log("USERNAME:", req.body.username);
	    console.log("PASSWORD:", req.body.password);
	    db.participant.findOne({
	    	where: { username: req.body.username },
	    	defaults: { password: req.body.password }
	    })
	    .then((participant) => {
	    	console.log("DB password:   ", participant.password);
	    	console.log("Typed password:", hashedPassword);
	    	if (participant) {
	    		passport.authenticate("local", {
					successRedirect: "/",
					successFlash: "Login success",
					failureRedirect: "/auth/login",
					failureFlash: "This should never happen!"
	    		})(req, res, next);
	    	} else {
	    		// Existing user was found, don't let them create a new account
	    		// Make them log in instead
	    		req.flash('error', 'Unknown username or password');
	    		res.redirect('/auth/login');
	    	}
	    })
	    .catch((err) => {
	    	console.log('Error in post-auth login:', err);
	    	req.flash('error', 'Hey something went wrong with your login');
			res.redirect('/auth/login');
	    })
	}
})

router.get("/logout", (req, res) => {
	res.send("LOGOUT stub");
})

router.post("/logout", (req, res) => {
	console.log("LOGOUT POST stub");
	res.send("LOGOUT POST stub");
})

module.exports = router;
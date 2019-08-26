const router = require("express").Router();
const db = require("../models");

router.get("/signup", (req, res) => {
	res.render("auth/signup", { msg: req.body.msg });
})

router.post('/signup', (req, res, next) => {
	if (req.body.password !== req.body.passwordverify) {
		req.flash("error", "The passwords don't match!");
		res.redirect("/auth/signup");
	} else {
	    //res.send('POST to signup:', req.body);
	    // Passwords matched, create user if they don't already exist
	    db.participant.findOrCreate({
	    	where: { email: req.body.email },
	    	defaults: req.body
	    })
	    .spread((participant, wasCreated) => {
	    	if (wasCreated) {
	    		// Legit new user
	    		passport.authenticate("local", {
					successRedirect: "/profile",
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

module.exports = router;
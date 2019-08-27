// Require passport and any needed strategies
const passport = require ("passport");
const localStrategy = require("passport-local").Strategy;
//const bcrypt = require("bcryptjs");

// We will need db access to store profiles
const db = require("../models");

// Provide serialization and de-serialization functions
// for passport to use. This allows passport to store
// user by the id alone (serialize) and look up a user's
// full information from the id (deserialize)

passport.serializeUser((participant, callback) => {
	// callback first arg is error and second arg is data
	// Just sending the user id
	callback(null, participant.id);
})


passport.deserializeUser((id, callback) => {
	// Pass on full user info from id
	db.participant.findByPk(id)
	.then((participant) => {
		callback(null, participant);
	})
	.catch(callback)
})

// Implement the strategies

passport.use(new localStrategy({
		usernameField: "username",
		passwordField: "password"
		}, (typedInUsername, typedInPassword, callback) => {
	// Try looking up our user by username
	console.log("Looking for:", typedInUsername,typedInPassword);
	db.participant.findOne({
		where: { username: typedInUsername }
	})
	.then((foundParticipant) => {
		console.log("got a user", foundParticipant.id, foundParticipant.username);
		// If I didn't find a user matching email (foundUser == null)
		// OR if I did find the user but password is incorrect
		if (!foundParticipant || !(foundParticipant.password === typedInPassword)) {
			// BAD USER, NO DATA FOR YOU
			callback(null, null);
		} else {
			console.log("LOGIN successful");
			callback(null, foundParticipant);
		}
	}) 
	.catch(callback) // End of participant findOne call
}));



module.exports = passport;

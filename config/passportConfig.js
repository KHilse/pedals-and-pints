// Require passport and any needed strategies
const passport = require ("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// We will need db access to store profiles
const db = require("../models");

// Provide serialization and de-serialization functions
// for passport to use. This allows passport to store
// user by the id alone (serialize) and look up a user's
// full information from the id (deserialize)

passport.serializeUser((user, callback) => {
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
		usernameField: "email",
		passwordField: "password"
		}, (typedInEmail, typedInPassword, callback) => {
	// Try looking up our user by email
	console.log("1", typedInEmail,typedInPassword);
	db.participant.findOne({
		where: { email: typedInEmail }
	})
	.then((foundParticipant) => {
		console.log("got a user", foundParticipant.email);
		// If I didn't find a user matching email (foundUser == null)
		// OR if I did find the user but password is incorrect
		// var hashedPassword = bcrypt.hashSync(typedInPassword, 10);
		if (!foundParticipant || !foundParticipant.validPassword(typedInPassword)) {
			// BAD USER, NO DATA
			callback(null, null);
		} else {
			callback(null, foundParticipant);
		}
	}) 
	.catch(callback) // End of user findOne call
}));



module.exports = passport;

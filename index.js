require("dotenv").config();

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.mapboxAccessToken});
const methodOverride = require("method-override");
const express = require("express");
const app = express();
const layouts = require("express-ejs-layouts");
const db = require("./models");
const flash = require('connect-flash');
const passport = require('./config/passportConfig');
const session = require('express-session');
const moment = require("moment");


// MIDDLEWARE
app.set('view engine', 'ejs');
app.use(layouts);
app.use('/', express.static('static'));
app.use(express.urlencoded({ extended: false }));
app.use(session( {
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true

}));
app.use(flash());


// CUSTOM MIDDLEWARE
app.use((req, res, next) => {
	res.locals.alerts = req.flash();
	res.locals.currentUser = req.user; // user is added to req by passport
	res.locals.moment = moment;
	next();
})

// Controllers
app.use('/auth', require('./controllers/auth'));


// HOME ROUTES
app.get("/", (req, res) => {
	res.render("index");
})




app.listen(process.env.PORT || 8000, () => {
	console.log("Listening on port", process.env.PORT);
})

function debugLog(msg, res) {
	console.log(msg);
	res.send(msg);
}
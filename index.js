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
const helmet = require("helmet");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sessionStore = new SequelizeStore({
	db: db.sequelize,
	expiration: 30 * 60 * 1000 // 30 minutes
})


// MIDDLEWARE
app.set('view engine', 'ejs');
app.use(layouts);
app.use(helmet());
app.use('/', express.static('static'));
app.use(express.urlencoded({ extended: false }));
app.use(session( {
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
	store: sessionStore
}));
// Use this line once to set up the store table
sessionStore.sync();
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


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


// LISTENER

app.listen(process.env.PORT || 8000, () => {
	console.log("Listening on port", process.env.PORT);
})

function debugLog(msg, res) {
	console.log(msg);
	res.send(msg);
}
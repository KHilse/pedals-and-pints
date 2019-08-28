require("dotenv").config();
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.mapboxAccessToken});
const methodOverride = require("method-override");
const express = require("express");
const app = express();
const layouts = require("express-ejs-layouts");
const fetch = require("node-fetch");
const db = require("./models");
const flash = require('connect-flash');
const passport = require('./config/passportConfig');
const session = require('express-session');
const moment = require("moment");
// const helmet = require("helmet");
// const SequelizeStore = require("connect-session-sequelize")(session.Store);
// const sessionStore = new SequelizeStore({
// 	db: db.sequelize,
// 	expiration: 30 * 60 * 1000 // 30 minutes
// })


// MIDDLEWARE
app.set('view engine', 'ejs');
app.use(layouts);
//app.use(helmet());
app.use('/', express.static('static'));
app.use(express.urlencoded({ extended: false }));
app.use(session( {
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true//,
//	store: sessionStore
}));
// Use this line once to set up the store table
//sessionStore.sync();
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
app.use('/events', require("./controllers/events"));

// HOME ROUTES
app.get("/", (req, res) => {
	db.event.findAll( {
		order: [["createdAt", "DESC"]],
		limit: 3
	})
	.then(events => {
		res.render("index", { events });
	})
})


app.get("/beertest", (req, res) => {
	var breweryFetchString = "https://api.untappd.com/v4/search/brewery?client_id=" + process.env.untappdClientId + "&client_secret=" + process.env.untappdClientSecret;
	breweryFetchString += "&q=reuben's+brews";
	breweryFetchString = encodeURI(breweryFetchString);
	fetch(breweryFetchString)
	.then(response => {
		return response.json()
	})
	.then(breweryJson => {
		var breweryId = breweryJson.response.brewery.items[0].brewery.brewery_id;
		var beersFetchString = "https://api.untappd.com/v4/brewery/info/" + breweryId + "?client_id=" + process.env.untappdClientId + "&client_secret=" + process.env.untappdClientSecret;
		beersFetchString = encodeURI(beersFetchString);
		fetch(beersFetchString)
		.then(response => {
			return response.json()
		})
		.then(beersJson => {
			var beersList = beersJson.response.brewery.beer_list.items.map(item => {
				return item.beer.beer_name;
			})
			res.send(beersList);
		})
	})
})

// LISTENER

app.listen(process.env.PORT || 8000, () => {
	console.log("Listening on port", process.env.PORT);
})

function debugLog(msg, res) {
	console.log(msg);
	res.send(msg);
}
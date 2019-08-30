const router = require("express").Router();
const db = require("../models");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.mapboxAccessToken});
const fetch = require("node-fetch");


router.get("/", (req, res) => {
	console.log("Looking for events owned by", res.locals.currentUser.id);
	db.event.findAll({
		where: {
			owner_id: res.locals.currentUser.id
		},
		include: [{ model: db.participant }]
	})
	.then(events => {
		console.log(`Found ${events.length} events`);
		res.render("events/index", { events });
	})
	.catch(err => {
		console.log("ERROR finding events for user: ", res.locals.currentUser.id);
		res.redirect("/");
	})
})


router.get("/new", (req, res) => {
	res.render("events/new", {
		currentUser: res.locals.currentUser
	});
})

router.post("/new", (req, res) => {
	// TODO: implement logo uploading
	req.body.logo = null;
	db.event.create(req.body)
	.then(event => {
		console.log("EVENT CREATED");
		db.participant.findOne({
			where: {
				id: res.locals.currentUser.id
			}
		})
		.then(p => {
			event.addParticipant(p)
			res.redirect("show/" + event.id);
		})
	})
	.catch(err => {
		console.log("EVENT CREATION ERROR:", err);
		flash("error", "Failed to create the event!");
		res.redirect("index");
	})
})

router.get("/show/:id", (req, res) => {
	db.event.findOne({
		where: {
			id: req.params.id
		},
		include: [{model: db.participant},
				  {model: db.waypoint}]
	})
	.then(event => {
		db.participant.findAll()
		.then(participants => {
			res.render("events/show", {
				event,
				participants
			});
		})
	})
	.catch(err => {
		console.log("ERROR finding Event by Index:", err);
		res.redirect("/");
	})
})

router.post("/show/:id", (req, res) => {
	db.event.findByPk(req.params.id)
	.then(event => {
		console.log("PARTICIPANT ID", req.body.inviteeId);
		db.participant.findByPk(req.body.inviteeId)
		.then(p => {
			event.addParticipant(p);
			res.redirect("/events/show/" + req.params.id);
		})
		.catch(err => {
			console.log("ERROR in POST events/show/:id adding participant", err);
		})
	})
	.catch(err => {
		console.log("ERROR in POST events/show/:id finding event by Pk", err);
	})
})

router.post("/edit/:id", (req, res) => {
	db.event.findByPk(req.params.id)
	.then(event => {
		var dateBits = req.body.date.split("-");
		var fixedDate = dateBits[1] + "/" + dateBits[2] + "/" + dateBits[0];
		console.log("DATEBITS", dateBits, typeof(dateBits));
		console.log("FIXEDDATE", fixedDate);
		event.update({
			name: req.body.name,
			description: req.body.description,
			date: fixedDate
		})
		.then(() => {
			res.redirect("/events/show/"+req.params.id);
		})
	})
})


router.get("/addparticipants", (req, res) => {
	db.participant.findAll()
	.then(availableParticipants => {
		console.log("AVAILABLE PARTICIPANTS:", availableParticipants.length);
		res.render("events/addparticipants", {
			event_id: req.query.event_id,
			availableParticipants
		})
	})
})

router.post("/addparticipants", (req, res) => {
	console.log("STUB: ADDING PARTICPANTS FROM FORM DATA");
	console.log("req.body.event_id", req.body.event_id);
	console.log("Typeof", typeof req.body.event_id);
	db.event.findOne({
		where: { id: req.body.event_id }
		})
	.then(ev => {
		db.participant.findOne({
			where: { id: req.body.new_participant }
		})
		.then(participant => {
			if (participant) {
				ev.addParticipant(participant)
			}
			res.redirect("addparticipants");
		})
		.catch(err => {
			console.log("Couldn't get participant to add to event");
		})
	})
	.catch(err => {
		console.log("ERROR adding participant from form data", err);
	})
})

router.get("/addwaypoints/:eventId", (req, res) => {
	console.log("ADDWAYPOINTS GET");
	var eventId = req.params.eventId;
	console.log("EVENTID:", eventId);
	db.waypoint.findAll({
		where: { eventId: eventId }
	})
	.then(waypoints => {
		console.log("ADDWAYPOINTS THEN", waypoints.length);
		var markers = [];
		markers = waypoints.map(wp => {
			var markerObj = {
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [wp.long, wp.lat]
					},
				"properties": {
					"title": wp.name,
					"icon": "beer"
					}
			}
			return JSON.stringify(markerObj);
		});
		console.log("MARKERS", markers);
		console.log("EVENTID 2:", eventId);
		res.render("events/addwaypoints", {
			event_id: eventId,
			mapboxAccessToken: process.env.mapboxAccessToken,
			markers
		})
	})
	.catch(err => {
		console.log("ERROR getting all waypoints that match event", req.query.event_id, err);
	})
})

router.post("/addwaypoints", (req, res) => {
	console.log("ADDWAYPOINTS POST route, event_id", req.body.event_id);
	// Get existing waypoints to show on map
	db.waypoint.findAll({
		where: { eventId: req.body.event_id }
	})
	.then(waypoints => {
		var markers = waypoints.map(wp => {
			var markerObj = {
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [wp.long, wp.lat]
					},
				"properties": {
					"title": wp.name,
					"icon": "beer"
					}
			}
			return JSON.stringify(markerObj);
		});

		// Use Untappd to get brewery info for searched brewery name
		var breweryFetchString = "https://api.untappd.com/v4/search/brewery?client_id=" + process.env.untappdClientId + "&client_secret=" + process.env.untappdClientSecret + "&q=";
			breweryFetchString += req.body.waypointName.replace(" ", "+");
			breweryFetchString = encodeURI(breweryFetchString);
		console.log("BREWERYFETCHSTRING:", breweryFetchString);

		var breweryInfo = {};
		fetch(breweryFetchString)
		.then(response => {
			return response.json()
		})
		.then(breweryJson => {
			var untappdId = breweryJson.response.brewery.items[0].brewery.brewery_id
			var beersFetchString = "https://api.untappd.com/v4/brewery/info/" + untappdId + "?client_id=" + process.env.untappdClientId + "&client_secret=" + process.env.untappdClientSecret;
			beersFetchString = encodeURI(beersFetchString);
			console.log("API call to fetch brewery info from ID:", beersFetchString);
			fetch(beersFetchString)
			.then(response => {
				return response.json()
			})
			.then(beersJson => {
				var beersList = beersJson.response.brewery.beer_list.items.map(item => {
					return item.beer.beer_name;
				})

				// Compile aggregated brewery data in an object
				breweryInfo = {
					untappdId: untappdId,
					name: beersJson.response.brewery.brewery_name,
					address: beersJson.response.brewery.location.brewery_address,
					city: beersJson.response.brewery.location.brewery_city,
					state: beersJson.response.brewery.location.brewery_state,
					beersList: beersList
				};
				console.log("BREWERYINFO ***", breweryInfo);
				// Use Mapbox to get the location and store it in the waypoint
				var query = `${breweryInfo.name}, ${breweryInfo.city}`;
				geocodingClient.forwardGeocode({
					query,
					types: ["poi"]
				})
				.send()
				.then((response) => {
					// TODO: send all of the matches instead of just the first one
					// and update searchresults.ejs to match
					console.log("MAPBOX response");

					var match = response.body.features[0];
					breweryInfo.lat = match.center[1];
					breweryInfo.long = match.center[0];



					// This info goes into the form that POSTs to /waypointadd
					res.render("events/addwaypoints", {
						event_id: req.params.event_id,
						breweryInfo,
						markers,
						mapboxAccessToken: process.env.mapboxAccessToken,
						event_id: req.body.event_id,
					})
				})
				.catch(err => {
					console.log("Mapbox Geocode API call failed in addwaypoints POST route", err);
				})
			})
			.catch(err => {
				console.log("Untappd API call (Info) failed in addwaypoints POST route", err);
			})
		})
		.catch(err => {
			console.log("Untappd API call (ID) failed in addwaypoints POST route", err);
		})
	})
})

router.post("/waypointadd", (req, res) => {
	console.log("WAYPOINTADD:", req.body);
	db.waypoint.create({
		name: req.body.breweryName,
		address: req.body.breweryAddress,
		city: req.body.breweryCity,
		state: req.body.breweryState,
		untappd_id: Number(req.body.untappd_id), // TODO: get actual id
		stop_number: 1,
		eventId: Number(req.body.event_id),
		long: Number(req.body.long),
		lat: Number(req.body.lat)
	})
	.then(() => {
		res.redirect("/events/addwaypoints/" + req.body.event_id);
	})
})





module.exports = router;
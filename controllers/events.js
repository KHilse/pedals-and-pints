const router = require("express").Router();
const db = require("../models");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.mapboxAccessToken});


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
	db.event.findByPk(req.params.id)
	.then(event => {
		res.render("events/show", { event });
	})
	.catch(err => {
		console.log("ERROR finding Event by Index:", err);
		res.redirect("index");
	})
})

router.get("/show/:id", (req, res) => {
	db.event.findByPk(id)
	.then(event => {
		res.render("show", {
			event
		})
	})
	.catch(err => {
		console.log("EVENTS/ID/EDIT failed to get event", err);
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

router.get("/addwaypoints", (req, res) => {
	console.log("ADDWAYPOINTS GET");
	db.waypoint.findAll({
		where: { eventId: req.query.event_id }
	})
	.then(waypoints => {
		console.log("ADDWAYPOINTS THEN");
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
		res.render("events/addwaypoints", {
			event_id: req.query.event_id,
			mapboxAccessToken: process.env.mapboxAccessToken,
			markers,
			lat: null,
			long: null,
			name: null,
			address: null,
			city: null,
			state: null
		})
	})
	.catch(err => {
		console.log("ERROR getting all waypoints that match event", req.query.event_id, err);
	})
})

router.post("/addwaypoints", (req, res) => {
	var query = `${req.body.waypointName}, ${req.body.waypointLocation}`;
	geocodingClient.forwardGeocode({
		query,
		types: ["poi"]
	})
	.send()
	.then((response) => {
		// TODO: send all of the matches instead of just the first one
		// and update searchresults.ejs to match
		console.log("ADDING WAYPOINT, MAPBOX response");

		var match = response.body.features[0];
		var lat = match.center[1];
		var long = match.center[0];
		var place = match.place_name.split(",");
		var name = match.text;
		var address = match.properties.address;
		var city = place[place.length-2];
		var state = place[place.length-1];

		res.render("events/addwaypoints", {
			markers: null,
			mapboxAccessToken: process.env.mapboxAccessToken,
			event_id: req.body.event_id,
			lat,
			long,
			address,
			city,
			state,
			name
		})
	})
})

router.post("/waypointsadd", (req, res) => {
	db.waypoint.create({
		name: name,
		untapped_id: 3456, // TODO: get actual id
		stop_number: 1,
		eventId: req.body.event_id,
		long: long,
		lat: lat
	})
	.then(() => {
		res.redirect("/addwaypoints");
	})

})

module.exports = router;
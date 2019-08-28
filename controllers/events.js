const router = require("express").Router();
const db = require("../models");

router.get("/", (req, res) => {
	console.log("Looking for events owned by", res.locals.currentUser.id);
	db.event.findAll({
		where: {
			owner_id: res.locals.currentUser.id
		}
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
		res.redirect("show/" + event.id);
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

router.get("/addparticipants", (req, res) => {
	db.participant.findAll(/*{
		include: [db.event]
	}*/)
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
		})
		.catch(err => {
			console.log("Couldn't get participant to add to event");
		})
	})
	.catch(err => {
		console.log("ERROR adding participant from form data", err);
	})
	res.redirect("addparticipants");
})

router.get("/addwaypoints", (req, res) => {
	res.send("STUB: addwaypoints");
})

router.post("/addwaypoints", (req, res) => {
	console.log("STUB: ADDING PARTICPANTS FROM FORM DATA");
	res.redirect("addwaypoints");
})


module.exports = router;
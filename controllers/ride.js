const router = require("express").Router();
const db = require("../models");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.mapboxAccessToken});


router.post("/", (req, res) => {
	console.log("RIDE ROOT POST route");

	res.redirect("/ride/" + req.body.eventId);
})


router.get("/:eventId", (req, res) => {
	console.log("RIDE INDEX GET route");
	db.event.findOne({
		where: { id : req.params.eventId },
		include: [{ model: db.waypoint }]
		})
	.then(event => {
		res.locals.waypoints = [];
		res.render("ride/ride", {
			event
		});
	})

})



module.exports = router;
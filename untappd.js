require("dotenv").config();


var client_id = process.env.untappdClientId;
var secret = process.env.untappdClientSecret;

//https://api.untappd.com/v4/method_name?client_id=CLIENTID&client_secret=CLIENTSECRET
var fetchString = "https://api.untappd.com/v4/search/brewery?client_id=" + client_id + "&client_secret=" + secret;
	fetchString += "&q=reuben's+brews";

fetch(fetchString)
.then((response) => {
	console.log(response.json());
})
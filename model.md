# Pedals and Pints
### An 'exercise' tracker for folks that like to ride bicycles and drink beer

# MODEL

### user (for auth and bio)

	Relationship: User -<- UserRoute ->- Route

	name:string
	email:string
	profile_pic_url:string
	bodyweight:integer
	password:string

### event (a pedals and pints event)

	Relationship: user -<- userevent ->- event

	name:string


### eventstop

	Relationship: event -<- eventstop

	name:string
	address:string
	city:string
	region:string
	lat:float
	long:float


### drink

	Relationship: userevent -<- drink
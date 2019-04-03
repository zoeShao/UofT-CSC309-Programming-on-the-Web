const log = console.log;
const express = require('express')
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const { ObjectID } = require('mongodb')
const Grid = require('gridfs-stream')
const session = require('express-session')
const hbs = require('hbs')
const multer = require('multer')
const {mongoose, storage} = require('./back-end/db/mongoose')

const {User, Restaurant, Review} = require('./back-end/model')

const conn = mongoose.connection;
let gfs;
conn.once('open', () =>{
    gfs = Grid(conn.db, mongoose.mongo)
    gfs.collection('images');
})
mongoose.set('useFindAndModify', false);
// express
const app = express();
// body-parser middleware setup.  Will parse the JSON and convert to object
app.use(bodyParser.json());
// parse incoming parameters to req.body
app.use(bodyParser.urlencoded({ extended:true }))


// set the view library
app.set('view engine', 'hbs')

const upload = multer({storage})

// static file directory
app.use("/js", express.static(__dirname + '/public/js'))
app.use("/css", express.static(__dirname + '/public/css'))
app.use("/img", express.static(__dirname + '/public/img'))
// Add express sesssion middleware
app.use(session({
	secret: 'oursecret',
	resave: false,
	saveUninitialized: false,
	cookie: {
		expires: 600000000000,
		httpOnly: true
	}
}))

// Add middleware to check for logged-in users
const sessionChecker = (req, res, next) => {
	if (req.session.user) {
		res.redirect('/')
	} else {
		next();
	}
}

//root route
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html')
})

//routes for log in and sign up
app.route('/signUp')
	.get((req, res) => {
		if(req.session.failToSignUp){
			if(req.session.failToSignUp === "duplicatedKeys"){
				req.session.failToSignUp = "";
				res.render('sign_up.hbs', {error: 'Sorry, this username/email is taken.'})
			} else if(req.session.failToSignUp === "notValidInfo"){
				req.session.failToSignUp = "";
				res.render('sign_up.hbs', {error: 'Invalid email/username/password, please check again'})
			} else if(req.session.failToSignUp === "unknownReasons"){
				req.session.failToSignUp = "";
				res.render('sign_up.hbs', {error: 'Sorry, fail to sign up for unknown reasons, please change your info and try again.'})
			}
		} else{
			req.session.failToSignUp = "";
			res.sendFile(__dirname + '/public/sign_up.html')
		}
		
	})


app.route('/login')
	.get(sessionChecker, (req, res) => {
		if(req.session.failToLogin){
			req.session.failToLogin = null;
			res.render('login.hbs', {error: 'Username/Password incorrect'})
		}else{
			req.session.failToLogin = null;
			res.sendFile(__dirname + '/public/login.html')
		}
		
	})

// GET all restaurants
app.get('/restaurants', (req, res) => {
	// Add code here
	Restaurant.find().then((result) => {
		res.send(result)
	}, (error) => {
		res.status(500).send(error) // 400 for bad request
	})
})

// rpute for jump to main account page of restaurant owner
app.route('/myRes')
	.get((req, res) => {
		res.sendFile(__dirname + '/public/restaurant_myRes.html')
	})

app.route('/resReviews')
	.get((req, res) => {
		res.sendFile(__dirname + '/public/restaurant_reviews.html')
	})


// rpute for jump to main account page of restaurant owner
app.route('/individual_account')
	.get((req, res) => {
		res.sendFile(__dirname + '/public/individual_account.html')
	})

// rpute for jump to main account page of restaurant owner
app.route('/individual_favourite')
	.get((req, res) => {
		res.sendFile(__dirname + '/public/individual_favourite.html')
	})

// rpute for jump to main account page of restaurant owner
app.route('/individual_setting')
	.get((req, res) => {
		res.sendFile(__dirname + '/public/individual_setting.html')
	})

app.get('/resReviews/:id', (req, res) =>{
	const id = req.params.id
	req.session.resReviewId = id
	res.redirect('/resReviews')
})


// get log in info by Nav Bar
app.get('/getLogInInfo', (req, res) => {
	if (req.session.user){
		User.findById(req.session.user).then((user) => {
			res.send({"name": user.name, "profileImg": user.profilePicture, "accountType":user.accountType});
		}).catch((error) => {
			log(error)
			res.redirect('/login')
		})
	} else{
		log("signed out status")
		//respond with no content, implying the user hasn't logged in
		res.status(204).send();
	}
})

app.post('/users/login', function(req, res){

    const name = req.body.name;
		const password = req.body.password;
		
		if(req.session.user){
			log("already logged in")
			res.redirect('/');
		}else{
			User.findByNamePassword(name, password).then((user) => {
				if(!user) {
					console.log("password not correct")
					console.log(name);
					console.log(password);
					req.session.failToLogin = true;
					res.redirect('/login')
				} else {
					// Add the user to the session cookie that we will
					// send to the client
					console.log("password correct")
					req.session.user = user._id;
					req.session.name = user.name
					req.session.accountType = user.accountType;
					log(req.session.accountType)
					if(req.session.accountType === 'o'){
						res.redirect('/myRes');
					} else if (req.session.accountType === 'a'){
						res.redirect('/adminBanUsers');
					} else if (req.session.accountType === 'u'){
						res.redirect('/');
					}else{
						res.status(400).send();
					}
					
				}
			}).catch((error) => {
				log(error)
				res.status(400).redirect('/login')
			})
		}
})

app.post('/users/signUp', (req, res) => {

	const saveUser = new User({
	name: req.body.name,
	password: req.body.password,
	email: req.body.email,
	accountType: req.body.type
})
	saveUser.save().then((user) => {
		req.session.user = user._id;
		req.session.name = user.name;
		res.redirect('/');
	}
).catch((error) => {
	//duplicate key error
	if(error.code == 11000 && error.name == "MongoError"){
		req.session.failToSignUp = "duplicatedKeys";
	} else if(error.errors.password || error.errors.email){
		req.session.failToSignUp = "notValidInfo";
	} else{
		//should not happen
		req.session.failToSignUp = "unknownReasons";
	}
	log(req.session.failToSignUp)
	res.redirect('/signUp');
})
})


app.get('/users/logout', (req, res) => {
	req.session.destroy((error) => {
		if (error) {
			res.status(500).send(error)
		} else {
			res.redirect('/')
		}
	})
})

app.post('/popularRestaurants', (req, res) =>{
	const location = req.body.location;

	Restaurant.find({location: location}).sort({rate: 1}).then((result) =>{
		res.send(result);
	}).catch((error) => res.status(400).send(error))

})

const authenticate = (req, res, next) =>{
	if(req.session.user){
		User.findById(req.session.user).then((user) =>{
			if((!user) || user.banned){
				return Promise.reject()
			}else{
				req.user = user
				next()
			}
		})
	}
	else{
		res.status(400).redirect('/login')
	}
}

//post for create new restaurant
app.post('/addRestaurants', [authenticate, upload.single('resImg')], (req, res) =>{
	const restaurant = new Restaurant({
		owner: req.user._id,
		picture: req.file.filename,
		name: req.body.name,
		phone: req.body.phone,
		address: req.body.address,
		location: req.body.location,
		category: req.body.category
	})
	restaurant.save().then((result) =>{
		res.send(result)
	},(error) =>{
		res.status(400).send(error)
	})
})

//add the restaurant to the user's favourites
app.post('/addMyfavourites/:id', authenticate, (req, res) =>{
	const id = req.params.id

	if (!ObjectID.isValid(id)) {
		res.status(404).send()
	}
	
	// $new: true gives back the new document
	User.findByIdAndUpdate(req.user._id, {$push: {favourites: id}}, {new: true}).then((user) => {
		if (!user) {
			res.status(404).send()
		} else {
			res.send({restaurant: id, user: user})
		}
	}).catch((error) => {
		res.status(400).send(error)
	})
})

//get all favourite restaurants for this user's id
app.get('/getMyfavourites', authenticate, (req, res) =>{
	User.findById(req.user._id).then((user) => {
		if (!user) {
			res.status(404).send()
		} else {
			/// sometimes wrap returned object in another object
			Restaurant.find({_id: req.user.favourites}).sort({_id: -1}).then((restaurants) => {
				res.send({restaurants})
			},(error) =>{
				res.status(450).send(error)
			})   
		}
	}).catch((error) => {
		res.status(400).send()
	})
})


//get all restaurants for this user's id
app.get('/getMyRestaurants', authenticate, (req, res) =>{
	Restaurant.find({owner: req.user._id}).sort({_id: -1}).then((restaurants) => {
		res.send({restaurants})
	},(error) =>{
		res.status(450).send(error)
	})
})

//read one image by name
app.get('/readImg/:filename', (req, res) =>{
	gfs.files.findOne({filename: req.params.filename}, (err, file) =>{
		if( !file || file.length === 0 ){
			res.status(404).send()
		}
		const readstream = gfs.createReadStream(file.filename)
		readstream.pipe(res)
	})
})

//delete one restaurant by id and also delete it's picture and reviews
app.delete('/removeRes/:id', authenticate, (req, res) =>{
	const id = req.params.id
	if(!ObjectID.isValid(id)){
		log('object id')
		return res.status(404).send()
	}
	Restaurant.findOneAndDelete({_id: id}).then((restaurant) =>{
			if(!restaurant){
				log('null restaurant')
				res.status(404).send()
			}
			else{
				gfs.remove({filename: restaurant.picture, root: 'images'}, (err, GridFSBucket) =>{
					if(err){
						res.status(404).send()
					}else{
						Review.remove({resID: id}).then((result) =>{
							res.send(result)
						}, (error) =>{
							res.status(400).send(error)
						})
					}
				})
			}
	}, (error) =>{
		res.status(400).send(error)
	})
})

app.patch('/editRes/:id', [authenticate, upload.single('resImg')], (req, res) =>{
	const id = req.params.id
	if(!ObjectID.isValid(id)){
		return res.status(404).send()
	}
	if(req.file){
		Restaurant.findOneAndUpdate({_id: id}, {$set: {
			picture: req.file.filename,
			name: req.body.name,
			phone: req.body.phone,
			address: req.body.address,
			location: req.body.location,
			category: req.body.category
		}}).then((restaurant) =>{
			if(!restaurant){
				res.status(404).send()
			}
			else{
				gfs.remove({filename: restaurant.picture, root: 'images'}, (err, GridFSBucket) =>{
					if(err){
						res.status(404).send(err)
					}else{
						res.send()
					}
				})
			}
		})
	}
	else{
		Restaurant.findOneAndUpdate({_id: id}, {$set: {
			name: req.body.name,
			phone: req.body.phone,
			address: req.body.address,
			location: req.body.location,
			category: req.body.category
		}}).then((restaurant) =>{
			if(!restaurant){
				res.status(404).send();
			}
			else{
				res.send();
			}
		})
	}
})

app.get('/getResReview', (req, res) =>{
	const id = req.session.resReviewId
	req.session.resReviewId = null
	if(!ObjectID.isValid(id)){
		return res.status(404).send()
	}
	Review.find({resID: id}).sort({_id: -1}).then((reviews) =>{
		res.send({reviews})
	}, (error) =>{
		res.status(450).send(error)
	})
})

// add a new review to a retaurant
app.post('/addReview/:resId', authenticate, (req, res) =>{
	const review = new Review({
		resID: req.params.resId,
		userID: req.user._id,
		userName: req.user.name,
		rate: req.body.rate,
		price: req.body.price,
		content: req.body.content
	})
	review.save().then((result) =>{
		const ObjectId = mongoose.Types.ObjectId
		Review.aggregate([
			{ $match: {"resID": ObjectId(req.params.resId)}},
			{$group: {
				_id: null, 
				rate: {$avg: "$rate"}, 
				price: {$avg: "$price"}}}]).then((average) =>{
					const aveRate = average[0].rate
					const avePrice = average[0].price
					Restaurant.findOneAndUpdate({id: req.params.resId},
						{$set: {
							rate: aveRate,
							price: avePrice
						}}).then((update) =>{
							res.send(result)
						})
				}, (error) =>{
					res.status(400).send(error);
				})
	})
})

//Codes for search result
//search type can only be: "resName", "location", "category"
app.post('/searchRestaurants', (req, res) => { 
	const content = req.body.content;
	const searchType = req.body.searchType;
	const from = req.body.from;
	log("content: "+ content);
	log("search type: "+ searchType);
	log("from: "+ from);
	if(searchType == "resName"){
		Restaurant.find({name: content.trim()}).then((result) =>
		{
			req.session.searchingRes = result;
			//promise has delay, so we can only put this comment code here
			if(from == "search_page"){
				res.send({res: req.session.searchingRes});
				//delete session after using it
				req.session.searchingRes = null;
				req.session.from = null;
			} else{
				res.redirect('/openSearchResult');
			}
		}).catch((error) => res.status(400).send(error))
	} else if(searchType == "location"){
		Restaurant.find({location: content.trim()}).then((result) =>
		{
			req.session.searchingRes = result;
			if(from == "search_page"){
				res.send({res: req.session.searchingRes});
				req.session.searchingRes = null;
				req.session.from = null;
			} else{
				res.redirect('/openSearchResult');
			}
		}).catch((error) => res.status(400).send(error))
	}else if(searchType == "category"){
		Restaurant.find({category: content.trim()}).then((result) =>
		{
			log("result" + result);
			req.session.searchingRes = result;
			if(from == "search_page"){
				res.send({res: req.session.searchingRes});
				req.session.searchingRes = null;
				req.session.from = null;
			} else{
				res.redirect('/openSearchResult');
			}
		}).catch((error) => res.status(400).send(error))
	} else{
		res.status(400).send("invalid search type!");
	}
	
})

app.get('/openSearchResult', (req, res) => {
	// check if we have active session cookie
		log("before redirect");
		res.sendFile(__dirname + '/public/restaurants_search_result.html')
})

app.get('/getRestaurants', (req, res) => {
	log("Searching res session: "+ req.session.searchingRes)
	if(req.session.searchingRes){
		res.send({res: req.session.searchingRes});
		req.session.searchingRes = null;
	}
})

/*       codes for admin page   */
app.route('/adminBanUsers')
	.get((req, res) => {
		//TODO
		// if(req.session.accountType == 'a'){
			res.sendFile(__dirname + '/public/individual_account_adminView_banUser.html')
		// } else{
		// 	res.status(400).send("Normal users are not authorized to go to admin page")
		// }
		
	})

app.route('/adminRestaurants')
	.get((req, res) => {
		//TODO
		// if(req.session.accountType == 'a'){
			res.sendFile(__dirname + '/public/individual_account_adminView_restaurants.html')
		// } else{
		// 	res.status(400).send("Normal users are not authorized to go to admin page")
		// }
		
	})

app.post('/admin/removeRes', (req, res) => {
	const rest = req.body.restaurantToDelete;

	Restaurant.findOneAndDelete({_id: rest._id}).then((result) => {
		res.send();
	}).catch(error => {
		res.status(400).send(error);
	})
})

app.get('/admin/getAllUsers', (req, res) => {
	User.find({accountType: {$not: {$eq: 'a'}}}).then((result) => {
		res.send(result);
	}).catch(error => res.status(400).send(error));
})

app.get('/admin/getAllRestaurants', (req, res) => {
	Restaurant.find().then((result) => {
		res.send(result);
	}).catch(error => res.status(400).send(error));
})

app.post('/admin/banOrRecoverUser', (req, res) => {
	const user = req.body.userToModify;
	
	User.findByIdAndUpdate(user._id, 
		{ $set: {
		banned: !user.banned
	}}, {new: true}
		).then((result) => {
		res.send()
	}).catch(error => {log(error)});
})
app.listen(port, () => {
	console.log(`Listening on port ${port}...`)
}) 
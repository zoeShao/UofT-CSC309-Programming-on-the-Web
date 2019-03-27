const mongoose = require('mongoose');
// const uniqueVali = require('mongoose-unique-validator');
const validator = require('validator')

const bcrypt = require('bcryptjs'),
    SALT_WORK_FACTOR = 10;
const userSchema = new mongoose.Schema({
    profilePicture: {
        type: String,
        default: ""
    },
    name: {
        type: String, 
        unique: true,
        required: true,
        minlength: 1,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: validator.isEmail,
            message:'Not a valid email address'
        }
    },
    accountType: {
        type: String,
        required: true
    },
    banned: {
        type: Boolean,
        default: false
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }], 
    favourites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    }],
    restaurants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    }]
}); 

const resSchema = new mongoose.Schema({
    picture: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      minlength: 1,
      trim: true
    }, 
    phone: {
      type: String,
      required: true,
      minlength: 10,
      trim: true
    }, 
    address: {
      type: String,
      unique: true,
      required: true,
      minlength: 1,
      trim: true
    }, 
    rate: {
      type: Number,
      required: false,
      default: 0
    },
    price: {
      type: Number,
      required: false,
      default: 0
    },
    location: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    reviews: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Revies'
    }]
  });

  const reviewSchema = new mongoose.Schema({
    resID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    }, 
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, 
    rate: {
        type: Number,
        required: false,
        default: 0
    },
    price: {
        type: Number,
        required: false,
        default: 0
    },
    content: {
        type: String,
        required: true,
        minLength: 1
    }
  });
//run before save
userSchema.pre('save', function(next) {
	const user = this

	if (user.isModified('password')) {
		bcrypt.genSalt(10, (error, salt) => {
			bcrypt.hash(user.password, salt, (error, hash) => {
				user.password = hash
				next()
			})
		})
	} else {
		next();
	}

})

// Our own student finding function 
userSchema.statics.findByNamePassword = function(name, password) {
	const User = this

	return User.findOne({name: name}).then((user) => {
		if (!user) {
			return Promise.reject()
		}

		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (error, result) => {
				if (result) {
					resolve(user);
				} else {
					reject();
				}
			})
		})
	})
}


// userSchema.methods.comparePassword = function(candidatePassword, cb) {
//     bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
//         if (err) return cb(err);
//         cb(null, isMatch);
//     });
// };

const User = mongoose.model('User', userSchema);
const Restaurant = mongoose.model('Restaurant', resSchema);
const Review = mongoose.model('Reviews', reviewSchema);

module.exports = {User, Restaurant, Review}

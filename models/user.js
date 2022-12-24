const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },
    // FOR RESET PASSWORD
    resetToken: String,
    expireToken: Date,

    pic: {
        type: String,
        // default pic if user not upload profile pic
        default: "https://res.cloudinary.com/imagecloud007/image/upload/v1637343424/depositphotos_119659092-stock-illustration-male-avatar-profile-picture-vector_onhx9o.jpg"
    },

    followers: [{
        type: ObjectId,
        ref: "User"
    }],

    following: [{
        type: ObjectId,
        ref: "User"
    }]
})


// to bcrypt password
userSchema.pre("save", async function (next) {

    if (this.isModified("password")) {

        this.password = await bcrypt.hash(this.password, 12);

        // to not show in database
        // this.reEnterPassword = undefined;
    }
    next();
})



// create model/collection
const User = new mongoose.model("User", userSchema)

module.exports = User;
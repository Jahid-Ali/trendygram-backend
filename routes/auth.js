const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

//secure
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const SENDGRID_API = process.env.SENDGRID_API;
const EMAIL = process.env.EMAIL;

// GENERATE SECURE TOKEN FOR RESET PASSWORD
const crypto = require("crypto");

//SEND MAIL CODE ****************************************************/
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: SENDGRID_API
    }
}))
/*********************************************************************/


// SIGN-UP
router.post("/signup", (req, res) => {
    const { name, email, password, pic } = req.body

    if (!email || !password || !name) {
        return res.status(422).json({ error: "please fill all the fields" })
    }
    else {
        // check email is already registered or not
        User.findOne({ email: email }, (err, already) => {
            if (already) {
                return res.status(422).json({ error: "email already register" })
            } else {

                // data enter in collection
                const user = new User({
                    name: name,
                    email: email,
                    password: password,
                    pic: pic
                })

                // save in data base
                user.save(err => {
                    if (err) {
                        console.log("save time error", err);
                    } else {
                        // THIS IS FOR SEND SUCCESS MAIL 
                        transporter.sendMail({
                            to: user.email,
                            from: "jahidali786qwerty@gmail.com",
                            subject: "signup-success",
                            html: "<h1>Welcome To TrendyGram</h1>"
                        })
                        // SEND DATA IN FRONTEND
                        res.json({ message: "Successfully Registered 😄" })
                    }
                })
            }
        })
    }
})


// SIGN-IN
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(422).json({ error: "please fill all the fields" })
        }

        // check email is registered or not
        const matchData = await User.findOne({ email: email });

        if (matchData) {

            // bcrypt password ko compare kr rhe h
            const isMatch = await bcrypt.compare(password, matchData.password);

            if (isMatch) {
                //  res.json({ message: "Login Successfull" })
                const token = jwt.sign({ _id: matchData._id }, JWT_SECRET)

                const { _id, name, email, followers, following, pic } = matchData;
                res.json({ token: token, user: { _id, name, email, followers, following, pic } })

            } else {
                return res.status(422).json({ error: "Email/Password combination is not valid" })
            }
        } else {
            return res.status(422).json({ error: "Email/Password combination is not valid" })
        }
    } catch (error) {
        console.log(error);
    }
})



// RESET PASSWORD
router.post('/reset-password', (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
        }
        // EVERYTHING CORRECT WE GET TOKEN AND CONVERT HEXA INTO STRING
        const token = buffer.toString("hex")
        // FIND USER WITH EMAIL 
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    return res.status(422).json({ error: "User dont exists with that email" })
                }
                // SET DATA IN DATABASE
                user.resetToken = token

                // 3600000 ms is 1 hour 
                user.expireToken = Date.now() + 3600000

                // save in data base
                user.save().then((result) => {
                    transporter.sendMail({
                        to: user.email,
                        from: "jahidali786qwerty@gmail.com",
                        subject: "password reset",
                        html: `
                    <p>You requested for password reset</p>
                    <h5>click in this <a href="${EMAIL}/reset/${token}">link</a> to reset password</h5>
                    `
                    })
                    res.json({ message: "check your email" })
                })

            })
    })
})


// CREATE NEW PASSWORD AND SAVE IT IN DATABASE
router.post('/new-password', (req, res) => {
    const newPassword = req.body.password
    const sentToken = req.body.token

    // TO CHECK RESETTOKEN AND EXPIRETOKEN
    User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                return res.status(422).json({ error: "Try again session expired" })
            }
            else {
                user.password = newPassword
                user.resetToken = undefined
                user.expireToken = undefined

                // SAVED
                user.save().then((saveduser) => {
                    res.json({ message: "password updated successfully" })
                })
            }

        }).catch(err => {
            console.log(err)
        })
})


module.exports = router;
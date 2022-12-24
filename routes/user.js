const express = require('express');
const router = express.Router();

const requireLogin = require("../middleware/requireLogin");
const User = require("../models/user");
const Post = require("../models/post");
const { json } = require('express');


//TO GET OTHER USER 
router.get('/user/:id', requireLogin, (req, res) => {
    // TO FIND USER BY ID
    User.findOne({ _id: req.params.id })
        .select("-password")
        .then(user => {
            // TO FIND POST OF USER BY ID
            Post.find({ postedBy: req.params.id })
                .populate("postedBy", "_id name")
                .exec((err, posts) => {
                    if (err) {
                        return res.status(422).json({ error: err })
                    }
                    res.json({ user, posts })
                })
        }).catch(err => {
            return res.status(404).json({ error: "User not found" })
        })
})

//TO FOLLOW
router.put("/follow", requireLogin, (req, res) => {
    // THIS IS FOR UPDATE FOLLOWERS
    User.findByIdAndUpdate(req.body.followId, {
        $push: { followers: req.user._id }
    }, {
        new: true    //mogodb return updated record if not write show old record
    }).exec((err, result) => {
        if (err) {
            return res.status(422).json({ error: err })
        }

        // IF NO ERROR THAN WE UPDATE FOLLOWING WHO FOLLOW OTHER
        User.findByIdAndUpdate(req.user._id, {
            $push: { following: req.body.followId }
        }, {
            new: true
        }).select("-password")
            .then(result => {
                res.json(result)
            }).catch(err => {
                return res.status(422).json({ error: err })
            })
    })
})


//TO UN-FOLLOW
router.put("/unfollow", requireLogin, (req, res) => {
    // THIS IS FOR UPDATE FOLLOWERS
    User.findByIdAndUpdate(req.body.unfollowId, {
        $pull: { followers: req.user._id }
    }, {
        new: true    //mogodb return updated record if not write show old record
    }).exec((err, result) => {
        if (err) {
            return res.status(422).json({ error: err })
        }

        // IF NO ERROR THAN WE UPDATE FOLLOWING WHO FOLLOW OTHER
        User.findByIdAndUpdate(req.user._id, {
            $pull: { following: req.body.unfollowId }
        }, {
            new: true
        }).select("-password")
            .then(result => {
                res.json(result)
            }).catch(err => {
                return res.status(422).json({ error: err })
            })
    })
})


// TO UPDATE IMAGE
router.put("/updatepic", requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.user._id, { $set: { pic: req.body.pic } }, { new: true },
        (err, result) => {
            if (err) {
                return res.status(422).json({ error: "pic canot post" })
            }
            res.json(result)
        })
})


// SEARCH CODE
router.post('/search-users', (req, res) => {
    let userPattern = new RegExp("^" + req.body.query)
    User.find({ email: { $regex: userPattern } })
        .select("_id email")
        .then(user => {
            res.json({ user: user })
        }).catch(err => {
            console.log(err)
        })
})


module.exports = router;
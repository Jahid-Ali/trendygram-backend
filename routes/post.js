const express = require('express');
const router = express.Router();

const requireLogin = require("../middleware/requireLogin");

const Post = require("../models/post");


// TO  POST OF PICTURE
router.post('/createpost', requireLogin, (req, res) => {
    const { title, body, pic } = req.body
    if (!title || !body || !pic) {
        return res.status(422).json({ error: "Plase add all the fields" })
    }
    req.user.password = undefined
    const post = new Post({
        title: title,
        body: body,
        photo: pic,
        postedBy: req.user
    })

    post.save().then(result => {
        res.json({ post: result })
    })
        .catch(err => {
            console.log(err)
        })
})


// TO GET ALL POST OF THE USER FROM DATA BASE
router.get("/allpost", requireLogin, (req, res) => {
    Post.find()
        .populate("postedBy", "_id name")
        // so that after refresh who post comment show
        .populate("comments.postedBy", "_id name")
        // SHOWING LATEST POST ON TOP
        .sort('-createdAt')
        .then((posts) => {
            res.json({ posts: posts })
        })
        .catch((err) => {
            console.log(err);
        })
})


// TO GET ALL FOLLOWING USER FROM DATA BASE
router.get("/getsubpost", requireLogin, (req, res) => {
    // IF POSTEDBY IN FOLLOWING
    Post.find({ $or: [{ postedBy: { $in: req.user.following } }, { postedBy: req.user._id }] })
        .populate("postedBy", "_id name")
        // so that after refresh who post comment show
        .populate("comments.postedBy", "_id name")
        // SHOWING LATEST POST ON TOP
        .sort('-createdAt')
        .then((posts) => {
            res.json({ posts: posts })
        })
        .catch((err) => {
            console.log(err);
        })
})


// TO GET POST OF SIGNIN USER IN PROFILE PAGE
router.get("/mypost", requireLogin, (req, res) => {
    Post.find({ postedBy: req.user._id })
        .populate("postedBy", "_id name")
        .then((mypost) => {
            res.json({ mypost: mypost })
        })
        .catch((err) => {
            console.log(err);
        })
})


// FOR LIKES
router.put('/like', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { likes: req.user._id }
    }, {
        new: true            //mogodb return updated record if not write show old record
    }).populate("postedBy", "_id name")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
})


// FOR UNLIKES
router.put('/unlike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: { likes: req.user._id }
    }, {
        new: true      //mogodb return updated record if not write show old record
    }).populate("postedBy", "_id name")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
})


// FOR COMMENT
router.put('/comment', requireLogin, (req, res) => {

    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }

    Post.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment }
    }, {
        new: true
    })
        .populate("comments.postedBy", "_id name")
        .populate("postedBy", "_id name")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
})


// FOR DELETE POST
router.delete('/deletepost/:postId', requireLogin, (req, res) => {
    Post.findOne({ _id: req.params.postId })
        .populate("postedBy", "_id")
        .exec((err, post) => {
            if (err || !post) {
                return res.status(422).json({ error: err })
            }
            // check user id === post user id
            if (post.postedBy._id.toString() === req.user._id.toString()) {
                post.remove()
                    .then(result => {
                        res.json({ result })
                    }).catch(err => {
                        console.log(err)
                    })
            }
        })
})


//TO GET COMMENT IN OTHER PAGE 
router.get('/comm/:id', requireLogin, (req, res) => {
    Post.find()
        .populate("postedBy", "_id name")
        // so that after refresh who post comment show
        .populate("comments.postedBy", "_id name")
        .then((posts) => {
            res.json({ posts: posts })
        })
        .catch((err) => {
            console.log(err);
        })
})


module.exports = router;
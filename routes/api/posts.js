const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const Post = require('../../models/Post');
const ValidatePostInput = require('../../validation/post');
router.get('/test', (req, res) => res.json({ msg: "Posts Works" }));

// @route Get api/posts
// @desc Get posts
// @access Public
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = ValidatePostInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });
    newPost.save().then(post => res.json(post));
}
);

// @route Get api/posts
// @desc Get posts
// @access Public
router.get('/', (req, res) => {
    Post.find().sort({ date: -1 })
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({ nopostsfound: 'No posts found' }));
});

// @route Get api/posts/:id
// @desc Get posts by id
// @access Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(posts => { res.json(posts) })
        .catch(err => res.status(404).json({ nopostsfound: 'No post found with that id' }));
});

// @route Delete api/posts/:id
// @desc Delete posts by id
// @access Private

router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findById(req.params.id)
       .then(post => {
            // Check for post owner
            if (post.user.toString()!== req.user.id) {
                return res.status(401).json({ notauthorized: 'User not authorized' });
            }
            post.remove().then(() => res.json({ success: true }));
        })
       .catch(err => res.status(404).json({ postnotfound: 'No post found with that id' ,err: err }));
});
module.exports = router;
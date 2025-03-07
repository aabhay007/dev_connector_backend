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

// @route Put api/posts/:id
// @desc Update posts by id
// @access Private
router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = ValidatePostInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
        .then(post => {
            // Check for post owner
            if (post.user.toString() !== req.user.id) {
                return res.status(401).json({ notauthorized: 'User not authorized' });
            }
            post.text = req.body.text;
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found with that id' }));
});
// @route Post api/posts/like/:id
// @desc Like post
// @access Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                return res.status(400).json({ alreadyliked: 'User already liked this post' });
            }
            post.likes.unshift({ user: req.user.id });
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found with that id' }));
});
// @route Post api/posts/unlike/:id
// @desc Unlike post
// @access Private

router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                return res.status(400).json({ notliked: 'You have not yet liked this post' });
            }
            const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id);
            post.likes.splice(removeIndex, 1);
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found with that id' }));
});
// @route Post api/posts/comment/:id
// @desc Comment on post
// @access Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = ValidatePostInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            }
            post.comments.unshift(newComment);
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found with that id' }));
});
// @route Delete api/posts/comment/:id/:comment_id
// @desc Delete comment
// @access Private

router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findById(req.params.id)
       .then(post => {
            // Check for comment owner
            if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                return res.status(401).json({ notauthorized: 'User not authorized to delete this comment' });
            }
            const removeIndex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id);
            post.comments.splice(removeIndex, 1);
            post.save().then(post => res.json(post));
        })
       .catch(err => res.status(404).json({ postnotfound: 'No post found with that id' }));
});
module.exports = router;
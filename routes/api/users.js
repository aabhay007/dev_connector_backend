const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

//Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
router.get('/test', (req, res) => res.json({ msg: "User Works" }));

router.post('/register', (req, res) => {
    try{

        // const {errors,isvalid} =validateRegisterInput(req.body);
        // //check validation
        // if(!isvalid){
        //     return res.status(400).json(errors);
        // }
        User.findOne({ email: req.body.email }).then(user => {
            if (user) {
                return res.status(400).json({ email: "Email already exists" })
            }
            else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200',
                    r: 'pg',
                    d: 'mm'
                });
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    avatar
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save().then(user => {
                            res.json(user).
                                catch(err => console.log(err));
                        })
                    }
                    )
                })
            }
        })
    }
    catch(err){
        console.log(err);
        res.json(err);
    }
});

//@route Get api/users/login
//@desc Login user and return JWT token
//@access Public
router.post('/login', (req, res) => {

     const {errors,isvalid} =validateLoginInput(req.body);
    // //check validation
    // if(!isvalid){
    //     return res.status(400).json(errors);
    // }
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email }).then(user => {
        if (!user) {
            errors.email="User not found"
            return res.status(404).json( errors );
        }
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                const payload = {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar
                }
                jwt.sign(payload, keys.secretKey, { expiresIn: 3600 }, (err, token) => {
                    res.json({
                        success: true,
                        token: 'Bearer ' + token
                    })
                })
            }
            else {
                errors.password="Password incorrect"
                return res.status(400).json({ password: "Password incorrect" });
            }
        })
            .catch(err => console.log(err));
    })
});

//@route Get api/users/current
//@desc Return current user
//@access Private
router.get('/current', passport.authenticate('jwt',{session:false}), (req,res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
    });
})

module.exports = router;
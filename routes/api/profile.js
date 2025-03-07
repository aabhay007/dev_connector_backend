const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');


//load profile model
const Profile= require('../../models/Profile');
const User= require('../../models/User');
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
router.get('/test',(req,res)=>res.json({msg:"Profile Works"}));


//@route Get api/profile/handle/:handle
//@desc Get profile by handle
//@access Public
router.get('/handle/:handle',async (req,res)=>{
    const errors={};
    try{
        const profile=await Profile.findOne({handle:req.params.handle}).populate('user',['name','avatar']);
        if(!profile){
            errors.noprofile="There is no profile for this user";
            res.status(404).json(errors);
        }   
        res.json(profile);
    }
    catch(err){
        res.status(404).json(err);
    }
});
//@route Get api/profile/user/:user_id
//@desc Get profile by user ID
//@access Public
router.get('/user/:user_id',async (req,res)=>{
    const errors={};
    try{
        const profile=await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
        if(!profile){
            errors.noprofile="There is no profile for this user";
            res.status(404).json(errors);
        }
        res.json(profile);
    }
    catch(err){
        res.status(404).json({profile:"There is no profile for this user"});
    }
});
//@route Get api/profile/all
//@desc Get all profiles
//@access Public
router.get('/all',async (req,res)=>{
    const errors={};
    try{
        const profiles=await Profile.find().populate('user',['name','avatar']);
        if(!profiles){
            errors.noprofile="There are no profiles";
            res.status(404).json(errors);
        }
        res.json(profiles);
    }
    catch(err){
        res.status(404).json({profile:"There are no profiles"});
    }
});

//@route Get api/profile
//@desc Get current users profile
//@access Public

router.get('/',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const errors={};
    Profile.findOne({user:req.user.id})
   .populate('user', ['name','avatar'])
   .then(profile=>{
        if(!profile){
            errors.noprofile="No profile found";
            return res.status(404).json(errors);
        }
        res.json(profile);
    })
   .catch(err=>res.status(404).json(err));
});

//@route Post api/profile
//@desc Create or edit user profile
//@access Public
router.post('/',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const {errors,isValid}=validateProfileInput(req.body);
    //check validation
    if(!isValid){
        return res.status(400).json(errors);
    }
    //Get fields
    const profileFields={};
    profileFields.user=req.user.id;
    if(req.body.handle) profileFields.handle=req.body.handle;
    if(req.body.company) profileFields.company=req.body.company;

    if(req.body.website) profileFields.website=req.body.website;
    if(req.body.location) profileFields.location=req.body.location;

    if(req.body.bio) profileFields.bio=req.body.bio;
    if(req.body.status) profileFields.status=req.body.status;
    if(req.body.githubusername) profileFields.githubusername=req.body.githubusername;
    //skills - split into array
    if(typeof req.body.skills !== 'undefined'){
        profileFields.skills=req.body.skills.split(',');
    }
    //social
    profileFields.social={};
    if(req.body.youtube) profileFields.social.youtube=req.body.youtube;
    if(req.body.twitter) profileFields.social.twitter=req.body.twitter;
    if(req.body.facebook) profileFields.social.facebook=req.body.facebook;
    if(req.body.linkedin) profileFields.social.linkedin=req.body.linkedin;
    if(req.body.instagram) profileFields.social.instagram=req.body.instagram;
    //check if handle exists
    Profile.findOne({handle:profileFields.handle})
    .then(profile=>{
        if(profile){
            errors.handle="That handle already exists";
            res.status(400).json(errors);
        }
        //save profile
        new Profile(profileFields).save().then(profile=>res.json(profile));
    });
}
);
//@route Post api/profile/experience
//@desc Add experience to profile
//@access Private
router.post('/experience',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const {errors,isValid}=validateExperienceInput(req.body);
    //check validation
    if(!isValid){
        return res.status(400).json(errors);
    }
    Profile.findOne({user:req.user.id})
    .then(profile=>{
        const newExp={
            title:req.body.title,
            company:req.body.company,
            location:req.body.location,
            from:req.body.from,
            to:req.body.to,
            current:req.body.current,
            description:req.body.description
        };
        //add to experience array
        profile.experience.unshift(newExp);
        profile.save().then(profile=>res.json(profile));
    });
});
//@route Post api/profile/education
//@desc Add education to profile
//@access Private
router.post('/education',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id})
   .then(profile=>{
        const newEdu={
            school:req.body.school,
            degree:req.body.degree,
            fieldofstudy:req.body.fieldofstudy,
            from:req.body.from,
            to:req.body.to,
            current:req.body.current,
            description:req.body.description
        };
        //add to education array
        profile.education.unshift(newEdu);
        profile.save().then(profile=>res.json(profile));
    });
});

//@route DELETE api/profile/experience/:exp_id
//@desc Delete experience from profile
//@access Private

router.delete('/experience/:exp_id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id})
   .then(profile=>{
        //get remove index
        const removeIndex=profile.experience
        .map(item=>item.id)
        .indexOf(req.params.exp_id);
        //splice out of array
        profile.experience.splice(removeIndex,1);
        //save
        profile.save().then(profile=>res.json(profile));
    })
    .catch(err=>res.status(404).json(err)); 
});
//@route DELETE api/profile/education/:edu_id
//@desc Delete education from profile
//@access Private

router.delete('/education/:edu_id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id})
   .then(profile=>{
        //get remove index
        const removeIndex=profile.education
        .map(item=>item.id)
        .indexOf(req.params.edu_id);
        //splice out of array
        profile.education.splice(removeIndex,1);
        //save
        profile.save().then(profile=>res.json(profile));
    })
   .catch(err=>res.status(404).json(err)); 
});
//@route DELETE api/profile
//@desc Delete user and profile
//@access Private
router.delete('/',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOneAndRemove({user:req.user.id})
    .then(()=>{
        User.findOneAndRemove({_id:req.user.id})
        .then(()=>res.json({success:true}));
    });
});

module.exports = router;
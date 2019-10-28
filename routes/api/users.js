const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const passport = require("passport");
const keys = require("../../config/keys");

const router = express.Router();

const User = require("../../models/User")


// Test Route
router.get("/test", (_, res) => {
  res.json({msg: "This is the users route"})
})

// User Registration
router.post("/register", (req, res) => {
  User.findOne({email: req.body.email})
      .then(user => {
        // If there is already an e-mail, throw an error else register the user.
        if (user) {
          return res.status(409).json({email: "A user has already registered with this address"});
        } else {
          const newUser = new User({
            handle: req.body.handle,
            email: req.body.email,
            password: req.body.password,
            date: new Date()
          })

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser.save()
                     .then(user => res.json(user))
                     .catch(err => console.log(err))
            })
          })
        }
      })
})

// User Login
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({email})
      .then(user => {
        // If you can't find the user, throw an error else compare and sign a JWT
        if (!user) {
          return res.status(404).json({email: "This user does not exist"}); 
        }

        bcrypt.compare(password, user.password)
              .then(isMatch => {
                if (isMatch) {
                  const payload = {
                    id: user.id,
                    name: user.name
                  };

                  jwt.sign(payload, keys.secretOrKey, {expiresIn: 7200}, (err, token) => {
                    res.json({
                      success: true,
                      token: "Bearer " + token
                    });
                  });
                } else {
                  return res.status(400).json({error: "Invalid password"});
                }
              })
      })
})


// Test Private Route
router.get("/current", passport.authenticate("jwt", {session: false}), (req, res) => {
  res.json({
    req: req.user,
    id: req.user.id,
    email: req.user.email,
    handle: req.user.handle
  });
})

module.exports = router;
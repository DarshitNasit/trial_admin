const router = require("express").Router();
const User = require("../models/userModel");
const Article = require("../models/articleModel");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { notLogin, isLogin, isValidUser } = require("../config/auth");

// Login
router.get("/login", notLogin, (req, res, next) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successFlash: "Welcome to KnowledgeBase",
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", isLogin, (req, res, next) => {
  req.logout();
  req.flash("success", "You have successfully logged out");
  res.redirect("/users/login");
});

// Register
router.get("/register", notLogin, (req, res, next) => {
  res.render("register");
});

router.post("/register", (req, res, next) => {
  const { name, email, password, password2 } = req.body;
  if (!name || !email || !password || !password2) {
    req.flash("danger", "Enter all fields");
    res.redirect("/users/register", {
      name,
      email,
    });
  }

  if (password !== password2) {
    req.flash("danger", "Passwords do not match");
    res.redirect("/users/register");
  }

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        req.flash("danger", "Already registerd user with same email id");
        res.redirect("/users/register", { name });
      }

      bcrypt.genSalt(10, (err, salt) => {
        if (err) console.log(err);
        bcrypt.hash(password, salt, (err, hashed) => {
          if (err) console.log(err);
          const new_user = new User({
            name: name,
            email: email,
            password: hashed,
          });

          new_user
            .save()
            .then((user) => {
              req.flash(
                "success",
                "Successfully registered, Now you can login"
              );
              res.redirect("/users/login");
            })
            .catch((err) => console.log(err));
        });
      });
    })
    .catch((err) => console.log(err));
});

// View Profile
router.get("/profile/:id", (req, res, next) => {
  const uid = req.params.id;
  User.findById(uid, (err, currUser) => {
    if (err) console.log(err);
    else if (
      !currUser ||
      (req.user.email != process.env.MY_EMAIL &&
        currUser.email === process.env.MY_EMAIL)
    ) {
      req.flash("danger", "No user found");
      res.redirect("/");
    } else {
      Article.find({ author: uid }, (err, currArticles) => {
        if (err) console.log(err);
        else res.render("user_&_article", { currUser, currArticles });
      });
    }
  });
});

// Edit profile
router.get("/edit-profile/:id", isValidUser, (req, res, next) => {
  const uid = req.params.id;
  User.findById(uid, (err, currUser) => {
    if (err) console.log(err);
    else if (!currUser) {
      req.flash("danger", "No user found");
      res.redirect("/");
    } else res.render("edit_profile", { currUser });
  });
});

router.post("/edit-profile/:id", (req, res) => {
  const uid = req.params.id;
  const name = req.body.name;
  const new_user = {
    name: name,
  };
  User.updateOne({ _id: uid }, new_user, (err) => {
    if (err) console.log(err);
    else {
      req.flash("success", "Profile updated succesfully");
      res.redirect(`/users/profile/${uid}`);
    }
  });
});

// View All Users
router.get("/allUsers", (req, res, next) => {
  User.find({}, (err, allUsers) => {
    if (err) console.log(err);
    else {
      allUsers.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) return -1;
        else if (nameA > nameB) return 1;
        return 0;
      });
      res.render("allUsers", { allUsers });
    }
  });
});

// Delete Profile
router.get("/delete-profile/:id", isValidUser, (req, res, next) => {
  const uid = req.params.id;
  User.findById({ _id: uid }, (err, currUser) => {
    if (err) console.log(err);
    else {
      if (!currUser) {
        req.flash("danger", "No user found to delete");
        res.require("/");
      } else {
        Article.deleteMany({ author: uid }, (err) => {
          if (err) console.log(err);
          else {
            User.deleteOne({ _id: uid }, (err) => {
              if (err) console.log(err);
              else {
                req.flash("success", "Deleted Successfully");
                if (req.user.id === uid) {
                  req.logout();
                  res.redirect("/");
                } else res.redirect("/users/allUsers");
              }
            });
          }
        });
      }
    }
  });
});

module.exports = router;

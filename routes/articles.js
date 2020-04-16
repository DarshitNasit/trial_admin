router = require("express").Router();
const Article = require("../models/articleModel");
const User = require("../models/userModel");
const { isLogin, isValidUser } = require("../config/auth");

// Add article
router.get("/add", isLogin, (req, res, next) => {
  res.render("add_article");
});

router.post("/add", (req, res) => {
  const new_article = new Article({
    title: req.body.title,
    author: req.user._id,
    body: req.body.body,
  });

  new_article
    .save()
    .then((article) => {
      req.flash("success", "Article added successfully");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
});

// Get Article
router.get("/:id", (req, res, next) => {
  const aid = req.params.id;
  Article.findById(aid, (err, currArticle) => {
    if (err) console.log(err);
    if (!currArticle) {
      req.flash("danger", "No article found");
      res.redirect("/");
    } else {
      User.findById(currArticle.author, (err, currUser) => {
        if (err) console.log(err);
        res.render("article", { currUser, currArticle });
      });
    }
  });
});

// Edit Article
router.get("/edit/:id", (req, res, next) => {
  const aid = req.params.id;
  Article.findById(aid, (err, currArticle) => {
    if (err) console.log(err);
    if (!currArticle) {
      req.flash("danger", "No article found");
      res.redirect("/");
    } else {
      User.findById({ _id: currArticle.author }, (err, currUser) => {
        if (err) console.log(err);
        else if (!currUser) {
          req.flash("danger", "Something went wrong");
          res.redirect("/");
        } else if (
          req.user.id == currUser._id ||
          req.user.email === process.env.MY_EMAIL
        )
          res.render("edit_article", { currArticle });
        else {
          req.flash("danger", "You are not eligible to edit this article");
          res.redirect(`/articles/view-article/${aid}`);
        }
      });
    }
  });
});

router.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const new_article = {
    title: req.body.title,
    body: req.body.body,
  };

  const query = { _id: id };
  Article.updateOne(query, new_article, (err) => {
    if (err) console.log(err);
    else {
      req.flash("success", "Successfully updated article");
      res.redirect("/articles/" + id);
    }
  });
});

// View Article
router.get("/view-article/:id", (req, res, next) => {
  const aid = req.params.id;
  Article.findOne({ _id: aid }, (err, currArticle) => {
    if (err) console.log(err);
    else res.render("article", { currArticle });
  });
});

// Delete article
router.get("/delete/:id", (req, res, next) => {
  const aid = req.params.id;
  Article.findById(aid, (err, currArticle) => {
    if (!currArticle) {
      req.flash("danger", "No article found");
      res.redirect("/");
    } else if (
      currArticle.author == req.user.id ||
      req.user.email === process.env.MY_EMAIL
    ) {
      Article.deleteOne({ _id: aid }, (err) => {
        if (err) console.log(err);
        else {
          req.flash("success", "Article deleted successfully");
          res.redirect("/users/profile/" + req.user.id);
        }
      });
    } else {
      req.flash("danger", "You are not eligible to delete this article");
      res.redirect(`/articles/view-article/${aid}`);
    }
  });
});

module.exports = router;

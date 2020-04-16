const router = require("express").Router();
const Article = require("../models/articleModel");
const User = require("../models/userModel");

router.get("/", (req, res, next) => {
  Article.find({}, (err, articles) => {
    if (err) console.log(err);
    User.find({}, (err, users) => {
      if (err) console.log(err);
      const articleAuthor = [];

      for (article of articles)
        for (user of users)
          if (article.author == user._id && user.email != process.env.MY_EMAIL)
            articleAuthor.push({
              id: article._id,
              title: article.title,
              name: user.name,
            });

      articleAuthor.sort((a, b) => {
        const nameA = a.title.toUpperCase();
        const nameB = b.title.toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });

      res.render("index", { articleAuthor });
    });
  });
});

module.exports = router;

module.exports = {
  notLogin: (req, res, next) => {
    if (req.isAuthenticated()) {
      req.flash("danger", "You have already logged in");
      res.redirect("/");
    } else next();
  },

  isLogin: (req, res, next) => {
    if (req.isAuthenticated()) next();
    else {
      req.flash("danger", "Please login first");
      res.redirect("/users/login");
    }
  },

  isValidUser: (req, res, next) => {
    if (!req.user) {
      req.flash("danger", "Please login first");
      res.redirect("/users/login");
    } else if (req.isAuthenticated() && req.user.id === req.params.id) next();
    else if (req.user.email == process.env.MY_EMAIL) next();
    else {
      req.flash("danger", "You are not eligible");
      res.redirect("/");
    }
  },

  isAdmin: (req, res, next) => {
    if (
      typeof req.user != "undefined" &&
      req.user.email === process.env.MY_EMAIL
    )
      next();
    else {
      req.flash("danger", "You are not eligible");
      res.redirect("/");
    }
  },
};

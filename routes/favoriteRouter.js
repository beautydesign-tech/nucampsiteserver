const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsites")
      .then((campsite) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(campsite);
      });
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then((favorite) => {
      if (favorite) {
        req.body.forEach((element) => {
          if (!favorite.campsites.includes(element._id)) {
            favorite.campsites.push(element._id);
          }
        })
        favorite
          .save()
          .then((favorite) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          })
          .catch((err) => next(err));
      } else {
        Favorite.create({ user: req.user._id })
          .then((favorite) => {
            console.log("Campsite added as a favorite: ", favorite);
            req.body.forEach((element) => {
              if (!favorite.campsites.includes(element._id)) {
                favorite.campsites.push(element._id);
              }
            });
          })
          .catch((err) => next(err));
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.body._id})
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => next(err));
  })

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `GET operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne().then((favorite) => {
      if (favorite) {
        req.body.forEach((element) => {
          if (!favorite.campsites.includes(element._id)) {
            favorite.campsites.push(element._id);
          } else if (favorite.campsites.includes(element._id)) {
            err = new Error(
              "That campsite is already in your list of favorites!"
            );
          } else {
            err.status = 404;
            return next(err);
          }
        });
      } else {
        Favorite.create({ user: req.user._id })
          .then((favorite) => {
            req.body.forEach((element) => {
              if (!favorite.campsites.includes(element._id)) {
                favorite.campsites.push(element._id);
              }
            })
          favorite.save()
          .then((favorite) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          })
          .catch((err) => next(err));
        })
      .catch((err) => next(err));
      }
   })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user.favorite })
      .then((favorite) => {
        if (favorite) {
          const index = favorite.campsites.indexOf(req.params._id);
          favorite.campsites.splice(index, 1);
          favorite.save().then((favorite) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          });
        } else {
          res.setHeader("Content-Type", "text/plain");
          res.end("There are no favorites to delete");
        }
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;

/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    console.log("TEST 111111")
    db.query(`SELECT * FROM users;`)
      .then(data => {

        console.log("TEST 2222222 ")

        const users = data.rows;
        console.log(data.rows)
        res.render("homepage", { users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};

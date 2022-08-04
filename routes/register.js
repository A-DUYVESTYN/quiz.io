const express = require('express');
const router  = express.Router();
const bcrypt = require('bcrypt');


module.exports = (db) => {

  const addUser = function (user) {
    return db
      .query(`INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3) RETURNING *;`, [user.username, user.email, user.password])
      .then(res => res.rows[0])
      .catch(err => {
        console.log('error message', err.stack);
        return null;
      })
  }


  //MOVE TO HOME.JS
  router.get("/", (req, res) => {
    res.render("register", {user: req.session.userId, loggedInUser: req.session.userName});
  });
// //////////

  router.post('/', (req, res) => {
    const user = req.body;
    // gets user.email and user.password from req body
    user.password = bcrypt.hashSync(user.password, 12);
    addUser(user)
    .then(user => {
      if (!user) {
        res.send({error: "error"});
        return;
      }
      console.log({user})
      req.session.userId = user.id;
      req.session.userName = user.name;
      res.redirect("/api/home")
    })
    .catch(e => res.send(e));
  });

  return router;
};

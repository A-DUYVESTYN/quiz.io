const express = require('express');
const router  = express.Router();
const bcrypt = require('bcrypt');

module.exports = (db) => {

  const getUserWithEmail = function (email) {
    return db.
      query(`SELECT * from users
      WHERE email = $1;`, [email])
      .then(res => res.rows[0])
      .catch(err => {
        console.log('error message', err.stack);
        return null;
      })
  }

const login =  function(email, password) {
  return getUserWithEmail(email)
  .then(user => {
    if (bcrypt.compareSync(password, user.password)) {
      console.log('login success');
      return user;
    }
    return null;
  });
}

router.get("/", (req, res) => {
  res.render("login", {user: req.session.userId, loggedInUser: req.session.userName});
});

router.post('/', (req, res) => {
  const {email, password} = req.body;
  login(email, password)
    .then(user => {
      if (!user) {
        res.send({error: "Invalid email or password"});
        return;
      }
      req.session.userId = user.id;
      req.session.userName = user.name;
      res.redirect('/api/home')
    })
    .catch(e => res.send(e));
});

router.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/api/login');
})
return router;
};

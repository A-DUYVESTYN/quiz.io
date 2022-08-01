/*
 * All routes for showing a quiz are defined here
 * Since this file is loaded in server.js into api/quiz_show,
 *   these routes are mounted onto /quiz_show
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/:id", (req, res) => {

    console.log(req.params.id) // check the url received

    // just use 8u8u8u as the url for now, this should reference quiz 1 'BEST BUGS'

    db.query(`
    SELECT
    name, user_id, title, public, url, quiz_id, question, answer
    FROM quizzes
    JOIN questionsAndAnswer ON quiz_id = quizzes.id
    JOIN users ON user_id = users.id
    WHERE quizzes.url = '8u8u8u'
    ;`)
      .then(data => {
        const quizItems = data.rows;
        console.log(quizItems)
        res.render("quiz_show", { quizItems });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.post("/:id/attempt", (req, res) => {
    console.log(req)
  });

  return router;
};

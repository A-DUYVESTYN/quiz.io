/*
 * All routes for showing a quiz are defined here
 * Since this file is loaded in server.js into api/quiz_new,
 *   these routes are mounted onto /quiz_new
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/quiz_show/:quiz_url", (req, res) => {

    console.log(req.params.quiz_url) // check the url is received

    //TO DO: add conditional statement to check if user is logged in
    // just use 8u8u8u as the url for now, this should be quiz 1 'BEST BUGS' lol
    db.query(`
    SELECT user_id, title, public, url, quiz_id, question, answer
    FROM quizzes
    JOIN questionsAndAnswer ON quiz_id = quizzes.id
    WHERE quizzes.url = '8u8u8u'
    ;`)
      .then(data => {
        const quizItems = data.rows;
        res.json({ quizItems });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};

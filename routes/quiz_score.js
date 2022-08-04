const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/:url", (req, res) => {
    db.query(`
    SELECT quizzes.title, users.name, attempts.user_id, attempts.quiz_id, attempts.date_attempted, COUNT(attempt_scores.correct) as correct_answers
FROM quizzes
JOIN attempts ON quizzes.id = quiz_id
JOIN users ON users.id = attempts.user_id
JOIN attempt_scores ON attempts.id = attempts_id
WHERE attempts.url = $1
AND attempt_scores.correct = TRUE
GROUP BY quizzes.title, users.name, attempts.user_id, attempts.quiz_id, attempts.date_attempted;
`, [req.params.url])
      .then(data => {
        const quizItems = data.rows[0];
        console.log(quizItems)
        // if (!req.session.userId) {
        //   res.redirect('/api/login')
        // }
        res.render("quiz_score", { quizItems, user: req.session.userId, loggedInUser: req.session.userName});
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

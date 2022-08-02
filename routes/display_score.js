const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/quiz_score/:user_id", (req, res) => {
    db.query(`
    SELECT user_id, date_attempted, question, user_guess, correct
    FROM attempt_scores
    JOIN questionsandanswer ON questionsandanswer_id = questionsandanswer.id
    JOIN attempts ON attempts_id = attempts.id
    WHERE attempts_id = 4;
    ;`)
      .then(data => {
        const quizItems = data.rows;
        console.log(quizItems)
        res.render("quiz_score", { quizItems });
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

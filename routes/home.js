const express = require('express');
const router  = express.Router();

const tallyScores = function(data)  {
  const quizData = [];
    for (const row of data) {
    let found = false;

    for (const quiz of quizData)  {
      
      if (quiz.id === row.id) {
        found = true;
        if (row.correct) {

          quiz.correct = row.count;
        }
        quiz.total += Number(row.count);
        break; 
      }
    }
    if  (!found) {
      quizData.push({title: row.title,
      id: row.id,
      correct: row.correct ? row.count: 0,
      total: Number(row.count),
      user_id: row.user_id
      });
    }
  }
  return quizData;
}  
module.exports = (db) => {
  router.get("/", (req, res) => {
    db.query(`select attempts.user_id, quizzes.id, quizzes.title, correct, count(questionsAndAnswer.question)
    from attempt_scores
    join attempts on attempts.id = attempts_id
    join questionsAndAnswer on attempt_scores.questionsAndAnswer_id = questionsAndAnswer.id
    join quizzes on attempts.quiz_id = quizzes.id
    group by attempts.user_id, correct, quizzes.id;`)
      .then(data => {
        const quizzes = tallyScores(data.rows);
        // const scores = data.rows[1]
        console.log(data.rows);
        res.render("home", { quizzes, loggedInUser: req.query.user_id });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  
  router.get("/quizzes/new", (req, res) => {
    res.render("createQuiz");
  });

  return router;
};

// id |   title   | correct | count
// ----+-----------+---------+-------
//   1 | BEST BUGS | f       |     1
//   2 | Socks     | f       |     1
//   1 | BEST BUGS | t       |     4
//   2 | Socks     | t       |     4
// (4 rows)




// select quizzes.id, quizzes.title, correct, count(questionsAndAnswer.question)
// from attempt_scores
// join attempts on attempts.id = attempts_id
// join quizzes on attempts.quiz_id = quizzes.id
// join questionsAndAnswer on attempt_scores.questionsAndAnswer_id = questionsAndAnswer.id
// where attempts.user_id = $1
// group by correct, quizzes.id;
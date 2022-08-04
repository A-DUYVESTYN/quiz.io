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
      user_id: row.user_id,
      private: row.private,
      url: row.url
      });
    }
  }
  // console.log("QUIZ DATA*******", quizData)
  return quizData;

}  


const calcScore = function(data)  {
  let right = 0;
  let wrong = 0;
  for (const row of data) {
    if (row.correct === true) {
      right += 1;
    } else {
      wrong += 1
    }
  }
  let total = right + wrong; 
    const scoreVar = `${right} / ${total}`
    // console.log(scoreVar)
    return scoreVar;
  }




///deleted a bracket here

let all_attempts;
console.log(all_attempts)
module.exports = (db) => {
  router.get("/", (req, res) => {
    db.query(`select attempts.user_id, quizzes.private, quizzes.url, quizzes.id, quizzes.title, correct, count(questionsAndAnswer.question)
    from attempt_scores
    join attempts on attempts.id = attempts_id
    join questionsAndAnswer on attempt_scores.questionsAndAnswer_id = questionsAndAnswer.id
    right join quizzes on attempts.quiz_id = quizzes.id
    where attempts.user_id = $1
    group by attempts.user_id, correct, quizzes.id;`, [req.session.userId])
      .then(data => {
        const quizzes = tallyScores(data.rows);
        // const scores = data.rows[1]
        // console.log(data.rows)
        // console.log(tallyScores(data.rows));
        db.query(`select max(attempts_id), attempts.*, attempt_scores.correct, questionsAndAnswer_id
        from attempt_scores
        join attempts on attempts_id = attempts.id
        where user_id = $1
        group by attempts.id, attempt_scores.correct, questionsAndAnswer_id
        order by max(attempts_id) desc
        limit 5;
        `, [req.session.userId])
        .then(data => {
          const score = calcScore(data.rows)
          // console.log(score)
          db.query(`select count(all_attempts) as all_attempts from (select distinct max(attempts_id) as all_attempts
          from attempt_scores
          join attempts on attempts_id = attempts.id
          where user_id = $1
          group by attempts.id, attempt_scores.correct, questionsAndAnswer_id
          order by max(attempts_id) desc) as result
          ;`, [req.session.userId])
          .then(data => {
            all_attempts = data.rows[0].all_attempts;
            console.log(all_attempts)
            res.render("home", { quizzes, user: req.session.userId, score, loggedInUser: req.session.userName, });
          })
        })
      
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

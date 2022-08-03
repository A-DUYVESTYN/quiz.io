/*
 * All routes for showing a quiz are defined here
 * Since this file is loaded in server.js into api/quiz_show,
 *   these routes are mounted onto /quiz_show
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // temporary "/api/quiz_show/" page for development
  router.get("/", (req, res) => {
    res.send("enter the url for a quiz. for example /api/quiz_show/8u8u8u")
  });

  router.get("/:id", (req, res) => {
    console.log(req.params.id); // log the url received from the address bar, which is used for querying the quiz
    // for example, 8u8u8u is the url for quiz 1
    const quizUrl = req.params.id;

    // ADDED "LEFT" TO LINE 27 ===> NEEDS TO BE A USER ID ASSOCIATED WITH THE QUIZZES ***CHANGE TO LINE 27*****
    db.query(`
    SELECT name, user_id, title, public, url, quiz_id, question, answer
    FROM quizzes
    JOIN questionsAndAnswer ON quiz_id = quizzes.id
    JOIN users ON user_id = users.id
    WHERE quizzes.url = $1;`, [quizUrl])
      .then(data => {
        const quizItems = data.rows;
        console.log(quizItems)
        res.render("quiz_show", {quizItems, user: req.session.userId, loggedInUser: req.session.userName});
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  const getQuizID = function (quizURL) {
    return db.query(`
    SELECT id from quizzes
    WHERE url = $1;`, [quizURL])
      .then(res => {
        return res.rows[0].id
      })
      .catch(err => {
        console.log('error message', err.stack);
        return null;
      })
  }

  const addAttempt = function (userId, quizId, attemptUrl) {
    const dateOfAttempt = new Date();
    return db
      .query(`INSERT INTO attempts (user_id, quiz_id, url, date_attempted)
    VALUES ($1, $2, $3, $4) RETURNING *;`, [userId, quizId, attemptUrl, dateOfAttempt])
      .then(res => res.rows[0])
      .catch(err => {
        console.log('error message', err.stack);
        return null;
      })
  }

  const addAttemptScores = function (quizAttempt, answers) {
    // SELECT query to get the questionAndAnswer_id for each question, then compare user's guess to the correct answer and INSERT all the results in attempt_scores table.
    return db
      .query(`SELECT * FROM questionsAndAnswer
    WHERE quiz_id = $1;`, [quizAttempt.quiz_id])
      .then(result => {
        const scores = []
        for (let i = 0; i < result.rows.length; i++) {
          const id = result.rows[i].id
          const correctAns = result.rows[i].answer
          if (correctAns === answers[i]) {
            scores.push({
              attempts_id: quizAttempt.id,
              questionsandanswer_id: id,
              user_guess: answers[i],
              correct: true
            })
          } else {
            scores.push({
              attempts_id: quizAttempt.id,
              questionsandanswer_id: id,
              user_guess: answers[i],
              correct: false
            })
          }
        }
        console.log("scores array for INSERT query:", scores)
        return scores
      })
      // INSERT INTO query for each question the user answered to store "attempts_id, questionAndAnswer_id, user_guess, and correct"
      .then(res => {
        const values = res.map(item => [item.attempts_id, item.questionsandanswer_id, item.user_guess, item.correct])
        console.log(values)

        for (const value of values) {
          db.query(`INSERT INTO attempt_scores (attempts_id, questionsandanswer_id, user_guess, correct)
      VALUES ($1, $2, $3, $4);`, value)
        }
      })
      .catch(err => {
        console.log('error message', err.stack);
        return null;
      })
  }

  // this POST needs to create a row in the "attempts" table with columns: user_id, quiz_id, url (of the attempt, for sharing), and date_attempted.
  // Then the user's answers should be inserted into the attempt_scores table with columns: attempts_id, questionAndAnswer_id, user_guess, and correct) Need to verify if the answer is correct before passing boolean to 'correct' column
  // then redirect to the score page (using attempts.url)
  router.post("/:id", (req, res) => {
    console.log(req.body) // log user's answers (array)

    const quizUrl = req.params.id
    console.log(quizUrl)
    // faked data for coding functions before login/generateQuizAttemptURL/ is coded
    const userAnswers = req.body["quiz-answer"]
    const fakedUserID = 3;
    const fakedAttemptURL = 'dfdfdf';

    getQuizID(quizUrl)
      .then(quizID => {
        return addAttempt(fakedUserID, quizID, fakedAttemptURL)
      })
      .then(attempt => {
        if (!attempt) {
          res.send({ error: "error" });
          return;
        }
        console.log({ attempt })
        return addAttemptScores(attempt, userAnswers)
      })
      .then(() => {
        res.redirect("/api/quiz_show/8u8u8u")
      })
      .catch(e => res.send(e));
  });

  return router;
};

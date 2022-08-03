/*
 * All routes for showing a quiz are defined here
 * Since this file is loaded in server.js into api/quiz_show,
 *   these routes are mounted onto /quiz_show
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // GET ROUTES ////////////////////////////////////////////////
  // temporary "/api/quiz_show/" page for development
  router.get("/", (req, res) => {
    res.send("enter the url for a quiz. for example /api/quiz_show/8u8u8u")
  });

  router.get("/:id", (req, res) => {
    console.log(req.params.id); // log the url received from the address bar, which is used for querying the quiz
    // for example, 8u8u8u is the url for quiz 1
    const quizUrl = req.params.id;
    db.query(`
    SELECT name, user_id, title, public, url, quiz_id, question, answer
    FROM quizzes
    JOIN questionsAndAnswer ON quiz_id = quizzes.id
    JOIN users ON user_id = users.id
    WHERE quizzes.url = $1;`, [quizUrl])
      .then(data => {
        const quizItems = data.rows;
        // console.log(quizItems)
        res.render("quiz_show", { quizItems });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // FUNCTIONS /////////////////////////////////////////////////

  const generateRandomString = function() {
    let length = 6;
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

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
    // INSERT a row in the "attempts" table with columns: user_id, quiz_id, url (for sharing the quiz attempt score), and date_attempted.
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
    // SELECT query to get the questionAndAnswer_id for each question, then compare user's guess to the correct answer
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
      // INSERT INTO query creates a row for each question of the quiz to store "attempts_id, questionAndAnswer_id, user_guess, and correct" columns
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

  // POST ROUTES //////////////////////////////////////////////

  // determine correct/incorrect and store results in "attempts" and "attempt_scores" db tables
  // then redirect to the score page (using attempts.url)
  router.post("/:id", (req, res) => {

    const userAnswers = req.body["quiz-answer"]
    const quizUrl = req.params.id
    const attemptUrl = generateRandomString();

    console.log(req.body) // log user's answers (array)
    console.log(quizUrl)

    // faked data for coding functions before login is coded
    const fakedUserID = 3;
    console.log(req.session.userId);

    // const fakedAttemptURL = 'dfdfdf';

    getQuizID(quizUrl)
      .then(quizID => {
        return addAttempt(fakedUserID, quizID, attemptUrl)
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

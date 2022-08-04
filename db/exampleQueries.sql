-- to run this example query from vagrant:
-- psql
-- \c midterm
-- \i midterm/db/exampleQueries.sql

-- ////////////////////////////////////////////////////////////////////////////////////////////
-- The Query below should return:
--  user_id |   date_attempted    |      question      | user_guess | correct
-- ---------+---------------------+--------------------+------------+---------
--        4 | 2022-02-17 08:45:00 | 2 + 2 =            | 5          | f
--        4 | 2022-02-17 08:45:00 | 20 + 20 =          | 40         | t
--        4 | 2022-02-17 08:45:00 | 200 + 200 =        | 400        | t
--        4 | 2022-02-17 08:45:00 | 6 * 7 =            | 42         | t
--        4 | 2022-02-17 08:45:00 | Stretch: sin 90 =  | potato     | f
-- (5 rows)

-- SELECT user_id, date_attempted, question, user_guess, correct
-- FROM attempt_scores
-- JOIN questionsandanswer ON questionsandanswer_id = questionsandanswer.id
-- JOIN attempts ON attempts_id = attempts.id
-- WHERE attempts_id = 4;

-- ////////////////////////////////////////////////////////////////////////////////////////////
-- The Query below should return:
--  name  | user_id | quiz_id | number of correct answers
-- -------+---------+---------+---------------------------
--  Yaboi |       4 |       4 |                         3
-- (1 row)

SELECT name, user_id, attempts.quiz_id, COUNT(correct) as "number of correct answers"
FROM attempt_scores
JOIN questionsandanswer ON questionsandanswer_id = questionsandanswer.id
JOIN attempts ON attempts_id = attempts.id
JOIN users on user_id = users.id
WHERE attempts_id = 4
AND correct = TRUE
GROUP BY name, user_id, attempts.quiz_id;

-- ////////////////////////////////////////////////////////////////////////////////////////////
SELECT name, attempts.user_id, attempts.quiz_id, COUNT(correct) as correct_answers, quizzes.title, date_attempted, attempts.url
FROM attempt_scores
JOIN questionsandanswer ON questionsandanswer_id = questionsandanswer.id
JOIN attempts ON attempts_id = attempts.id
JOIN users ON attempts.user_id = users.id
JOIN quizzes ON quizzes.user_id = users.id
WHERE attempts.quiz_id = 4
AND attempts.user_id = 4
AND correct = TRUE
GROUP BY name, attempts.user_id, attempts.quiz_id, quizzes.title, attempts.date_attempted, attempts.url;

--  name  | user_id | quiz_id | correct_answers |   title    |   date_attempted    |  url
-- -------+---------+---------+-----------------+------------+---------------------+--------
--  Yaboi |       4 |       4 |               3 | Cartwheels | 2022-02-17 08:45:00 | 4qwert
-- /////////////////////////////////////////////////////////////////////////////////////////

SELECT name, attempts.user_id, attempts.quiz_id, COUNT(correct) as correct_answers, quizzes.title, date_attempted
FROM attempt_scores
JOIN questionsAndAnswer ON questionsAndAnswer_id = questionsAndAnswer.id
JOIN attempts ON attempts_id = attempts.id
JOIN users ON attempts.user_id = users.id
JOIN quizzes ON quizzes.user_id = users.id
WHERE attempts.quiz_id = (SELECT quiz_id FROM attempts WHERE url = '2qwert')
AND attempts.user_id = (SELECT user_id FROM attempts WHERE url = '2qwert')
AND correct = TRUE
GROUP BY name, attempts.user_id, attempts.quiz_id, quizzes.title, attempts.date_attempted;

-- name  | user_id | quiz_id | correct_answers |   title    |   date_attempted
-- -------+---------+---------+-----------------+------------+---------------------
--  Yaboi |       4 |       4 |               3 | Cartwheels | 2022-02-17 08:45:00
-- (1 row)
--/////////////////////////////////////////////////////////////////////////////////////

SELECT quizzes.title, users.name, attempts.user_id, attempts.quiz_id, attempts.date_attempted, COUNT(attempt_scores.correct) as correct_answers
FROM quizzes
JOIN attempts ON quizzes.id = quiz_id
JOIN users ON users.id = attempts.user_id
JOIN attempt_scores ON attempts.id = attempts_id
WHERE attempts.url = '3qwert'
AND attempt_scores.correct = TRUE
GROUP BY quizzes.title, users.name, attempts.user_id, attempts.quiz_id, attempts.date_attempted;

DROP TABLE IF EXISTS attempt_scores CASCADE;
CREATE TABLE attempt_scores (
    id SERIAL PRIMARY KEY NOT NULL,
    attempts_id INTEGER REFERENCES attempts(id),
    questions_and_answer INTEGER REFERENCES questionsAndAnswer(id),
    user_guess TEXT,
    correct BOOLEAN NOT NULL DEFAULT FALSE 
)
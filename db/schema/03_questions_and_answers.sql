DROP TABLE IF EXISTS questionsAndAnswer CASCADE;
CREATE TABLE questionsAndAnswer  (
    id SERIAL PRIMARY KEY NOT NULL,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT,
    answer TEXT
);
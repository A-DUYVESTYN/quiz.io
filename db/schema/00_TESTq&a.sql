CREATE TABLE TESTquestionsAndAnswer  (
    id SERIAL PRIMARY KEY NOT NULL,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT,
    answer TEXT
);
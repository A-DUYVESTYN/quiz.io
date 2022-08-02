const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.post("/create", (req, res) => {
    console.log("req.body.params", req.body);
    const {Question_1, 
           Question_2, 
            Question_3, 
            Question_4, 
            Question_5, 
            Answer_1, 
            Answer_2, 
            Answer_3, 
            Answer_4, 
            Answer_5,} = req.body;
            console.log(Question_1, Question_2, 
                Question_3, 
                Question_4, 
                Question_5, 
                Answer_1, 
                Answer_2, 
                Answer_3, 
                Answer_4, 
                Answer_5,)
    
    return res.redirect("/api/home");
  });

  router.get("/", (req, res) => {
      res.render('createQuiz')
   
        db.query(
          `INSERT INTO TESTquestionsAndAnswer (question, answer)
        values ($1, $2) RETURNING *`,
          [Question_1, Answer_1]
        )
   
      
    .then((data) => {
        
        db.query(
            `INSERT INTO TESTquestionsAndAnswer (question, answer)
          values ($1, $2) RETURNING *`,
            [Question_2, Answer_2]
          )
        })
        .then((data) => {
            db.query(
                `INSERT INTO TESTquestionsAndAnswer (question, answer)
              values ($1, $2) RETURNING *`,
                [Question_3, Answer_3]
              )
            })
            .then((data) => {
                db.query(
                    `INSERT INTO TESTquestionsAndAnswer (question, answer)
                  values ($1, $2) RETURNING *`,
                    [Question_4, Answer_4]
                  )
                })
                .then((data) => {
                    db.query(
                        `INSERT INTO TESTquestionsAndAnswer (question, answer)
                      values ($1, $2) RETURNING *`,
                        [Question_5, Answer_5]
                      )
                    })
 
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  
  return router;
};

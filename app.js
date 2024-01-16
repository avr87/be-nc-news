const express = require("express");
const request = require("supertest");
const app = express();
const {
  getTopics,
  getApi,
  getArticleById,
} = require("./controllers/controllers");
app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getApi);

app.get("/api/articles/:article_id", getArticleById);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "42703") {
    res.status(400).send({msg:"Bad request"});
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(500).send({msg: "Server Error!"});
});
module.exports = app;

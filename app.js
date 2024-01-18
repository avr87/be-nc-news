const express = require("express");
const request = require("supertest");
const app = express();
const {
  getTopics,
  getApi,
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchVotesByArticleId,
  deleteCommentByCommentId,
} = require("./controllers/controllers");

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getApi);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);
app.patch("/api/articles/:article_id", patchVotesByArticleId);

app.delete("/api/comments/:comment_id", deleteCommentByCommentId);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});
app.use((err, req, res, next) => {
  if (err.code === "23503") {
    res.status(404).send({ msg: "No article available" });
  } else {
    next(err);
  }
});
app.use((err, req, res, next) => {
  if (err.code === "42703" || err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Server Error!" });
});
module.exports = app;

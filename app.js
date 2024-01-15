const express = require("express");
const request = require("supertest");
const app = express();
const { getTopics, getApi } = require("./controllers/controllers");
app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getApi);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Server Error!");
});
module.exports = app;

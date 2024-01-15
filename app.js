const express = require("express");
const request = require("supertest");
const app = express();
const { getTopics } = require("./controllers/controllers");
app.use(express.json());

app.get("/api/topics", getTopics);


app.use((err, req, res, next) => {
  res.status(500).send("Server Error!");
});
module.exports = app;

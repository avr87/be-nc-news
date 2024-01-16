const { promises } = require("supertest/lib/test");
const db = require("../db/connection");
const fs = "fs/promises";

exports.fetchTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => {
    return result.rows;
  });
};

exports.fetchArticleById = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = ${article_id}`)
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "There is currently no article with this id available",
        });
      }
      return rows;
    });
};

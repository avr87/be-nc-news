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
    .query(
      `SELECT articles.*, COUNT(comments.article_id) AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "There is currently no article with this id available",
        });
      }
      return rows[0];
    });
};
exports.fetchArticles = (topic, sort_by = "created_at", order = "desc") => {
  const validSortQueries = ["created_at", "votes", "comment_count"];
  const validOrderQueries = ["asc", "desc"];

  if (!validSortQueries.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "invalid sort_by query" });
  }
  if (!validOrderQueries.includes(order)) {
    return Promise.reject({ status: 400, msg: "invalid order query" });
  }

  let queryString = `SELECT articles.author,
        articles.title,
        articles.article_id,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url, COUNT(comments.article_id) AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id `;

  const queryParameters = [];
  if (topic) {
    queryString += " WHERE topic = $1 ";
    queryParameters.push(topic);
  }
  queryString += `GROUP BY articles.article_id ORDER BY ${sort_by} ${order};`;

  return db.query(queryString, queryParameters).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: "There is currently no article with this topic available",
      });
    }
    return rows;
  });
};

exports.fetchCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "There are currently no comments available",
        });
      }
      return rows;
    });
};

exports.insertCommentByArticleId = (newComment, article_id) => {
  const { username, body } = newComment;
  if (!username || !body) {
    return Promise.reject({
      status: 400,
      msg: "Please insert username and comment",
    });
  }
  return db
    .query(
      `INSERT INTO comments (author, body,article_id) VALUES ($1,$2,$3) RETURNING *;`,
      [username, body, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
exports.addVotesByArticleId = (inc_votes, article_id) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "There is currently no article with this id available",
        });
      }
      return rows[0];
    });
};
exports.removeCommentByCommentId = (comment_id) => {
  return db
    .query(
      `DELETE FROM comments
WHERE comment_id = $1 RETURNING *;`,
      [comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "This comment does not exist",
        });
      }
    });
};
exports.fetchUsers = () => {
  return db.query("SELECT * FROM users;").then(({ rows }) => {
    return rows;
  });
};

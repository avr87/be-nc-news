const db = require("../db/connection");
const fs = "fs/promises";

exports.fetchTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => {
    return result.rows;
  });
};

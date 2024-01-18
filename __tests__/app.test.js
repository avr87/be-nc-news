const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const endpoints = require("../endpoints.json");
const format = require("pg-format");

afterAll(() => db.end());

beforeEach(() => seed(testData));

describe("GET /api/topics", () => {
  test("GET: 200 responds with all topics with key's of slug and description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toHaveLength(3);
        body.topics.forEach((topics) => {
          expect(typeof topics.slug).toBe("string");
          expect(typeof topics.description).toBe("string");
        });
      });
  });
  test("GET: 200 responds with an array of objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toEqual([
          { slug: "mitch", description: "The man, the Mitch, the legend" },
          { slug: "cats", description: "Not dogs" },
          { slug: "paper", description: "what books are made of" },
        ]);
      });
  });
});

describe("GET /api/invalid-input", () => {
  test("GET:404 responds with a 404 when given an invalid path", () => {
    return request(app).get("/api/invalid-input").expect(404);
  });
});

describe("GET /api", () => {
  test("responds with an object describing all the available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endpoints);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("GET: 200 responds with an array of object with all the info of the correct article_id ", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("GET: 404  responds with an error message when the request id is valid but the id is not present. ", () => {
    return request(app)
      .get("/api/articles/14")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toEqual(
          "There is currently no article with this id available"
        );
      });
  });
  test("GET: 400 responds with an error message when the request id is invalid ", () => {
    return request(app)
      .get("/api/articles/banana")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("Bad request");
      });
  });
});

describe("GET /api/articles", () => {
  test("GET: 200 responds with an array of article objects with all the info included", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(13);
        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          });
        });
      });
  });
  test("GET 200: respondse with an array of article objects sorted in descending order of time created", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});
describe("GET /api/articles/:article_id/comments", () => {
  test("GET: 200 responds with an array of comment objects of that specific article id with all the info included", () => {
    return request(app)
      .get("/api/articles/5/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(2);
        expect(body.comments).toBeSortedBy("created_at", {
          descending: true,
        });
        body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            article_id: expect.any(Number),
            body: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            comment_id: expect.any(Number),
          });
        });
      });
  });

  test("GET: 400 responds with an error message when the request id is invalid ", () => {
    return request(app)
      .get("/api/articles/banana/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("Bad request");
      });
  });
  test("GET: 404 responds with an error message when there are no comments available for the requested article ", () => {
    return request(app)
      .get("/api/articles/7/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toEqual(
          "There are currently no comments available"
        );
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("POST: 201 responds with the newly added comment", () => {
    return request(app)
      .post("/api/articles/5/comments")
      .send({
        username: "butter_bridge",
        body: "This is a test body",
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.comment.author).toBe("butter_bridge");
        expect(body.comment.body).toBe("This is a test body");
      });
  });
  test("POST: 400 when we receive no content", () => {
    return request(app)
      .post("/api/articles/5/comments")
      .send({})
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("Please insert username and comment");
      });
  });
  test("POST: 404 when we receive a valid but not present article_id ", () => {
    return request(app)
      .post("/api/articles/1000/comments")
      .send({
        username: "butter_bridge",
        body: "This is a test body",
      })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toEqual("No article available");
      });
  });
});
describe("PATCH /api/articles/:article_id", () => {
  test("PATCH: 201 when receiving a positive integer it increments  the votes on the requested article and returns the article with updates votes ", () => {
    return request(app)
      .patch("/api/articles/5")
      .send({ inc_votes: 2 })
      .expect(201)
      .then(({ body }) => {
        expect(body.article.votes).toBe(2);
        expect(body.article).toEqual({
          article_id: 5,
          title: "UNCOVERED: catspiracy to bring down democracy",
          topic: "cats",
          author: "rogersop",
          body: "Bastet walks amongst us, and the cats are taking arms!",
          created_at: "2020-08-03T13:14:00.000Z",
          votes: 2,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("PATCH: 201 when receiving a negative integer it decreases the current votes on the requested article and returns the article with updates votes  ", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -100 })
      .expect(201)
      .then(({ body }) => {
        expect(body.article.votes).toBe(0);
        expect(body.article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("PATCH: 404 when receiving a valid article_id but there is no article present under that id returns an error stating that ", () => {
    return request(app)
      .patch("/api/articles/1000")
      .send({ inc_votes: -100 })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toEqual(
          "There is currently no article with this id available"
        );
      });
  });
  test("PATCH: 400 responds with an error message when the request id is invalid ", () => {
    return request(app)
      .patch("/api/articles/banana")
      .send({ inc_votes: -100 })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("Bad request");
      });
  });
  test("PATCH: 400 responds with an error message when the request id is invalid ", () => {
    return request(app)
      .patch("/api/articles/5")
      .send({ inc_votes: "banana" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("Bad request");
      });
  });
});

describe("DELETE: /api/comments/:comment_id", () => {
  test("DELETE: 204 responds with status 204", () => {
    return request(app).delete("/api/comments/5").expect(204);
  });
  test("DELETE 400 responds a bad request when the id is invalid.", () => {
    return request(app)
      .delete("/api/comments/100")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("This comment does not exist");
      });
  });
  test("DELETE 400 responds a bad request when the id is invalid.", () => {
    return request(app)
      .delete("/api/comments/banana")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});

describe("GET: /api/users", () => {
  test("GET 200: to respond with an array of object containing the users with their username, usr and avatar_url", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.users)).toBe(true);
      });
  });
  test("GET 200: to respond with an array of object containing the users with their username, usr and avatar_url", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users).toHaveLength(4);
        body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

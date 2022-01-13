const express = require("express");
const { randomBytes } = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const app = express();
app.use(cors());
app.use(bodyParser.json());
const commentsByPostId = {};

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const id = req.params.id;
  const { content } = req.body;
  const comments = commentsByPostId[id] || [];
  comments.push({ id: commentId, content, status: "pending" });
  commentsByPostId[id] = comments;
  try {
    await axios.post("http://localhost:4005/events", {
      type: "CommentCreated",
      data: { id: commentId, content, postId: id, status: "pending" },
    });
  } catch (error) {
    console.log(error);
  }
  res.status(201).send(comments);
});
app.get("/posts/:id/comments", (req, res) => {
  const id = req.params.id;
  res.send(commentsByPostId[id] || []);
});
app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  console.log("received event", type);
  if (type === "CommentModerated") {
    console.log("data", data);
    const { postId, id, status, content } = data;
    const comments = commentsByPostId[postId];
    const comment = comments.find((comment) => comment.id === id);
    comment.status = status;
    try {
      await axios.post("http://localhost:4005/events", {
        type: "CommentUpdated",
        data: { id, status, postId, content },
      });
    } catch (error) {
      console.log(error);
    }
  }
  res.send({});
});

app.listen(4001, () => {
  console.log("listening on port 4001");
});

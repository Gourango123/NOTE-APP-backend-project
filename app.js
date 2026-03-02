const express = require("express");
const router = require("./routers/user.route");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:5173","https://note-app-frontend-project.vercel.app"],
    credentials: true,
  })
);
app.use("/user", router);

app.get("/", (req, res) => {
  res.send("API is runnig");
});

module.exports = app;

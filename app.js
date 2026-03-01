const express = require("express");
const router = require("./routers/user.route");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "https://note-app-frontend-project-6nn7sfqrw-gourango-roys-projects.vercel.app",
    credentials: true,
  })
);
app.use("/user", router);

app.get("/", (req, res) => {
  res.send("API is runnig");
});

module.exports = app;

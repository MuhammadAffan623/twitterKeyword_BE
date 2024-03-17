const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
require("./db");

// const runCronJob = require("./cronJob");

const { PORT } = require("./config");

// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Server is runing!");
});

const port = PORT || 3000;
console.log("Port: " + port);
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

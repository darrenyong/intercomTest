const express = require("express");
const mongoose = require("mongoose");

const app = express();
const db = require("./config/keys").mongoURI;
const port = process.env.PORT || 5000;

const users = require("./routes/api/users")
const tweets = require("./routes/api/tweets")

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

mongoose
        .connect((db), {useNewUrlParser: true})
        .then(() => console.log("Connected to MongoDB Successfully"))
        .catch(err => console.log(err));

app.get("/", (_, res) => {
  res.send("Hello World!")
})

app.use("/api/users", users);
app.use("/api/tweets", tweets);
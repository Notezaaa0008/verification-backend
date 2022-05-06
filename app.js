require("dotenv").config();
const express = require("express");
const cors = require("cors");
const middleware = require("./middlewares/error");

const testRoute = require("./routes/testRoute");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use("/test", testRoute);

app.use((req, res, next) => {
  res
    .status(404)
    .json({ message: "Path not found in this server, please make sure that your path or method is correct." });
});

app.use(middleware);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`This server is running on ${port}`));

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", routes);

// Global Error Handler (always last)
app.use(errorHandler);

module.exports = app;
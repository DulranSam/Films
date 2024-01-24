const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;
const cluster = process.env.CLUSTER;
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const mongoose = require("mongoose");
const homepage = require("./routes/home");
const { join } = require("path");
const morgan = require("morgan");
const fs = require("fs");
const register = require("./routes/users");
const login = require("./routes/login");
const gemini = require("./routes/gemini");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const linked = require("./routes/linked");
const cart = require("./routes/cart");
const adminMain = require("./routes/admin/adminMain");
const limiter = require("./limiter");
const session = require("express-session");
const discordHandler = require("./security/discordAuth.js");
const gptGenerate = require("./routes/gpt.js");
const sqlPath = require("./routes/secondary.js");
const passport = require("passport");
const errorHandler = require("./errors/errorHandler.js");

function isAuthenticated(req, res, next) {
  if (req?.session?.user) {
    const instance = req?.session?.user;
    res
      .status(200)
      .send(`${JSON.stringify(req.session.user.username)} has Logged in!`);
    res.session.save((err) => {
      if (err) throw err;
    });
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
}

app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: "password123",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session(discordHandler));

function midLog(req, res, next) {
  console.log(
    `Request coming from ${req.url} \nMethod-> ${
      req.method
    }\nSession -> ${JSON.stringify(req?.session)})}\n ID -> ${JSON.stringify(
      req.session.id
    )}`
  );
  next();
}

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], //react project
  })
);

if (!fs.existsSync(join(__dirname, "public"))) {
  fs.mkdirSync(join(__dirname, "public"));
}

app.use(midLog);
app.use(helmet());
app.use(compression({ filter: false }));
app.use(express.static(join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(errorHandler);
app.use(compression());
app.use(limiter, (req, res, next) => {
  next();
});
app.use("/register", register);
app.use("/login", login);
// app.use(isAuthenticated); //the middleware function only checks if the session exists if it's a first time , if the session exists that means the user has logged in!
app.use("/images", gptGenerate); //that's why the routes below are after logged in , to only give access when user is logged in!
app.use("/sql", sqlPath);
app.use("/home", homepage);
app.use("/links", linked);
app.use("/gemini", gemini);
app.use("/cart", cart);

async function connectDB() {
  try {
    await mongoose.connect(cluster, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to Cluster!");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

app.use("*", (req, res) => {
  res.sendFile(join(__dirname, "./views/404", "404.html"));
});

const admin = express();
admin.use(express.json({ limit: "50mb" }));
admin.use(cors());
admin.use("/main", adminMain);

async function adminBoot() {
  admin.listen(8001, () => {
    connectDB();
    console.log("Admin up on port 8001");
  });
}

adminBoot();

async function clientBoot() {
  try {
    app.listen(port, () => {
      connectDB();
      console.log(`Client is up on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting client:", error);
  }
}

clientBoot();

const { createServer } = require("http");
const { Server } = require("socket.io");

const server = express();
const httpServer = createServer(server);
const io = new Server(httpServer);
server.use(cors());

io.on("connection", (socket) => {
  socket.on("message", (data) => {
    io.emit("message", data);
    console.log(data);
  });

  socket.on("remove", (data) => {
    io.emit("remove", data);
  });
});

httpServer.listen(4000, () => {
  console.log("Server is listening on port 4000");
});
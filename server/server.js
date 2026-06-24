const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const emailRoutes = require("./routes/emailRoutes");
const inboundRoutes = require("./routes/inboundRoutes");
const inboxRoutes = require("./routes/inboxRoutes");
const { setSocketIO } = require("./controllers/inboundController");

const app = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL;
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", clientUrl);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf.toString("utf-8");
  },
}));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/api", (req, res) => {
  res.json({
    message: "Hello from server API",
    success: true,
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/inbound-email", inboundRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/emails", inboxRoutes);

const startServer = async () => {
  try {
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is missing in .env");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    const server = app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });

    const io = new Server(server, {
      cors: {
        origin: clientUrl,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    setSocketIO(io);

    io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, jwtSecret);
        socket.userId = decoded.userId;
        next();
      } catch {
        next(new Error("Invalid token"));
      }
    });

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.userId);
      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.userId);
      });
    });

    console.log("Socket.io initialized");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

startServer();

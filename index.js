import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { dbConnect } from "./models/db.js";
import { userRouters } from "./Routes/userRoutes.js";
import { chatRouters } from "./Routes/chatRouters.js";
import { messageRouters } from "./Routes/messageRouters.js";
import { Server } from "socket.io";

// Initializing Server
const app = express();
// Dotenv Config
dotenv.config();
// DB Connect
dbConnect();

// Middlewares
app.use(
  cors({
    origin: ["https://chatty-chat-1.netlify.app"],
  })
);
app.use(express.json());

// Initializing PORT
const PORT = process.env.PORT || 5000;

// Application Routes
app.use("/user", userRouters);
app.use("/chat", chatRouters);
app.use("/message", messageRouters);

// Error handling
app.use(async (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ acknowledged: false, error: "Internal server error" });
});

// Express Server
const expressServer = app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});

// Socket Initialization
const io = new Server(expressServer, {
  pingTimeout: 60000,
  cors: {
    origin: ["https://chatty-chat-1.netlify.app"],
  },
});

// Socket Connection
io.on("connection", (socket) => {
  console.log("connected to socket.io", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("joinChat", (room) => {
    socket.join(room);
    console.log(`User joined Room ${room}`);
  });

  socket.on("typing", (room) => {
    socket.broadcast.to(room).emit("typing");
  });

  socket.on("stopTyping", (room) => {
    socket.broadcast.to(room).emit("stopTyping");
  });

  socket.on("newMessage", (newMessageReceived) => {
    let chat = newMessageReceived.chat;

    if (!chat.users) return console.log("Chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("messageReceived", newMessageReceived);
    });
  });
});

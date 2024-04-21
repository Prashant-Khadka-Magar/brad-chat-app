import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import {
  getCurrentUser,
  getRoomUsers,
  userJoin,
  userLeave,
} from "./utils/users.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));
const io = new Server(server);

//Run when client connects
io.on("connection", (socket) => {
  //Connect to room
  socket.on("joinRoom", ({ username, room }) => {
    //sent to the util for adding in the users array
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //Welcome the current user
    socket.emit("notification", "Welcome to ChatCord");

    //Broadcast when a user comments
    socket.broadcast
      .to(user.room)
      .emit("notification", `${username} had connected`);

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //for displaying typing messages
  socket.on("typing", () => {
    const user = getCurrentUser(socket.id);
    socket.broadcast.to(user.room).emit("activity",`${user.username} is typing`);
  });

  //Listen for chatMessages
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", {
      username: user.username,
      text: msg,
      time: new Intl.DateTimeFormat("default", {
        hour: "numeric",
        minute: "numeric",
      }).format(new Date()),
    });
  });

  //runs when a user disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit("notification", `${user.username} disconnected`);
    }

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});

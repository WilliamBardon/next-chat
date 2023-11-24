import { Server } from "socket.io";

const debug = false;
export default function handler(req, res) {
  if (res.socket.server.io) {
    if (debug) console.log("Server already started!");
    res.end();
    return;
  }

  const io = new Server(res.socket.server, {
    path: "/api/socket_io",
    addTrailingSlash: false,
  });
  res.socket.server.io = io;

  if (debug) console.log("Server info: ", io)

  const onConnection = (socket) => {
    if (debug) console.log("New connection", socket.id);

    // Send message command:

    const createdMessage = (msg) => {
      if (debug) console.log("Sending message to clients:", msg);
      socket.in(msg.chatroomid).emit("receive-message", msg);
      // socket.broadcast.emit("receive-message", msg);
    };

    const messageToLive = (msg) => {
      console.log("Message to live: ", msg)
      if (debug) console.log("Sending message to clients:", msg);
      socket.in(msg.chatroomid).emit("message-to-live", msg);
      // socket.broadcast.emit("receive-message", msg);
    };

    socket.on("send-message", createdMessage);
    socket.on("message-to-live", messageToLive);

    // Join room command:

    const joinRoom = (msg) => {
      if (debug) console.log("Joining room: ", msg);
      socket.join(msg)
    };

    socket.on("join-room", joinRoom);
  };

  io.on("connection", onConnection);

  if (debug) console.log("Socket server started successfully!");
  res.end();
}

let io;

const setIO = (socketIOInstance) => {
  io = socketIOInstance;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io instance not set");
  }
  return io;
};
module.exports = { setIO, getIO };

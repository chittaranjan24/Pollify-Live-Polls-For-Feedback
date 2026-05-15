export function socketConnect(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join a poll room to receive live updates
    socket.on('join-poll', (pollId) => {
      socket.join(`poll-${pollId}`);
      console.log(`Socket ${socket.id} joined poll room: poll-${pollId}`);
    });

    socket.on('leave-poll', (pollId) => {
      socket.leave(`poll-${pollId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}
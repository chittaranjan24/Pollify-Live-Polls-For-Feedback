import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling']
    });
  }
  return socketInstance;
};

export const useSocket = (pollId, onNewResponse, onPublished) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!pollId) return;

    const socket = getSocket();
    socketRef.current = socket;

    socket.emit('join-poll', pollId);

    if (onNewResponse) {
      socket.on('new-response', onNewResponse);
    }
    if (onPublished) {
      socket.on('poll-published', onPublished);
    }

    return () => {
      socket.emit('leave-poll', pollId);
      if (onNewResponse) socket.off('new-response', onNewResponse);
      if (onPublished) socket.off('poll-published', onPublished);
    };
  }, [pollId]);

  return socketRef.current;
};

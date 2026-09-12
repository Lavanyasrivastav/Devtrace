import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useProjectSocket(projectId, handlers = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers; // always call the latest handlers without re-connecting

  useEffect(() => {
    if (!accessToken || !projectId) return undefined;

    const socket = io(SOCKET_URL, { auth: { token: accessToken } });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join:project', projectId);
    });

    const eventNames = ['error:ingested', 'error:statusChanged', 'error:spikeDetected', 'monitor:statusChanged'];
    eventNames.forEach((eventName) => {
      socket.on(eventName, (payload) => {
        handlersRef.current[eventName]?.(payload);
      });
    });

    return () => {
      socket.emit('leave:project', projectId);
      socket.disconnect();
    };
  }, [accessToken, projectId]);

  return socketRef;
}

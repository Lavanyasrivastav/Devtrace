import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { createBullMQConnection } from '../config/redis.js';
import { ProjectMember } from '../models/ProjectMember.js';
import { logger } from '../config/logger.js';

let ioInstance = null;

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  // Redis adapter means events broadcast correctly even once the API runs as
  // multiple instances behind a load balancer, not just on one process.
  const pubClient = createBullMQConnection();
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const payload = jwt.verify(token, env.jwtSecret);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id} (user ${socket.userId})`);

    socket.on('join:project', async (projectId) => {
      const membership = await ProjectMember.findOne({ project: projectId, user: socket.userId });
      if (!membership) {
        socket.emit('error:join', { message: 'Not a member of this project' });
        return;
      }
      socket.join(`project:${projectId}`);
    });

    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
}

// Returns null (rather than throwing) when Socket.IO hasn't been initialized —
// e.g. in tests or any script that calls createApp() directly without going
// through server.js's initSocket(). Real-time emission is best-effort and
// must never be the reason a request fails.
export function getIO() {
  return ioInstance;
}

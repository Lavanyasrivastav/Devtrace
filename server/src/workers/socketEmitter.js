import { Emitter } from '@socket.io/redis-emitter';
import { createBullMQConnection } from '../config/redis.js';

let emitterInstance = null;

function getEmitter() {
  if (!emitterInstance) {
    emitterInstance = new Emitter(createBullMQConnection());
  }
  return emitterInstance;
}

export function emitMonitorStatusChanged(projectId, monitor) {
  getEmitter().to(`project:${projectId}`).emit('monitor:statusChanged', monitor);
}

export function emitSpikeDetected(projectId, errorGroup) {
  getEmitter().to(`project:${projectId}`).emit('error:spikeDetected', errorGroup);
}

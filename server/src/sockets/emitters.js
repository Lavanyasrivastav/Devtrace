import { getIO } from './index.js';

export function emitErrorEvent(projectId, event, payload) {
  const io = getIO();
  if (!io) return; // Socket.IO not running in this process (e.g. tests) — safe no-op
  io.to(`project:${projectId}`).emit(event, payload);
}

export function emitNewOrUpdatedError(projectId, errorGroup) {
  emitErrorEvent(projectId, 'error:ingested', errorGroup);
}

export function emitErrorStatusChanged(projectId, errorGroup) {
  emitErrorEvent(projectId, 'error:statusChanged', errorGroup);
}

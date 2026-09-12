import mongoose from 'mongoose';

const errorGroupSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    fingerprint: { type: String, required: true },
    title: { type: String, required: true },
    errorType: { type: String, default: 'Error' },
    service: { type: String, default: 'unknown' },
    environment: { type: String, required: true },
    severity: { type: String, enum: ['info', 'warning', 'error', 'critical'], default: 'error' },
    status: { type: String, enum: ['open', 'resolved', 'ignored'], default: 'open' },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    firstSeen: { type: Date, required: true },
    lastSeen: { type: Date, required: true },
    occurrenceCount: { type: Number, default: 1 },
    sampleStackTrace: { type: String, default: '' },
    trend: {
      isSpike: { type: Boolean, default: false },
      rate: { type: Number, default: 0 }, // occurrences per hour, from the recurring detection worker
    },
    lastDetectionAt: { type: Date, default: null },
  },
  { timestamps: true }
);

errorGroupSchema.index({ project: 1, fingerprint: 1 }, { unique: true });
errorGroupSchema.index({ project: 1, status: 1, lastSeen: -1 });
errorGroupSchema.index({ project: 1, severity: 1 });

errorGroupSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    project: this.project,
    title: this.title,
    errorType: this.errorType,
    service: this.service,
    environment: this.environment,
    severity: this.severity,
    status: this.status,
    assignee: this.assignee,
    firstSeen: this.firstSeen,
    lastSeen: this.lastSeen,
    occurrenceCount: this.occurrenceCount,
    trend: this.trend,
  };
};

export const ErrorGroup = mongoose.model('ErrorGroup', errorGroupSchema);

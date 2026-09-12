import mongoose from 'mongoose';

const monitorResultSchema = new mongoose.Schema({
  monitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Monitor', required: true, index: true },
  statusCode: { type: Number, default: null },
  responseTimeMs: { type: Number, default: null },
  isUp: { type: Boolean, required: true },
  errorMessage: { type: String, default: null },
  checkedAt: { type: Date, default: () => new Date() },
});

monitorResultSchema.index({ monitor: 1, checkedAt: -1 });

export const MonitorResult = mongoose.model('MonitorResult', monitorResultSchema);

import mongoose from 'mongoose';

const errorOccurrenceSchema = new mongoose.Schema(
  {
    errorGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ErrorGroup', required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    message: { type: String, required: true },
    stackTrace: { type: String, default: '' },
    severity: { type: String, enum: ['info', 'warning', 'error', 'critical'], required: true },
    environment: { type: String, required: true },
    service: { type: String, default: 'unknown' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    parsedFrames: { type: [mongoose.Schema.Types.Mixed], default: [] },
    timestamp: { type: Date, required: true },
  },
  { timestamps: true }
);

errorOccurrenceSchema.index({ errorGroup: 1, timestamp: -1 });
errorOccurrenceSchema.index({ project: 1, timestamp: -1 });

export const ErrorOccurrence = mongoose.model('ErrorOccurrence', errorOccurrenceSchema);

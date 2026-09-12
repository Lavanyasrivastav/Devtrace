import mongoose from 'mongoose';

const monitorSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    url: { type: String, required: true, trim: true },
    method: { type: String, enum: ['GET', 'POST', 'HEAD', 'PUT'], default: 'GET' },
    expectedStatus: { type: Number, default: 200 },
    intervalSeconds: { type: Number, default: 300, min: 30 },
    isActive: { type: Boolean, default: true },
    currentStatus: { type: String, enum: ['up', 'down', 'degraded', 'unknown'], default: 'unknown' },
    nextCheckAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

monitorSchema.index({ isActive: 1, nextCheckAt: 1 });

monitorSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    project: this.project,
    name: this.name,
    url: this.url,
    method: this.method,
    expectedStatus: this.expectedStatus,
    intervalSeconds: this.intervalSeconds,
    isActive: this.isActive,
    currentStatus: this.currentStatus,
    createdAt: this.createdAt,
  };
};

export const Monitor = mongoose.model('Monitor', monitorSchema);

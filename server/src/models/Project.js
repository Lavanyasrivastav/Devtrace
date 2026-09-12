import mongoose from 'mongoose';

const ENVIRONMENTS = ['development', 'staging', 'production'];

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    environment: { type: String, enum: ENVIRONMENTS, default: 'development' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    apiKeyHash: { type: String, required: true, unique: true },
    apiKeyPrefix: { type: String, required: true }, // e.g. "dvt_live_ab12cd34" — safe to show in UI
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

projectSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    environment: this.environment,
    owner: this.owner,
    apiKeyPrefix: this.apiKeyPrefix,
    isArchived: this.isArchived,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const ENVIRONMENT_VALUES = ENVIRONMENTS;
export const Project = mongoose.model('Project', projectSchema);

import mongoose from 'mongoose';

export const PROJECT_ROLES = ['owner', 'admin', 'developer', 'viewer'];

const projectMemberSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: PROJECT_ROLES, required: true },
    invitedAt: { type: Date, default: Date.now },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// A user can only have one membership per project.
projectMemberSchema.index({ project: 1, user: 1 }, { unique: true });

export const ProjectMember = mongoose.model('ProjectMember', projectMemberSchema);

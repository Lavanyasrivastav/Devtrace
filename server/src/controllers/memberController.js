import { ProjectMember } from '../models/ProjectMember.js';
import { User } from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';
import { success } from '../utils/apiResponse.js';
import { AuthorizationError, ConflictError, NotFoundError } from '../utils/AppError.js';

export const listMembers = catchAsync(async (req, res) => {
  const members = await ProjectMember.find({ project: req.project._id }).populate('user', 'name email avatarUrl');

  return success(res, {
    message: 'Members retrieved',
    data: {
      members: members.map((m) => ({
        id: m._id,
        role: m.role,
        joinedAt: m.joinedAt,
        user: { id: m.user._id, name: m.user.name, email: m.user.email, avatarUrl: m.user.avatarUrl },
      })),
    },
  });
});

export const inviteMember = catchAsync(async (req, res) => {
  const { email, role } = req.body;

  // Kept simple for now: the invited user must already have a DevTrace account.
  // A pending-invite-by-email flow (with an invite token + signup redirect)
  // is a natural extension point here later without changing this route's shape.
  const invitedUser = await User.findOne({ email });
  if (!invitedUser) {
    throw new NotFoundError('No DevTrace account exists with that email yet. Ask them to sign up first.');
  }

  const existingMembership = await ProjectMember.findOne({ project: req.project._id, user: invitedUser._id });
  if (existingMembership) {
    throw new ConflictError('This user is already a member of the project');
  }

  const membership = await ProjectMember.create({
    project: req.project._id,
    user: invitedUser._id,
    role,
  });

  return success(res, {
    statusCode: 201,
    message: 'Member added',
    data: {
      member: {
        id: membership._id,
        role: membership.role,
        joinedAt: membership.joinedAt,
        user: { id: invitedUser._id, name: invitedUser.name, email: invitedUser.email },
      },
    },
  });
});

export const updateMemberRole = catchAsync(async (req, res) => {
  const { memberId } = req.params;
  const { role } = req.body;

  const membership = await ProjectMember.findOne({ _id: memberId, project: req.project._id });
  if (!membership) {
    throw new NotFoundError('Member not found on this project');
  }
  if (membership.role === 'owner') {
    throw new AuthorizationError("The project owner's role cannot be changed. Transfer ownership instead.");
  }

  membership.role = role;
  await membership.save();

  return success(res, { message: 'Member role updated', data: { member: membership } });
});

export const removeMember = catchAsync(async (req, res) => {
  const { memberId } = req.params;

  const membership = await ProjectMember.findOne({ _id: memberId, project: req.project._id });
  if (!membership) {
    throw new NotFoundError('Member not found on this project');
  }
  if (membership.role === 'owner') {
    throw new AuthorizationError('The project owner cannot be removed from the project');
  }

  await ProjectMember.findByIdAndDelete(membership._id);

  return success(res, { message: 'Member removed' });
});

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { RoleBadge } from '../components/RoleBadge';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { useProjectMembers, useInviteMember, useUpdateMemberRole, useRemoveMember } from '../hooks/useProjects';
import { useProjectStore } from '../store/projectStore';
import { useToast } from '../components/ToastProvider';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  role: z.enum(['admin', 'developer', 'viewer']),
});

export function TeamPage() {
  const { currentProjectId } = useProjectStore();
  const { data: members, isLoading } = useProjectMembers(currentProjectId);
  const inviteMutation = useInviteMember(currentProjectId);
  const updateRoleMutation = useUpdateMemberRole(currentProjectId);
  const removeMutation = useRemoveMember(currentProjectId);
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { role: 'developer' } });

  if (!currentProjectId) {
    return <EmptyState icon={Users} title="Select a project" description="Choose a project from the switcher above to manage its team." />;
  }

  const onSubmit = (values) => {
    inviteMutation.mutate(values, {
      onSuccess: () => {
        showToast('Member added', 'success');
        reset();
        setIsModalOpen(false);
      },
      onError: (err) => showToast(err.response?.data?.message || 'Failed to add member', 'error'),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Team</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <UserPlus className="h-4 w-4" /> Invite member
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : !members?.length ? (
          <EmptyState title="No members yet" />
        ) : (
          <div className="flex flex-col divide-y divide-surface-border">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{member.user.name}</p>
                  <p className="text-xs text-gray-500">{member.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {member.role === 'owner' ? (
                    <RoleBadge role="owner" />
                  ) : (
                    <Select
                      value={member.role}
                      onChange={(e) => updateRoleMutation.mutate({ memberId: member.id, role: e.target.value })}
                      className="!py-1 text-xs"
                    >
                      <option value="admin">Admin</option>
                      <option value="developer">Developer</option>
                      <option value="viewer">Viewer</option>
                    </Select>
                  )}
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => removeMutation.mutate(member.id)}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invite a team member">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Email" type="email" placeholder="teammate@company.com" {...register('email')} error={errors.email?.message} />
          <Select label="Role" {...register('role')}>
            <option value="admin">Admin</option>
            <option value="developer">Developer</option>
            <option value="viewer">Viewer</option>
          </Select>
          <p className="text-xs text-gray-500">They must already have a DevTrace account with this email.</p>
          <Button type="submit" isLoading={inviteMutation.isPending} className="w-full">
            Add member
          </Button>
        </form>
      </Modal>
    </div>
  );
}

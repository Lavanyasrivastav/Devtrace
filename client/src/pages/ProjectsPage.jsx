import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, Archive, ArchiveRestore } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { useProjects, useCreateProject, useArchiveProject } from '../hooks/useProjects';
import { useProjectStore } from '../store/projectStore';
import { useToast } from '../components/ToastProvider';

const schema = z.object({
  name: z.string().min(2, 'At least 2 characters'),
  description: z.string().optional(),
  environment: z.enum(['development', 'staging', 'production']),
});

export function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createMutation = useCreateProject();
  const archiveMutation = useArchiveProject();
  const { setCurrentProjectId } = useProjectStore();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { environment: 'development' } });

  const onSubmit = (values) => {
    createMutation.mutate(values, {
      onSuccess: (res) => {
        setNewApiKey(res.data.apiKey);
        reset();
        showToast('Project created', 'success');
      },
      onError: () => showToast('Failed to create project', 'error'),
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewApiKey(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : !projects?.length ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to get an ingestion key and start tracking errors."
          action={<Button onClick={() => setIsModalOpen(true)}>Create a project</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className={project.isArchived ? 'opacity-60' : ''}>
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    to={`/projects/${project.id}`}
                    onClick={() => setCurrentProjectId(project.id)}
                    className="font-medium hover:text-brand-400"
                  >
                    {project.name}
                  </Link>
                  <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">{project.environment}</p>
                </div>
                <button
                  onClick={() => archiveMutation.mutate(project.id)}
                  className="text-gray-500 hover:text-gray-300"
                  title={project.isArchived ? 'Unarchive' : 'Archive'}
                >
                  {project.isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                </button>
              </div>
              {project.description && <p className="mt-3 text-sm text-gray-400">{project.description}</p>}
              <p className="mt-3 truncate font-mono text-xs text-gray-600">{project.apiKeyPrefix}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={newApiKey ? 'Project created' : 'New project'}>
        {newApiKey ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-400">
              Copy your API key now — it won't be shown again. You can always generate a new one later from project settings.
            </p>
            <div className="break-all rounded-lg border border-surface-border bg-surface p-3 font-mono text-xs text-brand-400">
              {newApiKey}
            </div>
            <Button onClick={closeModal} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Name" placeholder="My App" {...register('name')} error={errors.name?.message} />
            <Input label="Description (optional)" placeholder="What this project does" {...register('description')} />
            <Select label="Environment" {...register('environment')}>
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </Select>
            <Button type="submit" isLoading={createMutation.isPending} className="w-full">
              Create project
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}

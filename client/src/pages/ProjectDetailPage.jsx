import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Key, Trash2, RefreshCw } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { useProject, useRegenerateKey } from '../hooks/useProjects';
import { projectsApi } from '../api/projects';
import { useToast } from '../components/ToastProvider';
import { useQueryClient } from '@tanstack/react-query';

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useProject(id);
  const regenerateMutation = useRegenerateKey();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [revealedKey, setRevealedKey] = useState(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  const project = data?.project;
  const myRole = data?.myRole;
  const canManage = myRole === 'owner' || myRole === 'admin';

  const handleRegenerate = () => {
    regenerateMutation.mutate(id, {
      onSuccess: (res) => {
        setRevealedKey(res.data.apiKey);
        showToast('API key regenerated — update your SDK config', 'success');
      },
    });
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    await projectsApi.remove(id);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    showToast('Project deleted', 'success');
    navigate('/projects');
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{project.name}</h1>
        <p className="text-sm text-gray-500">{project.description || 'No description'}</p>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-300">Details</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-gray-500">Environment</dt>
          <dd className="capitalize">{project.environment}</dd>
          <dt className="text-gray-500">Your role</dt>
          <dd className="capitalize">{myRole}</dd>
          <dt className="text-gray-500">Created</dt>
          <dd>{new Date(project.createdAt).toLocaleDateString()}</dd>
        </dl>
      </Card>

      <Card>
        <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-300">
          <Key className="h-4 w-4" /> Ingestion API Key
        </h2>
        <p className="mb-3 text-sm text-gray-500">
          Send errors to <code className="text-gray-400">POST /api/ingest/error</code> using this key.
        </p>
        <div className="mb-3 break-all rounded-lg border border-surface-border bg-surface p-3 font-mono text-xs text-gray-400">
          {revealedKey || project.apiKeyPrefix}
        </div>
        {revealedKey && (
          <p className="mb-3 text-xs text-yellow-400">
            Copy this now — it won't be shown again after you leave this page.
          </p>
        )}
        {canManage && (
          <Button variant="secondary" onClick={handleRegenerate} isLoading={regenerateMutation.isPending}>
            <RefreshCw className="h-4 w-4" /> Regenerate key
          </Button>
        )}
      </Card>

      {myRole === 'owner' && (
        <Card className="border-red-500/30">
          <h2 className="mb-1 text-sm font-semibold text-red-400">Danger zone</h2>
          <p className="mb-3 text-sm text-gray-500">Deleting a project removes all its errors and monitors permanently.</p>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" /> Delete project
          </Button>
        </Card>
      )}
    </div>
  );
}

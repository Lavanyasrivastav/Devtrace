import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Plus, Activity, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { MonitorStatusBadge } from '../components/MonitorStatusBadge';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { useMonitors, useMonitorResults, useCreateMonitor, useDeleteMonitor } from '../hooks/useMonitors';
import { useProjectStore } from '../store/projectStore';
import { useToast } from '../components/ToastProvider';

const schema = z.object({
  name: z.string().min(2, 'At least 2 characters'),
  url: z.string().url('Must be a valid URL'),
  method: z.enum(['GET', 'POST', 'HEAD', 'PUT']),
  expectedStatus: z.coerce.number().int().min(100).max(599),
  intervalSeconds: z.coerce.number().int().min(30),
});

function MonitorRow({ monitor, onSelect, isSelected }) {
  return (
    <button
      onClick={() => onSelect(monitor.id)}
      className={`flex w-full items-center justify-between px-5 py-4 text-left hover:bg-surface ${isSelected ? 'bg-surface' : ''}`}
    >
      <div>
        <p className="text-sm font-medium">{monitor.name}</p>
        <p className="mt-0.5 truncate text-xs text-gray-500">{monitor.url}</p>
      </div>
      <MonitorStatusBadge status={monitor.currentStatus} />
    </button>
  );
}

export function MonitorsPage() {
  const { currentProjectId } = useProjectStore();
  const { data: monitors, isLoading } = useMonitors(currentProjectId);
  const createMutation = useCreateMonitor();
  const deleteMutation = useDeleteMonitor();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { data: resultsData, isLoading: resultsLoading } = useMonitorResults(selectedId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { method: 'GET', expectedStatus: 200, intervalSeconds: 300 },
  });

  const onSubmit = (values) => {
    createMutation.mutate(
      { ...values, projectId: currentProjectId },
      {
        onSuccess: () => {
          showToast('Monitor created — first check runs within 30s', 'success');
          reset();
          setIsModalOpen(false);
        },
        onError: (err) => showToast(err.response?.data?.message || 'Failed to create monitor', 'error'),
      }
    );
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this monitor?')) return;
    deleteMutation.mutate(id, { onSuccess: () => setSelectedId(null) });
  };

  const chartData =
    resultsData?.results
      .slice()
      .reverse()
      .map((r) => ({
        time: new Date(r.checkedAt).toLocaleTimeString(),
        responseTimeMs: r.responseTimeMs,
      })) || [];

  if (!currentProjectId) {
    return <EmptyState icon={Activity} title="Select a project" description="Choose a project from the switcher above to manage its monitors." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Monitors</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" /> New Monitor
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-0 lg:col-span-1">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : !monitors?.length ? (
            <div className="p-6">
              <EmptyState icon={Activity} title="No monitors yet" description="Add a URL to start tracking uptime." />
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-surface-border">
              {monitors.map((monitor) => (
                <MonitorRow key={monitor.id} monitor={monitor} onSelect={setSelectedId} isSelected={selectedId === monitor.id} />
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          {!selectedId ? (
            <EmptyState title="Select a monitor to see its history" />
          ) : resultsLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wide text-gray-500">Uptime</span>
                  <p className="text-lg font-semibold">{resultsData?.uptimePercentage ?? '—'}%</p>
                </div>
                <Button variant="danger" onClick={() => handleDelete(selectedId)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
              {chartData.length === 0 ? (
                <EmptyState title="No checks recorded yet" description="Checks run automatically every interval — check back shortly." />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={11} />
                    <YAxis stroke="#6b7280" fontSize={12} unit="ms" />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="responseTimeMs" stroke="#f97316" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          )}
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New monitor">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Name" placeholder="API Health Check" {...register('name')} error={errors.name?.message} />
          <Input label="URL" placeholder="https://api.example.com/health" {...register('url')} error={errors.url?.message} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Method" {...register('method')}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="HEAD">HEAD</option>
              <option value="PUT">PUT</option>
            </Select>
            <Input label="Expected status" type="number" {...register('expectedStatus')} error={errors.expectedStatus?.message} />
          </div>
          <Input label="Check interval (seconds)" type="number" {...register('intervalSeconds')} error={errors.intervalSeconds?.message} />
          <Button type="submit" isLoading={createMutation.isPending} className="w-full">
            Create monitor
          </Button>
        </form>
      </Modal>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, EyeOff, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { Tabs } from '../components/Tabs';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { useErrorDetail, useErrorOccurrences, useUpdateError } from '../hooks/useErrors';
import { useToast } from '../components/ToastProvider';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'stackTrace', label: 'Stack Trace' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'occurrences', label: 'Occurrences' },
  { value: 'activity', label: 'Activity' },
  { value: 'fixHistory', label: 'Fix History' },
];

export function ErrorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { data, isLoading } = useErrorDetail(id);
  const { data: occurrencesData, isLoading: occurrencesLoading } = useErrorOccurrences(id);
  const updateMutation = useUpdateError(id);
  const { showToast } = useToast();

  const timelinePoints = useMemo(() => {
    if (!occurrencesData?.occurrences) return [];
    // Bin occurrences by hour for a simple client-side timeline — reuses data
    // we already have rather than requiring a new backend endpoint.
    const buckets = {};
    for (const occ of occurrencesData.occurrences) {
      const key = new Date(occ.timestamp).toISOString().slice(0, 13);
      buckets[key] = (buckets[key] || 0) + 1;
    }
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => ({
        time: new Date(key + ':00:00Z').toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' }),
        count,
      }));
  }, [occurrencesData]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  const error = data?.error;

  const handleStatusChange = (status) => {
    updateMutation.mutate({ status }, { onSuccess: () => showToast(`Marked as ${status}`, 'success') });
  };

  const handleSeverityChange = (severity) => {
    updateMutation.mutate({ severity }, { onSuccess: () => showToast('Severity updated', 'success') });
  };

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => navigate('/errors')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200">
        <ArrowLeft className="h-4 w-4" /> Back to errors
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <SeverityBadge severity={error.severity} />
            <StatusBadge status={error.status} />
            {error.trend?.isSpike && <span className="text-xs font-medium text-red-400">spiking ({error.trend.rate}/hr)</span>}
          </div>
          <h1 className="text-lg font-semibold">{error.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {error.service} · {error.environment} · {error.occurrenceCount} occurrences
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={error.severity} onChange={(e) => handleSeverityChange(e.target.value)} className="w-36">
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </Select>
          {error.status !== 'resolved' && (
            <Button variant="secondary" onClick={() => handleStatusChange('resolved')}>
              <CheckCircle2 className="h-4 w-4" /> Resolve
            </Button>
          )}
          {error.status !== 'ignored' && (
            <Button variant="secondary" onClick={() => handleStatusChange('ignored')}>
              <EyeOff className="h-4 w-4" /> Ignore
            </Button>
          )}
          {error.status !== 'open' && (
            <Button variant="secondary" onClick={() => handleStatusChange('open')}>
              <RotateCcw className="h-4 w-4" /> Reopen
            </Button>
          )}
        </div>
      </div>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <Card>
          <dl className="grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-3">
            <dt className="text-gray-500">Error type</dt>
            <dd className="sm:col-span-2">{error.errorType}</dd>
            <dt className="text-gray-500">First seen</dt>
            <dd className="sm:col-span-2">{new Date(error.firstSeen).toLocaleString()}</dd>
            <dt className="text-gray-500">Last seen</dt>
            <dd className="sm:col-span-2">{new Date(error.lastSeen).toLocaleString()}</dd>
            <dt className="text-gray-500">Occurrences</dt>
            <dd className="sm:col-span-2">{error.occurrenceCount}</dd>
          </dl>
        </Card>
      )}

      {activeTab === 'stackTrace' && (
        <Card>
          {data.sampleStackTrace ? (
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-gray-300">{data.sampleStackTrace}</pre>
          ) : (
            <EmptyState title="No stack trace available for this error" />
          )}
        </Card>
      )}

      {activeTab === 'timeline' && (
        <Card>
          {occurrencesLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner />
            </div>
          ) : timelinePoints.length === 0 ? (
            <EmptyState title="Not enough data for a timeline yet" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timelinePoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }} />
                <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      )}

      {activeTab === 'occurrences' && (
        <Card className="p-0">
          {occurrencesLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : !occurrencesData?.occurrences.length ? (
            <div className="p-6">
              <EmptyState title="No occurrences recorded" />
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-surface-border">
              {occurrencesData.occurrences.map((occ) => (
                <div key={occ._id} className="px-5 py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">{new Date(occ.timestamp).toLocaleString()}</span>
                    <span className="text-xs text-gray-500">{occ.metadata?.statusCode || ''}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-gray-500">{occ.message}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card>
          <EmptyState
            title="Activity log coming soon"
            description="Comment threads and status-change history are planned for the collaboration feature set — not built yet."
          />
        </Card>
      )}

      {activeTab === 'fixHistory' && (
        <Card>
          <EmptyState
            title="Fix history coming soon"
            description="Recording root cause, fix descriptions, and PR links is planned for the collaboration feature set — not built yet."
          />
        </Card>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid } from 'recharts';
import { Bug, AlertTriangle, CheckCircle2, Flame, TrendingUp } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { Card } from '../components/Card';
import { SeverityBadge } from '../components/SeverityBadge';
import { Select } from '../components/Select';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { useOverview, useFrequency, useBySeverity, useTopErrors } from '../hooks/useAnalytics';
import { useProjectStore } from '../store/projectStore';
import { useProjectSocket } from '../hooks/useProjectSocket';
import { useToast } from '../components/ToastProvider';

const SEVERITY_COLORS = { critical: '#f87171', error: '#fb923c', warning: '#facc15', info: '#60a5fa' };

export function DashboardPage() {
  const { currentProjectId } = useProjectStore();
  const [range, setRange] = useState('7d');
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: overview, isLoading: overviewLoading } = useOverview(currentProjectId);
  const { data: frequency, isLoading: frequencyLoading } = useFrequency(currentProjectId, range);
  const { data: bySeverity } = useBySeverity(currentProjectId);
  const { data: topErrors, isLoading: topErrorsLoading } = useTopErrors(currentProjectId, 5);

  useProjectSocket(currentProjectId, {
    'error:ingested': () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      showToast('New error received', 'info');
    },
    'error:spikeDetected': (errorGroup) => {
      showToast(`Spike detected: ${errorGroup.title}`, 'warning');
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    'monitor:statusChanged': (monitor) => {
      showToast(`Monitor "${monitor.name}" is now ${monitor.currentStatus}`, monitor.currentStatus === 'up' ? 'success' : 'error');
    },
  });

  const severityChartData = bySeverity
    ? Object.entries(bySeverity).map(([severity, count]) => ({ severity, count }))
    : [];

  const frequencyChartData =
    frequency?.points.map((p) => ({
      time: new Date(p.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count: p.count,
    })) || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Select value={range} onChange={(e) => setRange(e.target.value)} className="w-36">
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </Select>
      </div>

      {overviewLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard label="Total Errors" value={overview?.totalErrors ?? 0} icon={Bug} />
          <MetricCard label="Unresolved" value={overview?.unresolvedErrors ?? 0} icon={AlertTriangle} accent="text-brand-500" />
          <MetricCard label="Critical" value={overview?.criticalErrors ?? 0} icon={Flame} accent="text-red-500" />
          <MetricCard label="Resolved" value={overview?.resolvedErrors ?? 0} icon={CheckCircle2} accent="text-green-500" />
          <MetricCard label="Errors Today" value={overview?.errorsToday ?? 0} icon={TrendingUp} />
          <MetricCard label="Error Rate / hr" value={overview?.errorRate ?? 0} icon={TrendingUp} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-gray-300">Error Frequency</h2>
          {frequencyLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner />
            </div>
          ) : frequencyChartData.length === 0 ? (
            <EmptyState title="No error activity in this range" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={frequencyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }} />
                <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-gray-300">Errors by Severity</h2>
          {severityChartData.every((d) => d.count === 0) ? (
            <EmptyState title="No open errors" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={severityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="severity" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {severityChartData.map((entry) => (
                    <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-gray-300">Most Frequent Errors</h2>
        {topErrorsLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : !topErrors?.length ? (
          <EmptyState
            title="No errors detected yet"
            description="Send your first error to see it show up here. POST to /api/ingest/error with your project's API key."
          />
        ) : (
          <div className="flex flex-col divide-y divide-surface-border">
            {topErrors.map((error) => (
              <div key={error.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={error.severity} />
                  <span className="text-sm">{error.title}</span>
                </div>
                <span className="text-xs text-gray-500">{error.occurrenceCount} occurrences</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

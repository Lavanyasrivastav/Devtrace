import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bug, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { useErrorsList } from '../hooks/useErrors';
import { useProjectStore } from '../store/projectStore';

export function ErrorsPage() {
  const { currentProjectId } = useProjectStore();
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);

  const filters = {
    ...(currentProjectId ? { projectId: currentProjectId } : {}),
    ...(search ? { search } : {}),
    ...(severity ? { severity } : {}),
    ...(status ? { status } : {}),
    sortBy,
    page,
    limit: 20,
  };

  const { data, isLoading, isFetching } = useErrorsList(filters);
  const errors = data?.errors || [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Errors</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search errors..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }} className="w-40">
          <option value="">All severities</option>
          <option value="critical">Critical</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </Select>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="ignored">Ignored</option>
        </Select>
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-44">
          <option value="recent">Most recent</option>
          <option value="frequent">Most frequent</option>
          <option value="critical">Most critical</option>
          <option value="oldest">Oldest</option>
        </Select>
      </div>

      <Card className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : !errors.length ? (
          <div className="p-6">
            <EmptyState
              icon={Bug}
              title="No errors detected yet"
              description={`Send your first error: POST to /api/ingest/error with { "projectKey": "<your key>", "message": "...", "severity": "error" }`}
            />
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-surface-border">
            {errors.map((error) => (
              <Link
                key={error.id}
                to={`/errors/${error.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{error.title}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {error.service} · {error.environment} · last seen {new Date(error.lastSeen).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {error.trend?.isSpike && (
                    <span className="text-xs font-medium text-red-400">spiking</span>
                  )}
                  <span className="text-xs text-gray-500">{error.occurrenceCount}×</span>
                  <SeverityBadge severity={error.severity} />
                  <StatusBadge status={error.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              disabled={page >= pagination.totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

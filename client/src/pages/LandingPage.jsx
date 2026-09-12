import { Link } from 'react-router-dom';
import { Bug, Activity, Users, GitBranch, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    icon: Bug,
    title: 'Automatic error grouping',
    description: 'Similar errors collapse into one issue automatically, even when the details differ — no more triaging duplicates.',
  },
  {
    icon: Activity,
    title: 'Uptime monitoring',
    description: 'Track your APIs alongside your errors, with response time history and uptime percentages in one place.',
  },
  {
    icon: Users,
    title: 'Team workspace',
    description: 'Invite your team, assign issues, and track who resolved what — with role-based permissions built in.',
  },
];

export function LandingPage() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Know about errors <span className="text-brand-500">before your users do</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-gray-400">
          DevTrace groups, tracks, and helps you resolve application errors — with real-time alerts and a knowledge
          base of past fixes.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Get started free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-surface-border px-5 py-2.5 text-sm font-medium text-gray-200 hover:bg-surface-raised"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-xl border border-surface-border bg-surface-raised p-6">
            <Icon className="mb-3 h-6 w-6 text-brand-500" />
            <h3 className="mb-2 font-semibold">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-surface-border py-16 text-center">
        <GitBranch className="mx-auto mb-3 h-6 w-6 text-gray-600" />
        <h2 className="mb-2 text-xl font-semibold">Send your first error in one request</h2>
        <p className="mx-auto max-w-md text-sm text-gray-400">
          Create a project, grab your ingestion key, and POST your first error to start seeing it grouped and
          tracked immediately.
        </p>
      </section>
    </div>
  );
}

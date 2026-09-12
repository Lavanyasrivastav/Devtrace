import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/useAuth';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-300">Profile</h2>
        <dl className="grid grid-cols-3 gap-y-2 text-sm">
          <dt className="text-gray-500">Name</dt>
          <dd className="col-span-2">{user?.name}</dd>
          <dt className="text-gray-500">Email</dt>
          <dd className="col-span-2">{user?.email}</dd>
        </dl>
      </Card>

      <Card>
        <h2 className="mb-1 text-sm font-semibold text-gray-300">Session</h2>
        <p className="mb-3 text-sm text-gray-500">Log out of DevTrace on this device.</p>
        <Button variant="danger" onClick={() => logoutMutation.mutate()}>
          Log out
        </Button>
      </Card>
    </div>
  );
}

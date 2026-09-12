import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useLogin } from '../hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });
  const loginMutation = useLogin();

  const onSubmit = (values) => loginMutation.mutate(values);

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold">Welcome back</h1>
      <p className="mb-6 text-sm text-gray-400">Log in to your DevTrace account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Email" type="email" placeholder="you@company.com" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />

        {loginMutation.isError && (
          <p className="text-sm text-red-400">
            {loginMutation.error?.response?.data?.message || 'Something went wrong. Please try again.'}
          </p>
        )}

        <Button type="submit" isLoading={loginMutation.isPending} className="w-full">
          Log in
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-400 hover:text-brand-300">
          Sign up
        </Link>
      </p>
    </div>
  );
}

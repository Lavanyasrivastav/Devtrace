import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useRegister } from '../hooks/useAuth';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Needs an uppercase letter')
    .regex(/[a-z]/, 'Needs a lowercase letter')
    .regex(/[0-9]/, 'Needs a number'),
});

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });
  const registerMutation = useRegister();

  const onSubmit = (values) => registerMutation.mutate(values);

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold">Create your account</h1>
      <p className="mb-6 text-sm text-gray-400">Start tracking errors in minutes</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Name" placeholder="Ada Lovelace" {...register('name')} error={errors.name?.message} />
        <Input label="Email" type="email" placeholder="you@company.com" {...register('email')} error={errors.email?.message} />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />

        {registerMutation.isError && (
          <p className="text-sm text-red-400">
            {registerMutation.error?.response?.data?.message || 'Something went wrong. Please try again.'}
          </p>
        )}

        <Button type="submit" isLoading={registerMutation.isPending} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300">
          Log in
        </Link>
      </p>
    </div>
  );
}

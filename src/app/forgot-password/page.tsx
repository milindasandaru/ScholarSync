'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestPasswordResetOtp, resetPasswordWithOtp } from '@/actions/auth.actions';

const requestOtpSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

const resetSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type RequestOtpValues = z.infer<typeof requestOtpSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const requestForm = useForm<RequestOtpValues>({
    resolver: zodResolver(requestOtpSchema),
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
  });

  const onRequestOtp = async (values: RequestOtpValues) => {
    setError('');
    setMessage('');

    const result = await requestPasswordResetOtp({ email: values.email });

    if (!result.success) {
      setError(result.message ?? 'Failed to send OTP.');
      return;
    }

    setMessage('OTP sent (mock). Check your server console for the code.');
    resetForm.setValue('email', values.email);
    setStep('reset');
  };

  const onResetPassword = async (values: ResetValues) => {
    setError('');
    setMessage('');

    const result = await resetPasswordWithOtp(values);

    if (!result.success) {
      setError(result.message ?? 'Failed to reset password.');
      return;
    }

    setMessage('Password updated successfully. You can now sign in.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'request' ? (
            <form className="space-y-3" onSubmit={requestForm.handleSubmit(onRequestOtp)}>
              <p className="text-sm text-muted-foreground">
                Enter your email to generate a 6-digit OTP.
              </p>

              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...requestForm.register('email')}
                />
                {requestForm.formState.errors.email ? (
                  <p className="text-xs text-destructive">
                    {requestForm.formState.errors.email.message}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={requestForm.formState.isSubmitting}
              >
                {requestForm.formState.isSubmitting ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={resetForm.handleSubmit(onResetPassword)}>
              <p className="text-sm text-muted-foreground">Enter the OTP and your new password.</p>

              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" {...resetForm.register('email')} />
                {resetForm.formState.errors.email ? (
                  <p className="text-xs text-destructive">
                    {resetForm.formState.errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">6-digit OTP</label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  {...resetForm.register('otp')}
                />
                {resetForm.formState.errors.otp ? (
                  <p className="text-xs text-destructive">
                    {resetForm.formState.errors.otp.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  placeholder="New password"
                  {...resetForm.register('newPassword')}
                />
                {resetForm.formState.errors.newPassword ? (
                  <p className="text-xs text-destructive">
                    {resetForm.formState.errors.newPassword.message}
                  </p>
                ) : null}
              </div>

              <Button type="submit" className="w-full" disabled={resetForm.formState.isSubmitting}>
                {resetForm.formState.isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          {message ? <p className="text-sm text-green-600">{message}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <p className="text-sm text-muted-foreground">
            Back to{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

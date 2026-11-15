'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Hammer, ArrowLeft, MailCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please provide a valid email address.');
      return;
    }

    setIsLoading(true);
    // Simulate reset link sending
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="flex-1 min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="h-9 w-9 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg shadow-slate-950/15">
              <Hammer className="h-5 w-5 text-amber-400" />
            </div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">
              Build<span className="text-amber-500">ora</span>
            </span>
          </Link>
        </div>

        {/* Forgot Password Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Reset Password</CardTitle>
            <CardDescription>We will send you a password reset link to your email</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <MailCheck className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">Check Your Email</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    A password reset instructions link has been sent to <span className="font-bold text-slate-700">{email}</span>.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <Link href="/login" className="inline-flex items-center text-xs font-bold text-slate-950 hover:underline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Registered Email Address"
                  type="email"
                  placeholder="e.g. architect@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
                    {error}
                  </div>
                )}

                <Button type="submit" loading={isLoading} className="w-full">
                  Send Instructions
                </Button>

                <div className="pt-2 text-center border-t border-slate-100 mt-4">
                  <Link href="/login" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 hover:underline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

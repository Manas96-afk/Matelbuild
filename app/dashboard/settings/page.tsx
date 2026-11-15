'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/auth';
import { db } from '../../../lib/db';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Cloud, CloudOff, Database, ShieldAlert, Key, User, Info, FileSpreadsheet, Check } from 'lucide-react';

export default function SettingsPage() {
  const { user, isSupabaseMode } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const updated = await db.updateProfile(user.id, { name });
      if (updated) {
        setSuccessMsg('Profile updated successfully! Refreshing dashboard...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setErrorMsg('Failed to update profile. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Account Details & Profile Editor */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-slate-800" />
              <span>User Profile Details</span>
            </CardTitle>
            <CardDescription>Manage your personal profile and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleProfileSave} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="space-y-1">
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wide">Email Address</span>
                <p className="font-bold text-slate-700 text-xs px-1.5 py-1 bg-slate-50 border border-slate-100 rounded-lg">{user?.email || 'user@example.com'}</p>
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-semibold flex items-center space-x-1.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-250 text-red-800 text-xs rounded-xl font-semibold">
                  {errorMsg}
                </div>
              )}

              <Button type="submit" loading={isSaving} className="w-full text-xs">
                Save Profile Name
              </Button>
            </form>

            <div className="border-t border-slate-100 pt-4 text-3xs text-slate-400">
              Registered since:{' '}
              <span className="font-bold text-slate-500">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'June 27, 2026'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Database Integration Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2.5">
              <Database className="h-5 w-5 text-slate-800" />
              <span>Database Connection Status</span>
            </CardTitle>
            <CardDescription>
              Configure cloud syncing to save project histories across multiple devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {isSupabaseMode ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start space-x-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <Cloud className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <span className="font-extrabold text-emerald-950 uppercase tracking-wide block">
                    Supabase Cloud Connected
                  </span>
                  <p className="text-emerald-800 leading-relaxed">
                    Your project is successfully synced to the cloud database. User authentication, project histories, and updates are secure and live.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <CloudOff className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wide block">
                      LocalStorage Fallback Mode Active
                    </span>
                    <p className="text-slate-500 leading-relaxed">
                      Estimations are stored locally in this browser. To upgrade to a production database, configure Supabase credentials in your project&apos;s environment variables.
                    </p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="border-t border-slate-200/60 pt-4 space-y-3.5 text-xs text-slate-600">
                  <span className="font-bold text-slate-700 flex items-center space-x-2">
                    <Key className="h-4 w-4 text-amber-500" />
                    <span>Setup Production Database Connection</span>
                  </span>
                  <p className="leading-relaxed">
                    Copy the schema setup from <code className="bg-slate-100 px-1 py-0.5 rounded text-red-600 font-mono text-[11px]">lib/db/schema.sql</code> and execute it in your Supabase SQL Editor. Then, create a <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono text-[11px]">.env.local</code> file in the project root containing:
                  </p>
                  <pre className="bg-slate-900 text-slate-350 p-4 rounded-xl text-3xs font-mono overflow-x-auto leading-relaxed">
{`NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here`}
                  </pre>
                  <div className="flex items-center space-x-2 text-3xs text-amber-600 font-semibold bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">
                    <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                    <span>Note: Restart your local development server after changing environment variables.</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Pricing Benchmarks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-slate-800" />
            <span>Material & Labour Cost Benchmarks</span>
          </CardTitle>
          <CardDescription>
            Reference rates and pricing constants resolved via the Pricing and Cost Engines (India context).
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-2xs border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5">Material</th>
                <th className="py-2.5 text-right">Economy Rate</th>
                <th className="py-2.5 text-right">Standard Rate</th>
                <th className="py-2.5 text-right">Premium Rate</th>
                <th className="py-2.5 text-right">Luxury Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
              <tr>
                <td className="py-3 font-bold text-slate-800">Cement (per bag)</td>
                <td className="py-3 text-right text-slate-500">₹350</td>
                <td className="py-3 text-right text-slate-850">₹400</td>
                <td className="py-3 text-right text-slate-500">₹500</td>
                <td className="py-3 text-right text-indigo-600">₹650</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-800">Sand (per CFT)</td>
                <td className="py-3 text-right text-slate-500">₹50</td>
                <td className="py-3 text-right text-slate-850">₹60</td>
                <td className="py-3 text-right text-slate-500">₹75</td>
                <td className="py-3 text-right text-indigo-600">₹95</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-800">Aggregate (per CFT)</td>
                <td className="py-3 text-right text-slate-500">₹55</td>
                <td className="py-3 text-right text-slate-850">₹65</td>
                <td className="py-3 text-right text-slate-500">₹75</td>
                <td className="py-3 text-right text-indigo-600">₹90</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-800">Steel (per MT)</td>
                <td className="py-3 text-right text-slate-500">₹55,000</td>
                <td className="py-3 text-right text-slate-850">₹65,000</td>
                <td className="py-3 text-right text-slate-500">₹75,000</td>
                <td className="py-3 text-right text-indigo-600">₹90,000</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-800">Red Bricks (per brick)</td>
                <td className="py-3 text-right text-slate-500">₹7</td>
                <td className="py-3 text-right text-slate-850">₹8</td>
                <td className="py-3 text-right text-slate-500">₹9</td>
                <td className="py-3 text-right text-indigo-600">₹12</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-800">AAC Blocks (per block)</td>
                <td className="py-3 text-right text-slate-500">₹50</td>
                <td className="py-3 text-right text-slate-850">₹60</td>
                <td className="py-3 text-right text-slate-500">₹70</td>
                <td className="py-3 text-right text-indigo-600">₹85</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-800">Paint (per liter)</td>
                <td className="py-3 text-right text-slate-500">₹250</td>
                <td className="py-3 text-right text-slate-850">₹300</td>
                <td className="py-3 text-right text-slate-500">₹400</td>
                <td className="py-3 text-right text-indigo-600">₹600</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-800">Tiles (per Sq.Ft)</td>
                <td className="py-3 text-right text-slate-500">₹70</td>
                <td className="py-3 text-right text-slate-850">₹85</td>
                <td className="py-3 text-right text-slate-500">₹105</td>
                <td className="py-3 text-right text-indigo-600">₹150</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-800">Labour (per Sq.Ft BUA)</td>
                <td className="py-3 text-right text-slate-500">₹300</td>
                <td className="py-3 text-right text-slate-850">₹400</td>
                <td className="py-3 text-right text-slate-500">₹500</td>
                <td className="py-3 text-right text-indigo-600">₹700</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 flex items-start space-x-2 text-3xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-normal">
            <Info className="h-4.5 w-4.5 text-slate-400 flex-shrink-0" />
            <span>Unit rate values are resolved dynamically from rate cards depending on the country selected for the project. The table above displays benchmarks resolved for India.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

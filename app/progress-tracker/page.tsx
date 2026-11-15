'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/dashboard/Sidebar';
import { Header } from '../../components/dashboard/Header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Activity, Clock, CheckCircle2, ChevronRight, BarChart3, Info } from 'lucide-react';

export default function ProgressTrackerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const phases = [
    { name: 'Excavation & Ground Cleansing', duration: 'Week 1-2', status: 'Completed', progress: 100 },
    { name: 'Foundation Footing & Concrete casting', duration: 'Week 3-5', status: 'Completed', progress: 100 },
    { name: 'Pillar Columns & Beam Framing', duration: 'Week 6-8', status: 'Active', progress: 65 },
    { name: 'Brickwork Masonry & Partition Walls', duration: 'Week 9-11', status: 'Scheduled', progress: 0 },
    { name: 'Electrical conduits & Plumbing conduits', duration: 'Week 12-13', status: 'Scheduled', progress: 0 },
    { name: 'Plaster Coating & Finishings', duration: 'Week 14-16', status: 'Scheduled', progress: 0 },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/40">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} title="Construction Progress Tracker" />

        {/* Content canvas */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            
            {/* Roadmap Banner */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden shadow-xl shadow-slate-950/10">
              <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/10 rounded-full blur-2xl translate-x-12 -translate-y-12" />
              <div className="space-y-1 z-10">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-500 text-white uppercase tracking-wider mb-2">
                  <Activity className="h-3 w-3 animate-pulse" />
                  <span>Timeline Tracker Beta</span>
                </span>
                <h2 className="text-lg font-bold">Structural Timeline & Material Variance logs</h2>
                <p className="text-2xs text-slate-400 max-w-lg leading-relaxed">
                  Future Integration: Monitor construction progress in real-time. Log daily activities, audit materials used (vs. calculations), and update schedules.
                </p>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Timeline list (Mock) */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                    <Clock className="h-4.5 w-4.5 text-slate-500" />
                    <span>Project Phases</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {phases.map((phase, idx) => (
                    <div 
                      key={phase.name} 
                      className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors ${
                        phase.status === 'Active' 
                          ? 'border-indigo-150 bg-indigo-50/20' 
                          : phase.status === 'Completed'
                            ? 'border-slate-100 bg-slate-50/10'
                            : 'border-slate-100 bg-white opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        {phase.status === 'Completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <div className={`h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                            phase.status === 'Active' ? 'border-indigo-600 animate-pulse' : 'border-slate-300'
                          }`}>
                            {phase.status === 'Active' && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{phase.name}</h4>
                          <span className="text-3xs text-slate-400 font-medium">{phase.duration}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 flex-shrink-0">
                        {phase.status === 'Active' && (
                          <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${phase.progress}%` }} />
                          </div>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-4xs font-bold uppercase tracking-wider ${
                          phase.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : phase.status === 'Active'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-slate-100 text-slate-550'
                        }`}>
                          {phase.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Material Variance widget (Mock) */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                    <BarChart3 className="h-4.5 w-4.5 text-slate-500" />
                    <span>Material Audit Log</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between items-center text-3xs font-semibold text-slate-500 uppercase">
                        <span>Cement Consumption</span>
                        <span className="text-slate-800">420 / 500 bags Used</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 border border-slate-150 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-slate-900 h-full rounded-full" style={{ width: '84%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-3xs font-semibold text-slate-500 uppercase">
                        <span>Steel Consumption</span>
                        <span className="text-slate-800">3,800 / 5,000 kg Used</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 border border-slate-150 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-slate-900 h-full rounded-full" style={{ width: '76%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-3xs font-semibold text-slate-500 uppercase">
                        <span>Sand Consumption</span>
                        <span className="text-slate-800">2,300 / 2,250 cft Used</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 border border-slate-150 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: '100%' }} />
                      </div>
                      <span className="text-[10px] text-red-500 font-semibold mt-1 block">Variance: +50 cft (Over budget)</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 p-3 rounded-xl bg-slate-50/60 border border-slate-100 flex items-start space-x-2 text-3xs text-slate-400 leading-normal">
                    <Info className="h-4.5 w-4.5 text-slate-400 flex-shrink-0" />
                    <span>Calculated limits are synced dynamically from your Project Dashboard estimates. Overages display red flags to alert project managers.</span>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

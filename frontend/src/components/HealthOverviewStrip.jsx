import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, TestTube2, FileText, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HealthOverviewStrip() {
  const { activeMember } = useAuth();
  const [stats, setStats] = useState({
    upcomingAppointment: null,
    testsDueCount: 0,
    latestReport: null,
    loading: true
  });

  const memberQuery = activeMember ? `?family_member_id=${activeMember.id}` : '?family_member_id=self';

  useEffect(() => {
    let isMounted = true;
    async function fetchStripData() {
      try {
        const [apptsRes, testsRes, reportsRes] = await Promise.all([
          api.get(`/appointments${memberQuery}`),
          api.get(`/recommended-tests${memberQuery}&status=due`),
          api.get(`/reports${memberQuery}`)
        ]);

        if (isMounted) {
          const upcoming = apptsRes.appointments?.find(a => a.status === 'upcoming' || a.status === 'rescheduled');
          const latestRep = reportsRes.reports?.[0];
          const dueTests = testsRes.tests?.length || 0;

          setStats({
            upcomingAppointment: upcoming || null,
            testsDueCount: dueTests,
            latestReport: latestRep || null,
            loading: false
          });
        }
      } catch (err) {
        if (isMounted) setStats(prev => ({ ...prev, loading: false }));
      }
    }

    fetchStripData();
    return () => { isMounted = false; };
  }, [activeMember]);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Active Patient Summary
        </h3>
        {activeMember && (
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Records for: <strong className="text-slate-900 dark:text-slate-200">{activeMember.full_name}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* 1. Upcoming Check-up */}
        <Link
          to={stats.upcomingAppointment ? "/appointments" : "/find-doctors"}
          className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 card-hover flex items-start justify-between group transition-colors"
        >
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/40 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Next Check-up</p>
              {stats.upcomingAppointment ? (
                <>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 line-clamp-1">
                    {stats.upcomingAppointment.doctor_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {stats.upcomingAppointment.appointment_date} • {stats.upcomingAppointment.time_slot}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">No upcoming visits</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Schedule routine care</p>
                </>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all mt-1" />
        </Link>

        {/* 2. Preventive Tests Due */}
        <Link
          to="/recommended-tests"
          className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 card-hover flex items-start justify-between group transition-colors"
        >
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/40 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
              <TestTube2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preventive Care</p>
              {stats.testsDueCount > 0 ? (
                <>
                  <div className="flex items-baseline space-x-1.5 mt-0.5">
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{stats.testsDueCount}</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">screening tests due</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Review recommendations</p>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-1 mt-0.5 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Up to date</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">No overdue screenings</p>
                </>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all mt-1" />
        </Link>

        {/* 3. Recent Medical Report */}
        <Link
          to="/medical-reports"
          className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 card-hover flex items-start justify-between group transition-colors"
        >
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/40 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recent Diagnostic</p>
              {stats.latestReport ? (
                <>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 line-clamp-1">
                    {stats.latestReport.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {stats.latestReport.test_date} • {stats.latestReport.report_type}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">No reports on file</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Upload lab results & imaging</p>
                </>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all mt-1" />
        </Link>
      </div>
    </div>
  );
}

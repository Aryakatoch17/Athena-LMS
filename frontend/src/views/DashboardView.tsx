import React, { useEffect, useState, useCallback } from 'react';
import { 
  BookOpen, 
  Users, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  PlusCircle, 
  Layers, 
  RefreshCw 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { dashboardApi } from '../api/dashboard';
import { DashboardStats } from '../types';
import { formatDate, formatCurrency } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import { extractErrorMessage } from '../api/client';
import { ActiveTab } from '../components/layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenCheckout: () => void;
  onOpenAddBook: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenCheckout,
  onOpenAddBook,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { error } = useToast();

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      error('Failed to load dashboard metrics', extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const kpis = [
    {
      title: 'Total Catalog Titles',
      value: stats?.totalBooks ?? 0,
      description: `${stats?.availableCopies ?? 0} physical copies available`,
      icon: BookOpen,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Active Members',
      value: stats?.activeMembers ?? 0,
      description: 'Cardholders in good standing',
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Active Loans',
      value: stats?.booksCurrentlyBorrowed ?? 0,
      description: 'Currently in circulation',
      icon: Clock,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      title: 'Overdue Returns',
      value: stats?.overdueBooks ?? 0,
      description: 'Requiring immediate follow-up',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      alert: (stats?.overdueBooks ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-7 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Athena Core Engine
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Central Operations Hub</h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Live telemetry of catalog circulation, inventory utilization, active reader memberships, and return penalties.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            isLoading={isLoading}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={onOpenCheckout}
            className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Quick Checkout
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="relative overflow-hidden border-slate-200/90 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {kpi.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {isLoading ? '...' : kpi.value.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{kpi.description}</p>
                  </div>

                  <div className={`p-3 rounded-xl border ${kpi.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {kpi.alert && (
                  <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between text-xs text-rose-600 font-medium">
                    <span>Action required</span>
                    <button
                      onClick={() => onNavigate('transactions')}
                      className="inline-flex items-center hover:underline"
                    >
                      View Overdue <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Quick Actions & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Recent Circulation Table */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Recent Transactions</CardTitle>
                <CardDescription className="text-xs">Latest book loans and returns across branches</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('transactions')}
                className="text-xs font-semibold"
              >
                View All Transactions
              </Button>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center text-sm text-slate-500">Loading recent transactions...</div>
              ) : !stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500">No recent transactions found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Book Title</th>
                        <th className="pb-3 font-semibold">Member</th>
                        <th className="pb-3 font-semibold">Due Date</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 text-right font-semibold">Fine</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.recentTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 pr-4">
                            <p className="font-semibold text-slate-900 max-w-xs truncate">{tx.bookTitle}</p>
                            <p className="text-[10px] text-slate-400 font-mono">ISBN: {tx.bookIsbn}</p>
                          </td>
                          <td className="py-3.5 pr-4">
                            <p className="font-medium text-slate-800">{tx.memberName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{tx.membershipId}</p>
                          </td>
                          <td className="py-3.5 pr-4 text-slate-600 font-medium">
                            {formatDate(tx.dueDate)}
                          </td>
                          <td className="py-3.5 pr-4">
                            <Badge
                              variant={
                                tx.status === 'BORROWED'
                                  ? 'info'
                                  : tx.status === 'RETURNED'
                                  ? 'success'
                                  : 'destructive'
                              }
                            >
                              {tx.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 text-right font-mono font-medium text-slate-700">
                            {tx.fineAmount > 0 ? (
                              <span className="text-rose-600 font-semibold">{formatCurrency(tx.fineAmount)}</span>
                            ) : (
                              '$0.00'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 col): Fast Access Quick Actions */}
        <div className="space-y-6">
          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Desk Shortcuts</CardTitle>
              <CardDescription className="text-xs">Common librarian workflow actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={onOpenCheckout}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Process Checkout</p>
                    <p className="text-[11px] text-slate-500">Issue book loan to member</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </button>

              <button
                onClick={onOpenAddBook}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Catalog New Book</p>
                    <p className="text-[11px] text-slate-500">Add titles & physical copies</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('members')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Register Cardholder</p>
                    <p className="text-[11px] text-slate-500">Enroll new patron account</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>
            </CardContent>
          </Card>

          {/* Quick System Summary Card */}
          <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Enterprise Architecture</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Powered by Spring Boot 3, Hibernate JPA, PostgreSQL relational integrity constraints, and React Query frontend.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};


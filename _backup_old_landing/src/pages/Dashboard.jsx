import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useCurrency } from '../context/CurrencyContext';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  DollarSign,
  Megaphone,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PALETTE = [
  '#939BFF',
  '#C4B5F4',
  '#AEE9FF',
  '#B6EADA',
  '#7B99D9',
];

const ALL_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const activityIcon = {
  invoice: '💳',
  task: '✅',
  employee: '👤',
  campaign: '📣',
  project: '📁',
};

const StatCard = ({
  title,
  value,
  sub,
  icon: Icon,
  color,
}) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass-card p-4 md:p-6 rounded-2xl flex flex-col gap-4"
  >
    <div className="flex justify-between items-start">
      <div
        className="p-3 rounded-xl"
        style={{
          background: `${color}33`,
          color: color,
        }}
      >
        <Icon size={24} />
      </div>
    </div>

    <div>
      <p className="text-slate-600 dark:text-slate-400 text-sm font-bold">
        {title}
      </p>

      <h3 className="text-2xl font-bold dark:text-white mt-1">
        {value ?? 0}
      </h3>
    </div>

    <div className="flex items-center gap-2">
      <span className="flex items-center text-xs font-bold text-emerald-500">
        <ArrowUpRight size={14} />
        {sub}
      </span>

      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
        live data
      </span>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { fmt } = useCurrency();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [chart, setChart] = useState([]);

  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const [activityError, setActivityError] = useState(false);
  const [chartError, setChartError] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      // -----------------------------
      // 1. Dashboard Stats
      // -----------------------------
      try {
        const response = await api.get('/api/dashboard/stats');

        console.log('Dashboard Stats:', response.data);

        setStats(response.data);
        setStatsError(false);
      } catch (error) {
        console.error(
          'Dashboard Stats API Error:',
          error
        );

        console.error(
          'Status:',
          error?.response?.status
        );

        console.error(
          'Response:',
          error?.response?.data
        );

        setStatsError(true);

        // Default values so UI doesn't crash
        setStats({
          totalRevenue: 0,
          netProfit: 0,
          totalEmployees: 0,
          activeProjects: 0,
          openTasks: 0,
          pendingInvoices: 0,
          activeCampaigns: 0,
          totalExpenses: 0,
        });
      }

      // -----------------------------
      // 2. Recent Activity
      // -----------------------------
      try {
        const response = await api.get(
          '/api/dashboard/recent-activity'
        );

        console.log(
          'Recent Activity:',
          response.data
        );

        setActivity(
          Array.isArray(response.data)
            ? response.data
            : []
        );

        setActivityError(false);
      } catch (error) {
        console.error(
          'Recent Activity API Error:',
          error
        );

        console.error(
          'Status:',
          error?.response?.status
        );

        console.error(
          'Response:',
          error?.response?.data
        );

        setActivity([]);
        setActivityError(true);
      }

      // -----------------------------
      // 3. Revenue Chart
      // -----------------------------
      try {
        const response = await api.get(
          '/api/dashboard/revenue-chart'
        );

        console.log(
          'Revenue Chart:',
          response.data
        );

        setChart(
          Array.isArray(response.data)
            ? response.data
            : []
        );

        setChartError(false);
      } catch (error) {
        console.error(
          'Revenue Chart API Error:',
          error
        );

        console.error(
          'Status:',
          error?.response?.status
        );

        console.error(
          'Response:',
          error?.response?.data
        );

        setChart([]);
        setChartError(true);
      }

      setLoading(false);
    };

    loadDashboard();
  }, []);

  // --------------------------------
  // Create all 12 months
  // --------------------------------
  const chartFull = ALL_MONTHS.map((month) => {
    const found = chart.find(
      (item) => item.month === month
    );

    return {
      month,
      revenue: found
        ? Number(found.revenue) || 0
        : 0,
    };
  });

  const maxRevenue = Math.max(
    ...chartFull.map(
      (item) => item.revenue
    ),
    1
  );

  // --------------------------------
  // Loading Screen
  // --------------------------------
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">

        {/* -------------------------------- */}
        {/* Header */}
        {/* -------------------------------- */}

        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold dark:text-white">
            {user?.role === 'member'
              ? 'My Dashboard'
              : 'Dashboard'}
          </h1>

          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Welcome back
            {user?.first_name
              ? `, ${user.first_name}`
              : ''}
            . Here's what's happening today.
          </p>
        </div>

        {/* -------------------------------- */}
        {/* Stats API Error */}
        {/* -------------------------------- */}

        {statsError && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              Unable to load dashboard statistics.
            </p>

            <p className="text-xs text-red-500 mt-1">
              The server returned an error while loading
              /api/dashboard/stats.
            </p>
          </div>
        )}

        {/* -------------------------------- */}
        {/* Stat Cards */}
        {/* -------------------------------- */}

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

          <StatCard
            title="Total Revenue"
            value={fmt(
              stats?.totalRevenue || 0
            )}
            sub={`${fmt(
              stats?.netProfit || 0
            )} profit`}
            icon={DollarSign}
            color="#939BFF"
          />

          <StatCard
            title="Total Employees"
            value={
              stats?.totalEmployees || 0
            }
            sub={`${stats?.activeProjects || 0} active projects`}
            icon={Users}
            color="#B6EADA"
          />

          <StatCard
            title="Open Tasks"
            value={
              stats?.openTasks || 0
            }
            sub={`${stats?.pendingInvoices || 0} pending invoices`}
            icon={TrendingUp}
            color="#7B99D9"
          />

          <StatCard
            title="Active Campaigns"
            value={
              stats?.activeCampaigns || 0
            }
            sub={`${fmt(
              stats?.totalExpenses || 0
            )} expenses`}
            icon={Megaphone}
            color="#C4B5F4"
          />

        </div>

        {/* -------------------------------- */}
        {/* Revenue + Chart */}
        {/* -------------------------------- */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Revenue Overview */}

          <div className="glass-card p-5 md:p-8 rounded-3xl min-h-[400px] flex flex-col">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">
                Revenue Overview
              </h2>
            </div>

            <div className="flex-1 flex items-center justify-center relative">

              <svg
                viewBox="0 0 100 100"
                className="w-64 h-64 -rotate-90"
              >

                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="15"
                  className="text-slate-100 dark:text-slate-800"
                />

                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#939BFF"
                  strokeWidth="15"
                  strokeDasharray="251.2"
                  strokeDashoffset="60"
                />

                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#B6EADA"
                  strokeWidth="15"
                  strokeDasharray="251.2"
                  strokeDashoffset="180"
                />

                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#7B99D9"
                  strokeWidth="15"
                  strokeDasharray="251.2"
                  strokeDashoffset="220"
                />

              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">

                <span className="text-3xl font-bold dark:text-white">
                  {fmt(
                    stats?.netProfit || 0
                  )}
                </span>

                <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                  Net Profit
                </span>

              </div>

            </div>

            {/* Legend */}

            <div className="flex flex-wrap justify-center gap-4 mt-4">

              {[
                {
                  label: 'Revenue',
                  color: '#939BFF',
                },
                {
                  label: 'Profit',
                  color: '#B6EADA',
                },
                {
                  label: 'Expenses',
                  color: '#7B99D9',
                },
              ].map((item) => (

                <div
                  key={item.label}
                  className="flex items-center gap-2"
                >

                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: item.color,
                    }}
                  />

                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {item.label}
                  </span>

                </div>

              ))}

            </div>

          </div>

          {/* -------------------------------- */}
          {/* Revenue By Month */}
          {/* -------------------------------- */}

          <div className="glass-card p-5 md:p-8 rounded-3xl min-h-[400px] flex flex-col">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-xl font-bold dark:text-white">
                Revenue by Month
              </h2>

            </div>

            {chartError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-xs text-red-500">
                  Unable to load revenue chart data.
                </p>
              </div>
            )}

            <div className="flex-1 flex flex-col justify-end gap-4 pb-2">

              {chartFull.map((item, index) => (

                <div
                  key={item.month}
                  className="flex items-center gap-4 group"
                >

                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-8">
                    {item.month}
                  </span>

                  <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">

                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${
                          (item.revenue /
                            maxRevenue) *
                          100
                        }%`,
                      }}
                      transition={{
                        duration: 1,
                        delay:
                          index * 0.1,
                      }}
                      className="h-full opacity-80 group-hover:opacity-100 transition-opacity rounded-full"
                      style={{
                        backgroundColor:
                          PALETTE[
                            index %
                              PALETTE.length
                          ],
                      }}
                    />

                  </div>

                  <span className="text-xs font-bold dark:text-white w-16 text-right">
                    {fmt(
                      item.revenue
                    )}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>

        {/* -------------------------------- */}
        {/* Recent Activity */}
        {/* -------------------------------- */}

        <div className="glass-card p-5 md:p-8 rounded-3xl">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">

              <Activity
                size={20}
                className="text-primary"
              />

              Recent Activity

            </h2>

          </div>

          {activityError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <p className="text-xs text-red-500">
                Unable to load recent activity.
              </p>
            </div>
          )}

          {activity.length === 0 ? (

            <div className="py-10 text-center">

              <p className="text-sm text-slate-500 dark:text-slate-400">
                No recent activity available.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {activity.map((item) => (

                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-xl subtle-item hover:bg-slate-200/60 dark:hover:bg-slate-800/50 transition-colors"
                >

                  <span className="text-xl shrink-0">
                    {activityIcon[
                      item.type
                    ] || '📌'}
                  </span>

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-medium dark:text-white truncate">
                      {item.message}
                    </p>

                  </div>

                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold shrink-0">
                    {item.time}
                  </span>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>
    </DashboardLayout>
  );
}
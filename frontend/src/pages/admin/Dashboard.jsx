import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import { FiUsers, FiDollarSign, FiTrendingUp, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashboardRes, analyticsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/analytics')
      ]);
      setStats(dashboardRes.data.stats);
      setAnalytics(analyticsRes.data.analytics);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of registrations and donations</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Registrations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.registrations?.total || 0}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{stats?.registrations?.today || 0} today
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FiUsers className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
            </div>
          </div>

          {/* Total Donations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats?.donations?.success?.amount || 0)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{formatCurrency(stats?.donations?.today?.total || 0)} today
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <FiDollarSign className="text-green-600 dark:text-green-400 text-xl" />
              </div>
            </div>
          </div>

          {/* Successful Payments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Successful Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.donations?.success?.count || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  of {stats?.donations?.total || 0} attempts
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 text-xl" />
              </div>
            </div>
          </div>

          {/* Pending/Failed */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pending / Failed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(stats?.donations?.pending?.count || 0)} / {(stats?.donations?.failed?.count || 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Requires attention
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <FiClock className="text-yellow-600 dark:text-yellow-400 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Registration Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Registration Trend (Last 30 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.dailyRegistrations || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="_id" 
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    tickFormatter={(value) => value.split('-').slice(1).join('/')}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip 
                    labelFormatter={(value) => `Date: ${value}`}
                    formatter={(value) => [`${value} registrations`, 'Count']}
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    fill="#93c5fd" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donation Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Donation Trend (Last 30 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.dailyDonations || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="_id" 
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    tickFormatter={(value) => value.split('-').slice(1).join('/')}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip 
                    labelFormatter={(value) => `Date: ${value}`}
                    formatter={(value, name) => [
                      name === 'amount' ? formatCurrency(value) : value,
                      name === 'amount' ? 'Amount' : 'Count'
                    ]}
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* This Week Summary */}
          <div className="bg-gradient-to-br from-primary-600 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiTrendingUp className="mr-2" />
              This Week
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-primary-100">New Registrations</span>
                <span className="font-bold">{stats?.registrations?.recentWeek || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-100">Donations Received</span>
                <span className="font-bold">{stats?.donations?.recentWeek?.count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-100">Amount Collected</span>
                <span className="font-bold">{formatCurrency(stats?.donations?.recentWeek?.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiCheckCircle className="text-green-600 dark:text-green-400" />
                  <span className="text-gray-600 dark:text-gray-300">Success</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{stats?.donations?.success?.count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiClock className="text-yellow-600 dark:text-yellow-400" />
                  <span className="text-gray-600 dark:text-gray-300">Pending</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{stats?.donations?.pending?.count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiXCircle className="text-red-600 dark:text-red-400" />
                  <span className="text-gray-600 dark:text-gray-300">Failed</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{stats?.donations?.failed?.count || 0}</span>
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">Active Users</span>
                  <span className="font-medium dark:text-white">{stats?.registrations?.active || 0}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ 
                      width: `${stats?.registrations?.total 
                        ? (stats.registrations.active / stats.registrations.total * 100) 
                        : 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stats?.registrations?.active || 0} of {stats?.registrations?.total || 0} users are active
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;

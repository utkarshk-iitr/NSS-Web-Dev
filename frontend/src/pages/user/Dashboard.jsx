import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../components/layouts/UserLayout';
import api from '../../utils/api';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import { FiHeart, FiDollarSign, FiCheckCircle, FiClock, FiXCircle, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/user/dashboard');
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </UserLayout>
    );
  }

  const { user, stats, recentDonations } = data;

  return (
    <UserLayout>
      <div className="animate-fadeIn">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here's an overview of your donation activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Donated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalAmountDonated)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiDollarSign className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Successful</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successfulDonations}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDonations}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failedDonations}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FiXCircle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Donations */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-primary-600 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Make a Donation</h3>
            <p className="text-primary-100 mb-6">
              Your contribution helps us make a positive impact in communities.
            </p>
            <Link
              to="/donate"
              className="inline-flex items-center space-x-2 bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors"
            >
              <FiHeart />
              <span>Donate Now</span>
            </Link>
          </div>

          {/* Recent Donations */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Donations</h3>
              <Link to="/donations" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1">
                <span>View All</span>
                <FiArrowRight size={14} />
              </Link>
            </div>

            {recentDonations && recentDonations.length > 0 ? (
              <div className="space-y-4">
                {recentDonations.map((donation) => (
                  <div key={donation._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        donation.status === 'success' ? 'bg-green-100' :
                        donation.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        {donation.status === 'success' ? <FiCheckCircle className="text-green-600" /> :
                         donation.status === 'pending' ? <FiClock className="text-yellow-600" /> :
                         <FiXCircle className="text-red-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{formatCurrency(donation.amount)}</p>
                        <p className="text-sm text-gray-500">{formatDate(donation.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`badge ${getStatusColor(donation.status)}`}>
                      {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiHeart className="mx-auto text-4xl text-gray-300 mb-3" />
                <p className="text-gray-500">No donations yet</p>
                <Link to="/donate" className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
                  Make your first donation
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Registration Info */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Registration Details</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Registered On</p>
              <p className="font-medium text-gray-900">{formatDate(user?.registeredAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../utils/api';
import { formatCurrency, formatDateTime, getStatusColor, exportToCSV } from '../../utils/helpers';
import { 
  FiFilter, 
  FiDownload, 
  FiChevronLeft, 
  FiChevronRight,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, [pagination.current, filters]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = { 
        page: pagination.current, 
        limit: 10,
        ...filters
      };
      
      const response = await api.get('/admin/donations', { params });
      setDonations(response.data.donations);
      setStats(response.data.stats);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/export/donations', { params: filters });
      exportToCSV(response.data.data, 'donations_export');
      toast.success('Export successful!');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const viewDonationDetails = async (donationId) => {
    try {
      const response = await api.get(`/admin/donations/${donationId}`);
      setSelectedDonation(response.data.donation);
    } catch (error) {
      toast.error('Failed to load donation details');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <FiCheckCircle className="text-green-600" />;
      case 'pending': return <FiClock className="text-yellow-600" />;
      case 'failed': return <FiXCircle className="text-red-600" />;
      default: return null;
    }
  };

  // Calculate aggregated stats
  const aggregatedStats = {
    total: stats.reduce((acc, s) => acc + (s.count || 0), 0),
    totalAmount: stats.reduce((acc, s) => s._id === 'success' ? acc + (s.totalAmount || 0) : acc, 0),
    success: stats.find(s => s._id === 'success') || { count: 0, totalAmount: 0 },
    pending: stats.find(s => s._id === 'pending') || { count: 0 },
    failed: stats.find(s => s._id === 'failed') || { count: 0 }
  };

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donation Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage all donation records</p>
          </div>
          <button
            onClick={handleExport}
            className="mt-4 md:mt-0 btn-secondary flex items-center space-x-2"
          >
            <FiDownload />
            <span>Export Data</span>
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <FiDollarSign className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Amount</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(aggregatedStats.totalAmount)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <FiCheckCircle className="text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Successful</span>
            </div>
            <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{aggregatedStats.success.count}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <FiClock className="text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
            </div>
            <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{aggregatedStats.pending.count}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <FiXCircle className="text-red-600 dark:text-red-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Failed</span>
            </div>
            <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{aggregatedStats.failed.count}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Filter by status:</span>
              {['', 'success', 'pending', 'failed'].map((status) => (
                <button
                  key={status || 'all'}
                  onClick={() => {
                    setFilters({ ...filters, status });
                    setPagination(prev => ({ ...prev, current: 1 }));
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.status === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <FiFilter />
              <span>More Filters</span>
            </button>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t dark:border-gray-700 grid md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Amount</label>
                <input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                  className="input-field"
                  placeholder="₹0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Amount</label>
                <input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                  className="input-field"
                  placeholder="₹10000"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    status: '',
                    startDate: '',
                    endDate: '',
                    minAmount: '',
                    maxAmount: ''
                  })}
                  className="btn-secondary w-full"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Donations Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : donations.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Donor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payment ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {donations.map((donation) => (
                      <tr key={donation._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{donation.user?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{donation.user?.email || '-'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(donation.amount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center space-x-1 badge ${getStatusColor(donation.status)}`}>
                            {getStatusIcon(donation.status)}
                            <span className="capitalize">{donation.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {donation.razorpayPaymentId || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDateTime(donation.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => viewDonationDetails(donation._id)}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Page {pagination.current} of {pagination.pages} ({pagination.total} total)
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                      disabled={pagination.current === 1}
                      className="p-2 rounded-lg border dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <FiChevronLeft />
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                      disabled={pagination.current === pagination.pages}
                      className="p-2 rounded-lg border dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FiDollarSign className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No donations found</p>
            </div>
          )}
        </div>

        {/* Donation Detail Modal */}
        {selectedDonation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full">
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Donation Details</h3>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedDonation.amount)}</p>
                  <span className={`inline-flex items-center space-x-1 badge ${getStatusColor(selectedDonation.status)} mt-2`}>
                    {getStatusIcon(selectedDonation.status)}
                    <span className="capitalize">{selectedDonation.status}</span>
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Donor Name</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedDonation.user?.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Email</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedDonation.user?.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Phone</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedDonation.user?.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Order ID</span>
                    <span className="font-mono text-sm text-gray-900 dark:text-white">{selectedDonation.razorpayOrderId}</span>
                  </div>
                  {selectedDonation.razorpayPaymentId && (
                    <div className="flex justify-between py-2 border-b dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Payment ID</span>
                      <span className="font-mono text-sm text-gray-900 dark:text-white">{selectedDonation.razorpayPaymentId}</span>
                    </div>
                  )}
                  {selectedDonation.receiptId && (
                    <div className="flex justify-between py-2 border-b dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Receipt ID</span>
                      <span className="font-mono text-sm text-gray-900 dark:text-white">{selectedDonation.receiptId}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Attempted At</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatDateTime(selectedDonation.attemptedAt)}</span>
                  </div>
                  {selectedDonation.completedAt && (
                    <div className="flex justify-between py-2 border-b dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Completed At</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatDateTime(selectedDonation.completedAt)}</span>
                    </div>
                  )}
                  {selectedDonation.failureReason && (
                    <div className="py-2">
                      <span className="text-gray-500 dark:text-gray-400 block mb-1">Failure Reason</span>
                      <span className="text-red-600 dark:text-red-400 text-sm">{selectedDonation.failureReason}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Donations;

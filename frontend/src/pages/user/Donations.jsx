import { useState, useEffect } from 'react';
import UserLayout from '../../components/layouts/UserLayout';
import api from '../../utils/api';
import { formatCurrency, formatDateTime, getStatusColor } from '../../utils/helpers';
import { FiFilter, FiChevronLeft, FiChevronRight, FiCheckCircle, FiClock, FiXCircle, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDonations();
  }, [pagination.current, filter]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.current, limit: 10 };
      if (filter !== 'all') params.status = filter;
      
      const response = await api.get('/user/donations', { params });
      setDonations(response.data.donations);
      setStats(response.data.stats);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (donationId) => {
    try {
      const response = await api.get(`/donation/receipt/${donationId}`);
      const receipt = response.data.receipt;
      
      // Create a simple receipt content
      const receiptContent = `
========================================
        DONATION RECEIPT
========================================

Receipt ID: ${receipt.receiptId}
Date: ${formatDateTime(receipt.date)}

Donor Information:
Name: ${receipt.donorName}
Email: ${receipt.donorEmail}

Donation Details:
Amount: ${formatCurrency(receipt.amount)}
Payment ID: ${receipt.paymentId}

Organization: ${receipt.organization}

${receipt.message}

========================================
      `;

      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `receipt_${receipt.receiptId}.txt`;
      link.click();
      
      toast.success('Receipt downloaded!');
    } catch (error) {
      toast.error('Failed to download receipt');
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

  return (
    <UserLayout>
      <div className="animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
            <p className="text-gray-500 mt-1">View your donation history and status</p>
          </div>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total Attempts</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Successful</p>
              <p className="text-xl font-bold text-green-600">{stats.success?.count || 0}</p>
              <p className="text-xs text-gray-400">{formatCurrency(stats.success?.amount || 0)}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pending?.count || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-xl font-bold text-red-600">{stats.failed?.count || 0}</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4">
            <FiFilter className="text-gray-400" />
            <span className="text-sm text-gray-500">Filter:</span>
            {['all', 'success', 'pending', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setPagination(prev => ({ ...prev, current: 1 }));
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : donations.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {donations.map((donation) => (
                      <tr key={donation._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(donation.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(donation.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 badge ${getStatusColor(donation.status)}`}>
                            {getStatusIcon(donation.status)}
                            <span>{donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {donation.razorpayPaymentId || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {donation.status === 'success' ? (
                            <button
                              onClick={() => downloadReceipt(donation._id)}
                              className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                            >
                              <FiFileText />
                              <span className="text-sm">Download</span>
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <p className="text-sm text-gray-500">
                    Showing page {pagination.current} of {pagination.pages}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                      disabled={pagination.current === 1}
                      className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <FiChevronLeft />
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                      disabled={pagination.current === pagination.pages}
                      className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FiFileText className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500">No donations found</p>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default Donations;

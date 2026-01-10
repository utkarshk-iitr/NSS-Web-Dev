import { useState, useEffect } from 'react';
import UserLayout from '../../components/layouts/UserLayout';
import api from '../../utils/api';
import { formatCurrency, formatDateTime, getStatusColor } from '../../utils/helpers';
import { FiFilter, FiChevronLeft, FiChevronRight, FiCheckCircle, FiClock, FiXCircle, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

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
      
      // Create PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Colors
      const primaryColor = [79, 70, 229]; // Indigo
      const textColor = [55, 65, 81]; // Gray-700
      const lightGray = [243, 244, 246]; // Gray-100
      
      // Header background
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      // Organization name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('NSS Donation Portal', pageWidth / 2, 20, { align: 'center' });
      
      // Receipt title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('DONATION RECEIPT', pageWidth / 2, 32, { align: 'center' });
      
      // Receipt ID badge
      doc.setFillColor(...lightGray);
      doc.roundedRect(pageWidth / 2 - 35, 50, 70, 12, 3, 3, 'F');
      doc.setTextColor(...primaryColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Receipt: ${receipt.receiptId}`, pageWidth / 2, 58, { align: 'center' });
      
      // Date
      doc.setTextColor(...textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${formatDateTime(receipt.date)}`, pageWidth / 2, 72, { align: 'center' });
      
      // Divider line
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(20, 80, pageWidth - 20, 80);
      
      // Amount section
      doc.setFillColor(236, 253, 245); // Green-50
      doc.roundedRect(20, 88, pageWidth - 40, 30, 3, 3, 'F');
      doc.setTextColor(5, 150, 105); // Green-600
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Donation Amount', pageWidth / 2, 100, { align: 'center' });
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      // Use "Rs." instead of ₹ symbol (jsPDF default fonts don't support Unicode rupee symbol)
      const formattedAmount = 'Rs. ' + Number(receipt.amount).toLocaleString('en-IN');
      doc.text(formattedAmount, pageWidth / 2, 112, { align: 'center' });
      
      // Donor Information section
      let yPos = 135;
      doc.setTextColor(...textColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Donor Information', 20, yPos);
      
      yPos += 12;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128); // Gray-500
      doc.text('Name:', 20, yPos);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(receipt.donorName, 60, yPos);
      
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text('Email:', 20, yPos);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(receipt.donorEmail, 60, yPos);
      
      // Payment Information section
      yPos += 20;
      doc.setTextColor(...textColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Information', 20, yPos);
      
      yPos += 12;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text('Payment ID:', 20, yPos);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(receipt.paymentId || 'N/A', 60, yPos);
      
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text('Status:', 20, yPos);
      doc.setTextColor(5, 150, 105);
      doc.setFont('helvetica', 'bold');
      doc.text('SUCCESS', 60, yPos);
      
      // Divider
      yPos += 15;
      doc.setDrawColor(229, 231, 235);
      doc.line(20, yPos, pageWidth - 20, yPos);
      
      // Thank you message
      yPos += 15;
      doc.setFillColor(...lightGray);
      doc.roundedRect(20, yPos - 5, pageWidth - 40, 20, 3, 3, 'F');
      doc.setTextColor(...primaryColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(receipt.message || 'Thank you for your generous donation!', pageWidth / 2, yPos + 7, { align: 'center' });
      
      // Footer
      yPos += 35;
      doc.setTextColor(156, 163, 175); // Gray-400
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('This is a computer-generated receipt and does not require a signature.', pageWidth / 2, yPos, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, yPos + 8, { align: 'center' });
      
      // Organization info at bottom
      doc.setTextColor(...textColor);
      doc.setFontSize(10);
      doc.text(receipt.organization, pageWidth / 2, 275, { align: 'center' });
      
      // Save the PDF
      doc.save(`receipt_${receipt.receiptId}.pdf`);
      
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Donations</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">View your donation history and status</p>
          </div>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Attempts</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">Successful</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.success?.count || 0}</p>
              <p className="text-xs text-gray-400">{formatCurrency(stats.success?.amount || 0)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending?.count || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.failed?.count || 0}</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4">
            <FiFilter className="text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Filter:</span>
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
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Payment ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {donations.map((donation) => (
                      <tr key={donation._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatDateTime(donation.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(donation.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 badge ${getStatusColor(donation.status)}`}>
                            {getStatusIcon(donation.status)}
                            <span>{donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {donation.razorpayPaymentId || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {donation.status === 'success' ? (
                            <button
                              onClick={() => downloadReceipt(donation._id)}
                              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center space-x-1"
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
                <div className="flex items-center justify-between px-6 py-4 border-t dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing page {pagination.current} of {pagination.pages}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                      disabled={pagination.current === 1}
                      className="p-2 rounded-lg border dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                      <FiChevronLeft />
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                      disabled={pagination.current === pagination.pages}
                      className="p-2 rounded-lg border dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FiFileText className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No donations found</p>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default Donations;

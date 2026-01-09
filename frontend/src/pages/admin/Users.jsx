import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../utils/api';
import { formatDate, exportToCSV } from '../../utils/helpers';
import { 
  FiSearch, 
  FiFilter, 
  FiDownload, 
  FiChevronLeft, 
  FiChevronRight,
  FiUser,
  FiMail,
  FiPhone,
  FiToggleLeft,
  FiToggleRight,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    isActive: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { 
        page: pagination.current, 
        limit: 10,
        ...filters
      };
      if (search) params.search = search;
      
      const response = await api.get('/admin/users', { params });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchUsers();
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/status`);
      toast.success('User status updated');
      fetchUsers();
      if (selectedUser?._id === userId) {
        setSelectedUser(null);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/export/users', { params: filters });
      exportToCSV(response.data.data, 'users_export');
      toast.success('Export successful!');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response.data);
    } catch (error) {
      toast.error('Failed to load user details');
    }
  };

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500 mt-1">View and manage registered users</p>
          </div>
          <button
            onClick={handleExport}
            className="mt-4 md:mt-0 btn-secondary flex items-center space-x-2"
          >
            <FiDownload />
            <span>Export Data</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  className="input-field pl-11"
                />
              </div>
              <button type="submit" className="btn-primary">
                Search
              </button>
            </form>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <FiFilter />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.isActive}
                  onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                  className="input-field"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ isActive: '', startDate: '', endDate: '' });
                    setSearch('');
                  }}
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : users.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-primary-600 font-semibold">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.phone || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.address?.city ? `${user.address.city}, ${user.address.state}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${user.isActive ? 'badge-success' : 'bg-gray-100 text-gray-600'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => viewUserDetails(user._id)}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user._id)}
                              className={`${user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'} text-sm font-medium`}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
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
                    Page {pagination.current} of {pagination.pages} ({pagination.total} total)
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
              <FiUser className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-primary-600">
                      {selectedUser.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{selectedUser.user?.name}</h4>
                    <p className="text-gray-500">{selectedUser.user?.email}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FiPhone className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium">{selectedUser.user?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FiUser className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className={`font-medium ${selectedUser.user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedUser.user?.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedUser.user?.address && (
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-900 mb-2">Address</h5>
                    <p className="text-gray-600">
                      {[
                        selectedUser.user.address.street,
                        selectedUser.user.address.city,
                        selectedUser.user.address.state,
                        selectedUser.user.address.pincode
                      ].filter(Boolean).join(', ') || 'Not provided'}
                    </p>
                  </div>
                )}

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Donation Summary</h5>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedUser.donationStats?.map((stat) => (
                      <div key={stat._id} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className={`text-lg font-bold ${
                          stat._id === 'success' ? 'text-green-600' :
                          stat._id === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {stat.count}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{stat._id}</p>
                        {stat._id === 'success' && (
                          <p className="text-xs text-gray-400">₹{stat.totalAmount?.toLocaleString()}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Users;

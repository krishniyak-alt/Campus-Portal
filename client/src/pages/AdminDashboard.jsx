import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Loading from '../components/Loading';
import {
  ShieldAlert,
  Users,
  Package,
  FileCheck,
  CheckCircle2,
  Trash2,
  Eye,
  Check,
  X,
  Search,
  Building,
  Mail,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'items' | 'users' | 'claims'

  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, itemsRes, claimsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/items'),
        API.get('/admin/claims'),
      ]);

      setStats(statsRes.data || {});
      setUsers(usersRes.data || []);
      setItems(itemsRes.data || []);
      setClaims(claimsRes.data || []);
    } catch (error) {
      console.error('Admin fetch error:', error);
      toast.error('Failed to load admin dataset');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Admin Action: Delete this report permanently?')) return;
    try {
      await API.delete(`/admin/items/${itemId}`);
      toast.success('Report removed by admin');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Admin Action: Delete user account and all their posted reports?')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success('User account deleted');
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleReviewClaim = async (claimId, status) => {
    try {
      await API.patch(`/claims/${claimId}`, { status });
      toast.success(`Claim marked as ${status}`);
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to update claim');
    }
  };

  if (loading) {
    return <Loading text="Loading administrator portal..." />;
  }

  const filteredItems = items.filter(
    (i) =>
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 backdrop-blur-md">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold flex items-center space-x-2">
              <span>Campus Administration Panel</span>
            </h1>
            <p className="text-amber-200/80 text-xs sm:text-sm mt-0.5">
              Platform statistics, moderation, user management, and claim oversight.
            </p>
          </div>
        </div>
      </div>

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <Users className="w-5 h-5 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Users</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.totalUsers || 0}</p>
          <p className="text-xs text-slate-500">Registered Students</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <Package className="w-5 h-5 text-rose-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lost</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.totalLostItems || 0}</p>
          <p className="text-xs text-slate-500">Lost Reports</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <Package className="w-5 h-5 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Found</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.totalFoundItems || 0}</p>
          <p className="text-xs text-slate-500">Found Reports</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolved</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.resolvedItems || 0}</p>
          <p className="text-xs text-slate-500">Returned Belongings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <FileCheck className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Claims</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.pendingClaims || 0}</p>
          <p className="text-xs text-slate-500">Pending Review</p>
        </div>
      </div>

      {/* TABBED CONTROLS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Recent Reports
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'items'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Items Moderation ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Users Management ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'claims'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Claims Oversight ({claims.length})
            </button>
          </div>

          {(activeTab === 'items' || activeTab === 'users') && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter results..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          )}
        </div>

        {/* RECENT REPORTS TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Latest Platform Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {stats?.recentItems?.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.title}</td>
                      <td className="py-3 px-4 capitalize font-semibold">{item.type}</td>
                      <td className="py-3 px-4">{item.category}</td>
                      <td className="py-3 px-4">{item.location}</td>
                      <td className="py-3 px-4 capitalize">{item.status}</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/items/${item._id}`}
                          className="p-1 text-slate-500 hover:text-indigo-600"
                        >
                          <Eye className="w-4 h-4 inline" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ITEMS MODERATION TAB */}
        {activeTab === 'items' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Title &amp; User</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-400">By: {item.user?.name || 'Unknown'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.type === 'lost' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{item.category}</td>
                    <td className="py-3 px-4">{item.location}</td>
                    <td className="py-3 px-4 capitalize font-semibold">{item.status}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link to={`/items/${item._id}`} className="text-slate-500 hover:text-indigo-600">
                        <Eye className="w-4 h-4 inline" />
                      </Link>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="text-rose-500 hover:text-rose-700"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* USERS MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4 font-mono">{u.studentId}</td>
                    <td className="py-3 px-4">{u.department}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-rose-500 hover:text-rose-700"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CLAIMS OVERSIGHT TAB */}
        {activeTab === 'claims' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Target Item</th>
                  <th className="py-3 px-4">Claimant</th>
                  <th className="py-3 px-4">Statement</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {claim.item?.title || 'Deleted Item'}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold">{claim.claimant?.name}</p>
                      <p className="text-[11px] text-slate-400">{claim.claimant?.studentId}</p>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">{claim.message}</td>
                    <td className="py-3 px-4 capitalize font-bold">{claim.status}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {claim.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleReviewClaim(claim._id, 'approved')}
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[10px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewClaim(claim._id, 'rejected')}
                            className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-[10px]"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

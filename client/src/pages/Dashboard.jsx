import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Loading from '../components/Loading';
import {
  LayoutDashboard,
  PlusCircle,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Edit,
  Trash2,
  Eye,
  Check,
  Clock,
  User,
  Tag,
  MapPin,
  ArrowRight,
  PackageCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'claims'
  const [reports, setReports] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [reportsRes, claimsRes] = await Promise.all([
        API.get('/items/my-reports'),
        API.get('/claims/my-claims'),
      ]);

      setReports(reportsRes.data || []);
      setClaims(claimsRes.data || []);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteReport = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await API.delete(`/items/${itemId}`);
      toast.success('Report deleted');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleToggleResolve = async (itemId, currentStatus) => {
    const nextStatus = currentStatus === 'resolved' ? 'active' : 'resolved';
    try {
      await API.patch(`/items/${itemId}/status`, { status: nextStatus });
      toast.success(`Report status updated to ${nextStatus}`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <Loading text="Loading your dashboard..." />;
  }

  const lostCount = reports.filter((r) => r.type === 'lost').length;
  const foundCount = reports.filter((r) => r.type === 'found').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved' || r.status === 'claimed').length;
  const pendingClaimsCount = claims.filter((c) => c.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-extrabold text-2xl flex items-center justify-center uppercase shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold">{user.name}</h1>
              <span className="bg-emerald-500/80 text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                Student
              </span>
            </div>
            <p className="text-indigo-200 text-xs sm:text-sm mt-0.5">
              {user.email} | Student ID: <span className="font-mono text-white">{user.studentId}</span> | Dept: {user.department}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/report-lost"
            className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg flex items-center space-x-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Lost</span>
          </Link>
          <Link
            to="/report-found"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center space-x-1.5 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Report Found</span>
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">{lostCount}</p>
            <p className="text-xs font-semibold text-slate-500">My Lost Reports</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">{foundCount}</p>
            <p className="text-xs font-semibold text-slate-500">My Found Reports</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">{claims.length}</p>
            <p className="text-xs font-semibold text-slate-500">Submitted Claims</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">{resolvedCount}</p>
            <p className="text-xs font-semibold text-slate-500">Resolved Belongings</p>
          </div>
        </div>
      </div>

      {/* TABBED CONTROLS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center space-x-2 ${
              activeTab === 'reports'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Submitted Reports ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center space-x-2 ${
              activeTab === 'claims'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>My Claim Statuses ({claims.length})</span>
          </button>
        </div>

        {/* TAB CONTENT: MY REPORTS */}
        {activeTab === 'reports' && (
          <div className="p-6">
            {reports.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-slate-500 text-sm">You haven't posted any lost or found reports yet.</p>
                <div className="flex justify-center gap-3">
                  <Link
                    to="/report-lost"
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs shadow-md"
                  >
                    Report Lost Item
                  </Link>
                  <Link
                    to="/report-found"
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md"
                  >
                    Report Found Item
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Item Details</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.map((report) => (
                      <tr key={report._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-900">
                          <div className="flex items-center space-x-3">
                            {report.image ? (
                              <img
                                src={report.image}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                <Tag className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            <div>
                              <Link
                                to={`/items/${report._id}`}
                                className="hover:text-indigo-600 transition-colors line-clamp-1"
                              >
                                {report.title}
                              </Link>
                              <span className="text-[11px] text-slate-400 font-normal">
                                {new Date(report.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              report.type === 'lost'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {report.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-medium text-slate-700">
                          {report.category}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-500">
                          {report.location}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              report.status === 'resolved' || report.status === 'claimed'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right space-x-1">
                          <Link
                            to={`/items/${report._id}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 inline-block"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleToggleResolve(report._id, report.status)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 inline-block"
                            title="Toggle Resolved Status"
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteReport(report._id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 inline-block"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: MY CLAIMS */}
        {activeTab === 'claims' && (
          <div className="p-6">
            {claims.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-slate-500 text-sm">You haven't submitted any item claims yet.</p>
                <Link
                  to="/browse"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md"
                >
                  <span>Browse Directory</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Claimed Item</th>
                      <th className="py-3.5 px-4">Claim Date</th>
                      <th className="py-3.5 px-4">Explanation Provided</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {claims.map((claim) => (
                      <tr key={claim._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-900">
                          {claim.item ? (
                            <Link
                              to={`/items/${claim.item._id}`}
                              className="hover:text-indigo-600 transition-colors line-clamp-1"
                            >
                              {claim.item.title}
                            </Link>
                          ) : (
                            <span className="text-slate-400 italic">Item Deleted</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-500">
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-600 line-clamp-1 max-w-xs">
                          {claim.message}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              claim.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                : claim.status === 'rejected'
                                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {claim.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {claim.item && (
                            <Link
                              to={`/items/${claim.item._id}`}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 inline-block"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

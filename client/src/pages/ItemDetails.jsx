import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Loading from '../components/Loading';
import ClaimModal from '../components/ClaimModal';
import EditItemModal from '../components/EditItemModal';
import {
  MapPin,
  Calendar,
  Clock,
  User,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  ArrowLeft,
  Trash2,
  Check,
  MessageSquare,
  FileCheck,
  Edit,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchItemDetails = async () => {
    try {
      const { data } = await API.get(`/items/${id}`);
      setItem(data);

      if (
        user &&
        (data.user._id === user._id || user.role === 'admin')
      ) {
        try {
          const claimRes = await API.get(`/claims/item/${id}`);
          setClaims(claimRes.data || []);
        } catch (e) {
          console.error('Error fetching item claims:', e);
        }
      }
    } catch (error) {
      console.error('Item fetch error:', error);
      toast.error('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, [id, user]);

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!item) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Item Not Found</h2>
        <p className="text-slate-500 text-sm">
          The requested lost or found report does not exist or has been deleted.
        </p>
        <Link
          to="/browse"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>
      </div>
    );
  }

  const isOwner = user && user._id === item.user._id;
  const isAdmin = user && user.role === 'admin';
  const isLost = item.type === 'lost';
  const isResolved = item.status === 'resolved' || item.status === 'claimed';

  const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await API.patch(`/items/${item._id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchItemDetails();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await API.delete(`/items/${item._id}`);
      toast.success('Report deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleReviewClaim = async (claimId, status) => {
    try {
      await API.patch(`/claims/${claimId}`, { status });
      toast.success(`Claim ${status} successfully!`);
      fetchItemDetails();
    } catch (error) {
      toast.error('Failed to update claim status');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Browse</span>
      </button>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Image Section */}
        <div className="md:col-span-6 relative bg-slate-100 min-h-[320px] md:min-h-full flex items-center justify-center overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover max-h-[500px]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-slate-400 space-y-2">
              <Tag className="w-16 h-16 stroke-[1.5] opacity-40" />
              <span className="text-sm font-medium">No Image Uploaded</span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md ${
                isLost ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
              }`}
            >
              {item.type}
            </span>

            {isResolved && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md bg-blue-600 text-white flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{item.status}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Info Section */}
        <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                {item.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {item.title}
              </h1>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {item.description}
            </p>

            {/* Metadata Grid */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 text-xs text-slate-700">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">Location: </span>
                  <span>{item.location}</span>
                </div>
              </div>

              {item.currentLocation && (
                <div className="flex items-center space-x-3">
                  <Building className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">Currently Kept At: </span>
                    <span>{item.currentLocation}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">Date: </span>
                  <span>{formattedDate}</span>
                </div>
              </div>

              {item.time && (
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">Time: </span>
                    <span>{item.time}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 pt-1 border-t border-slate-200/60">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">Posted By: </span>
                  <span>{item.user.name} ({item.user.department})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            {!isOwner && !isResolved && (
              <button
                onClick={() => {
                  if (!user) {
                    toast.error('Please login to claim this item');
                    navigate('/login');
                    return;
                  }
                  setClaimModalOpen(true);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <span>Claim This Item</span>
              </button>
            )}

            {(isOwner || isAdmin) && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                {item.status !== 'resolved' ? (
                  <button
                    onClick={() => handleStatusChange('resolved')}
                    disabled={updatingStatus}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Resolved</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange('active')}
                    disabled={updatingStatus}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <span>Reopen Report</span>
                  </button>
                )}

                <button
                  onClick={() => setEditModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex items-center justify-center space-x-1.5 font-semibold text-xs transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Report</span>
                </button>

                <button
                  onClick={handleDeleteItem}
                  className="w-full sm:w-auto p-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center space-x-1.5 font-semibold text-xs transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CLAIMS OVERVIEW SECTION (Visible to Owner & Admin) */}
      {(isOwner || isAdmin) && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-md space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Submitted Ownership Claims</h2>
              <p className="text-xs text-slate-500">
                Review claims submitted by students who believe this item belongs to them.
              </p>
            </div>
          </div>

          {claims.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No claims have been submitted for this item yet.</p>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div
                  key={claim._id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Claimant: {claim.claimant?.name || 'Student'} ({claim.claimant?.studentId})
                      </h4>
                      <p className="text-xs text-slate-500">
                        Email: {claim.claimant?.email} | Dept: {claim.claimant?.department}
                      </p>
                    </div>
                    <span
                      className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        claim.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : claim.status === 'rejected'
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      Status: {claim.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700">
                    <p>
                      <span className="font-bold text-slate-900">Claim Statement: </span>
                      {claim.message}
                    </p>
                    <p>
                      <span className="font-bold text-slate-900">Identifying Features Provided: </span>
                      {claim.identifyingDetails}
                    </p>
                  </div>

                  {claim.proofImage && (
                    <div className="pt-2">
                      <p className="text-xs font-bold text-slate-900 mb-1">Attached Proof Document:</p>
                      <img
                        src={claim.proofImage}
                        alt="Claim Proof"
                        className="w-32 h-32 object-cover rounded-xl border border-slate-200"
                      />
                    </div>
                  )}

                  {claim.status === 'pending' && (
                    <div className="pt-2 flex items-center space-x-3">
                      <button
                        onClick={() => handleReviewClaim(claim._id, 'approved')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Claim</span>
                      </button>
                      <button
                        onClick={() => handleReviewClaim(claim._id, 'rejected')}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1"
                      >
                        <span>Reject Claim</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Claim Modal Component */}
      <ClaimModal
        item={item}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onSuccess={fetchItemDetails}
      />

      {/* Edit Item Modal Component */}
      <EditItemModal
        item={item}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchItemDetails}
      />
    </div>
  );
};

export default ItemDetails;

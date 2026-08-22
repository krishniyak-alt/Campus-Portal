import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Loading from '../components/Loading';
import ClaimModal from '../components/ClaimModal';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRightLeft,
  MessageSquare,
  Check,
  X,
  ExternalLink,
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  Building,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AIMatchResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [match, setMatch] = useState(null);
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimTargetItem, setClaimTargetItem] = useState(null);

  const fetchMatchDetails = async () => {
    try {
      if (id) {
        const { data } = await API.get(`/matches/${id}`);
        setMatch(data);
      } else {
        // Fetch list of all matches for user
        const { data } = await API.get('/matches/my-matches');
        setAllMatches(data || []);
        if (data && data.length > 0) {
          setMatch(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load match details:', error);
      toast.error('Failed to load match comparison');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchDetails();
  }, [id]);

  const handleRunBatchAnalysis = async () => {
    setRunningAnalysis(true);
    try {
      const { data } = await API.post('/matches/analyze');
      toast.success(data.message || 'AI Matching Analysis completed!');
      fetchMatchDetails();
    } catch (error) {
      toast.error('Failed to run AI analysis');
    } finally {
      setRunningAnalysis(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!match) return;
    try {
      await API.patch(`/matches/${match._id}/status`, { status: newStatus });
      setMatch({ ...match, status: newStatus });
      toast.success(`Match marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleStartChat = async () => {
    if (!match || !user) {
      navigate('/login');
      return;
    }

    setStartingChat(true);
    try {
      const lostUserId = match.lostItem.user._id || match.lostItem.user;
      const foundUserId = match.foundItem.user._id || match.foundItem.user;
      const otherUserId = lostUserId.toString() === user._id.toString() ? foundUserId : lostUserId;

      const { data } = await API.post('/chat/conversations', {
        recipientId: otherUserId,
        itemId: match.lostItem._id,
        matchingItemId: match.foundItem._id,
      });

      navigate(`/chat/${data._id}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error(error.response?.data?.message || 'Failed to open chat');
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!match) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">No Match Comparisons Found</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          We haven't detected strong matches for this report yet. You can run the AI database scan to re-evaluate all items.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleRunBatchAnalysis}
            disabled={runningAnalysis}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${runningAnalysis ? 'animate-spin' : ''}`} />
            <span>Scan Database for Matches</span>
          </button>
          <Link
            to="/browse"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
          >
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const { lostItem, foundItem, overallScore, matchGrade, summaryExplanation, factors } = match;
  const isHigh = overallScore >= 80;
  const isPossible = overallScore >= 60 && overallScore < 80;

  const factorList = [
    { key: 'category', label: 'Item Category', weight: '20%', factor: factors?.category },
    { key: 'nameDescription', label: 'Name & Description', weight: '20%', factor: factors?.nameDescription },
    { key: 'brandModel', label: 'Brand & Model', weight: '15%', factor: factors?.brandModel },
    { key: 'color', label: 'Item Color', weight: '10%', factor: factors?.color },
    { key: 'location', label: 'Campus Location', weight: '10%', factor: factors?.location },
    { key: 'dateTime', label: 'Date / Time Frame', weight: '10%', factor: factors?.dateTime },
    { key: 'imageSimilarity', label: 'Image Similarity', weight: '15%', factor: factors?.imageSimilarity },
  ];

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg">
                <Sparkles className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                AI Match Analysis &amp; Verification
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated multi-factor similarity evaluation between reported Lost &amp; Found items.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunBatchAnalysis}
          disabled={runningAnalysis}
          className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${runningAnalysis ? 'animate-spin' : ''}`} />
          <span>Re-evaluate Matches</span>
        </button>
      </div>

      {/* Main 3-Column Comparative View: Lost Item ↕ AI Analysis ↕ Found Item */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 1. Lost Item Card (Left) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-rose-100 shadow-lg overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Reported Lost
                </span>
                <span className="text-xs font-semibold">{lostItem.category}</span>
              </div>
              <Link
                to={`/items/${lostItem._id}`}
                className="text-white hover:text-rose-200 text-xs font-bold flex items-center space-x-1"
                target="_blank"
              >
                <span>View Full</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Image */}
            <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
              {lostItem.image ? (
                <img
                  src={lostItem.image}
                  alt={lostItem.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-400 text-center space-y-1">
                  <Tag className="w-8 h-8 mx-auto stroke-[1.5]" />
                  <span className="text-[11px] font-medium block">No Photo Uploaded</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
              <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">
                {lostItem.title}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {lostItem.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Tag className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Color/Brand:</strong> {lostItem.color || 'N/A'} {lostItem.model ? `(${lostItem.model})` : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Lost At:</strong> {lostItem.location}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Date:</strong> {new Date(lostItem.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Reporter: {lostItem.user?.name || 'Student'}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              {lostItem.user?.department || 'CSE'}
            </span>
          </div>
        </div>

        {/* 2. Central AI Analysis Panel (Center) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden border border-indigo-500/20">
          {/* Background Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* AI Score Header */}
          <div className="text-center space-y-3 z-10">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-300">
              AI Matching Engine
            </span>

            {/* Circular / Large Score Badge */}
            <div className="relative inline-flex items-center justify-center p-4">
              <div
                className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 shadow-xl ${
                  isHigh
                    ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-emerald-500/20'
                    : isPossible
                    ? 'border-amber-400 bg-amber-500/10 text-amber-300 shadow-amber-500/20'
                    : 'border-slate-500 bg-slate-800 text-slate-400'
                }`}
              >
                <span className="text-3xl font-black">{overallScore}%</span>
                <span className="text-[10px] font-bold tracking-tight uppercase">Similarity</span>
              </div>
            </div>

            <div>
              <span
                className={`inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isHigh
                    ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                    : isPossible
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {matchGrade}
              </span>
            </div>

            <p className="text-xs text-indigo-100/90 leading-relaxed max-w-xs mx-auto pt-1 font-medium">
              {summaryExplanation}
            </p>
          </div>

          {/* 7-Factor Checklist */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2 z-10">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 pb-1 border-b border-white/10 flex items-center justify-between">
              <span>Matching Factors</span>
              <span>Weight</span>
            </h4>

            <div className="space-y-1.5 text-xs">
              {factorList.map((item) => {
                const isMatchItem = item.factor?.matched;
                return (
                  <div key={item.key} className="flex items-center justify-between py-0.5">
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      {isMatchItem ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      <span
                        className={`truncate text-[11px] ${
                          isMatchItem ? 'text-white font-medium' : 'text-slate-400'
                        }`}
                        title={item.factor?.detail || item.label}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-300 shrink-0">
                      {item.weight}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision Status */}
          <div className="text-center z-10">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Current Status: <span className="text-indigo-300 font-bold">{match.status || 'pending'}</span>
            </span>
          </div>
        </div>

        {/* 3. Found Item Card (Right) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-emerald-100 shadow-lg overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Reported Found
                </span>
                <span className="text-xs font-semibold">{foundItem.category}</span>
              </div>
              <Link
                to={`/items/${foundItem._id}`}
                className="text-white hover:text-emerald-200 text-xs font-bold flex items-center space-x-1"
                target="_blank"
              >
                <span>View Full</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Image */}
            <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
              {foundItem.image ? (
                <img
                  src={foundItem.image}
                  alt={foundItem.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-400 text-center space-y-1">
                  <Tag className="w-8 h-8 mx-auto stroke-[1.5]" />
                  <span className="text-[11px] font-medium block">No Photo Uploaded</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
              <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">
                {foundItem.title}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {foundItem.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Tag className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Color/Brand:</strong> {foundItem.color || 'N/A'} {foundItem.model ? `(${foundItem.model})` : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Found At:</strong> {foundItem.location}
                  </span>
                </div>
                {foundItem.currentLocation && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>
                      <strong className="text-slate-800">Currently At:</strong> {foundItem.currentLocation}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Date:</strong> {new Date(foundItem.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Founder: {foundItem.user?.name || 'Student'}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              {foundItem.user?.department || 'Campus'}
            </span>
          </div>
        </div>
      </div>

      {/* Global Interactive Action Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Next Recommended Action</h4>
            <p className="text-xs text-slate-500">
              If this is your item, submit a claim or chat privately to coordinate the return.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Claim This Item button — visible to non-owners */}
          {user && lostItem && foundItem && (
            (() => {
              const lostUserId = (lostItem.user?._id || lostItem.user || '').toString();
              const foundUserId = (foundItem.user?._id || foundItem.user || '').toString();
              const isLostReporter = lostUserId === user._id.toString();
              const isFoundReporter = foundUserId === user._id.toString();
              // Loster can claim the found item; neither-party can claim the lost item
              const itemToClaim = isLostReporter ? foundItem : (!isFoundReporter ? lostItem : null);
              if (!itemToClaim) return null;
              return (
                <button
                  onClick={() => {
                    setClaimTargetItem(itemToClaim);
                    setClaimModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all hover:scale-[1.02]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Claim This Item</span>
                </button>
              );
            })()
          )}

          <button
            onClick={handleStartChat}
            disabled={startingChat}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 flex items-center space-x-2 transition-all hover:scale-[1.02]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Start Private Chat</span>
          </button>

          <button
            onClick={() => handleUpdateStatus('confirmed')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Match</span>
          </button>

          <button
            onClick={() => handleUpdateStatus('rejected')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
          >
            <X className="w-4 h-4" />
            <span>Not a Match</span>
          </button>
        </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal
        item={claimTargetItem}
        isOpen={claimModalOpen}
        onClose={() => { setClaimModalOpen(false); setClaimTargetItem(null); }}
        onSuccess={() => { setClaimModalOpen(false); toast.success('Claim submitted successfully!'); }}
      />
    </div>
  );
};

export default AIMatchResultPage;

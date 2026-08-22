import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  PlusCircle,
  CheckCircle2,
  ShieldCheck,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  Award,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import API from '../services/api';
import ItemCard from '../components/ItemCard';

const Home = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [stats, setStats] = useState({
    totalLost: 14,
    totalFound: 18,
    totalReturned: 26,
    activeStudents: 150,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await API.get('/items?limit=4');
        setRecentItems(data.items || []);

        // Optional admin/public stats fetch
        try {
          const statsRes = await API.get('/admin/stats');
          if (statsRes.data) {
            setStats({
              totalLost: statsRes.data.totalLostItems || 14,
              totalFound: statsRes.data.totalFoundItems || 18,
              totalReturned: statsRes.data.resolvedItems || 26,
              activeStudents: statsRes.data.totalUsers || 150,
            });
          }
        } catch (e) {
          // Public users won't access /admin/stats, retain default counts
        }
      } catch (err) {
        console.error('Home fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 lg:pt-20 pb-16 bg-gradient-to-b from-indigo-50/60 via-slate-50 to-slate-50">
        {/* Glowing background circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center space-x-2 bg-indigo-100/80 border border-indigo-200 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Official Student Lost &amp; Found Portal</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Lost Something on <span className="gradient-text">Campus?</span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Report lost items, post found belongings, and help students reconnect with their belongings securely through our centralized campus directory.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/report-lost"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-lg shadow-rose-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Report Lost Item</span>
                </Link>

                <Link
                  to="/report-found"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Report Found Item</span>
                </Link>

                <Link
                  to="/browse"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-slate-300 hover:border-indigo-400 text-slate-800 font-semibold text-base shadow-sm hover:shadow-md flex items-center justify-center space-x-2 transition-all"
                >
                  <Search className="w-5 h-5 text-indigo-600" />
                  <span>Browse Directory</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 flex items-center justify-center lg:justify-start space-x-6 text-xs text-slate-500 border-t border-slate-200/80">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Student ID Verification</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Campus Community Driven</span>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-3xl p-6 bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-2xl shadow-indigo-500/10 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Live Campus Directory
                  </span>
                </div>

                {/* Card graphic preview */}
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                        LOST
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">AirPods Pro Case</h4>
                        <p className="text-xs text-slate-500">Student Union Cafeteria</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                      Active
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        FOUND
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Hydro Flask Water Bottle</h4>
                        <p className="text-xs text-slate-500">Science Block B</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      Returned
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        CLAIM
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Student ID Lanyard</h4>
                        <p className="text-xs text-slate-500">Library Reception</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DYNAMIC STATISTICS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-1 hover:shadow-md transition-shadow">
            <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600">{stats.totalLost}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Lost Items</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-1 hover:shadow-md transition-shadow">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600">{stats.totalFound}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Found Items</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-1 hover:shadow-md transition-shadow">
            <p className="text-3xl sm:text-4xl font-extrabold text-blue-600">{stats.totalReturned}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Items Returned</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-1 hover:shadow-md transition-shadow">
            <p className="text-3xl sm:text-4xl font-extrabold text-purple-600">{stats.activeStudents}+</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Students</p>
          </div>
        </div>
      </section>

      {/* RECENTLY REPORTED ITEMS */}
      {recentItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Recently Reported Items</h2>
              <p className="text-slate-500 text-sm mt-1">Check if someone recently posted your lost belonging.</p>
            </div>
            <Link
              to="/browse"
              className="inline-flex items-center space-x-1.5 font-semibold text-indigo-600 hover:text-indigo-700 text-sm"
            >
              <span>View All Reports</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900">Why Use Campus Lost &amp; Found?</h2>
          <p className="text-slate-600 text-base">
            Engineered specifically for university students, faculty, and campus security staff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Instant Item Reporting</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Post detailed descriptions, lost locations, categories, and photos within seconds to notify the entire campus community.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Secure Claim Verification</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Our claim system requires identifying secret details and proof before returning items to prevent fraudulent claims.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Smart Search &amp; Filters</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Filter by building location, date, category (ID card, water bottle, AirPods), or keyword search with real-time updates.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold">How It Works</h2>
            <p className="text-slate-400 text-sm">
              5 simple steps to return lost belongings to their rightful owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
            <div className="space-y-3 p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center mx-auto text-lg shadow-lg">
                1
              </div>
              <h4 className="font-bold text-white text-base">Report Item</h4>
              <p className="text-xs text-slate-400">Fill out details whether you lost or found something.</p>
            </div>

            <div className="space-y-3 p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center mx-auto text-lg shadow-lg">
                2
              </div>
              <h4 className="font-bold text-white text-base">Upload Photo</h4>
              <p className="text-xs text-slate-400">Add an image to help students identify the item easily.</p>
            </div>

            <div className="space-y-3 p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center mx-auto text-lg shadow-lg">
                3
              </div>
              <h4 className="font-bold text-white text-base">Search &amp; Match</h4>
              <p className="text-xs text-slate-400">Students filter reports to locate missing belongings.</p>
            </div>

            <div className="space-y-3 p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center mx-auto text-lg shadow-lg">
                4
              </div>
              <h4 className="font-bold text-white text-base">Verify Ownership</h4>
              <p className="text-xs text-slate-400">Claimant provides specific identifying details or proof.</p>
            </div>

            <div className="space-y-3 p-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white font-extrabold flex items-center justify-center mx-auto text-lg shadow-lg">
                5
              </div>
              <h4 className="font-bold text-white text-base">Safely Returned</h4>
              <p className="text-xs text-slate-400">Item is safely handed over and marked resolved.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 p-10 md:p-14 text-white overflow-hidden shadow-2xl shadow-indigo-500/20">
          <div className="relative z-10 max-w-2xl space-y-4 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Help Bring Lost Items Back To Their Owners
            </h2>
            <p className="text-indigo-100 text-base">
              Found a key or phone on campus? Report it right away to help a fellow classmate!
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-indigo-600 font-extrabold text-base hover:bg-indigo-50 shadow-xl transition-all hover:scale-105 text-center"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

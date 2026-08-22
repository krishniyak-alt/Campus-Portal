import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, Phone, MapPin, Heart, Github, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-emerald-400 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">
                Campus<span className="text-indigo-400">Lost</span>&amp;
                <span className="text-emerald-400">Found</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering student communities to reconnect lost items with their rightful owners safely and efficiently.
            </p>
            <div className="flex items-center space-x-3 text-slate-400">
              <div className="flex items-center space-x-1 text-xs bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Campus Network</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/browse" className="hover:text-indigo-400 transition-colors">Browse Lost &amp; Found</Link>
              </li>
              <li>
                <Link to="/report-lost" className="hover:text-indigo-400 transition-colors">Report Lost Item</Link>
              </li>
              <li>
                <Link to="/report-found" className="hover:text-indigo-400 transition-colors">Report Found Item</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-indigo-400 transition-colors">Student Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Common Categories</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Student ID Cards &amp; Badges</li>
              <li>Laptops, Phones &amp; AirPods</li>
              <li>Water Bottles &amp; Flasks</li>
              <li>Keys &amp; Keychains</li>
              <li>Backpacks &amp; Wallets</li>
            </ul>
          </div>

          {/* Campus Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Campus Security Office</h4>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                <span>Central Security Desk, Main Campus Building Room 102</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>lostandfound@campus.edu</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>+1 (555) 019-2834</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Campus Lost &amp; Found Portal. Built for students with passion.</p>
          <div className="flex items-center space-x-1 mt-4 sm:mt-0">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for Campus Community</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

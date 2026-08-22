import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
        <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '10s' }} />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-900">404 - Page Lost</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Looks like this page has gone missing! Let's help you navigate back to the main campus portal directory.
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md flex items-center space-x-1.5"
        >
          <Home className="w-4 h-4" />
          <span>Go Home</span>
        </Link>
        <Link
          to="/browse"
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-sm flex items-center space-x-1.5"
        >
          <Search className="w-4 h-4" />
          <span>Browse Items</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

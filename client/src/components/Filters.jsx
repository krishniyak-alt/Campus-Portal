import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  'All',
  'ID Card',
  'Electronics',
  'Water Bottle',
  'Notebook',
  'Bag',
  'Keys',
  'Accessories',
  'Clothing',
  'Other',
];

const Filters = ({
  type,
  setType,
  category,
  setCategory,
  status,
  setStatus,
  sort,
  setSort,
  onReset,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-900 font-semibold text-sm">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filter &amp; Refine</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-indigo-600 flex items-center space-x-1 font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Type Filter (All / Lost / Found) */}
      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2 tracking-wider">
          Report Type
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
          {['All', 'lost', 'found'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t === 'All' ? '' : t)}
              className={`py-2 rounded-lg capitalize transition-all ${
                (t === 'All' && !type) || type === t
                  ? t === 'lost'
                    ? 'bg-rose-500 text-white shadow-sm font-semibold'
                    : t === 'found'
                    ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                    : 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2 tracking-wider">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2 tracking-wider">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        >
          <option value="All">All Statuses</option>
          <option value="active">Active Reports</option>
          <option value="claimed">Claimed</option>
          <option value="resolved">Resolved / Returned</option>
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2 tracking-wider">
          Sort Order
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="updated">Recently Updated</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;

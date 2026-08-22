import React, { useState, useEffect } from 'react';
import API from '../services/api';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import ItemCard from '../components/ItemCard';
import Loading from '../components/Loading';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [type, setType] = useState(''); // '' | 'lost' | 'found'
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (category && category !== 'All') params.append('category', category);
      if (status && status !== 'All') params.append('status', status);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);
      params.append('page', page);
      params.append('limit', 12);

      const { data } = await API.get(`/items?${params.toString()}`);
      setItems(data.items || []);
      setTotalPages(data.pages || 1);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error('Fetch items error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type, category, status, sort, page]);

  const handleSearchSubmit = () => {
    setPage(1);
    fetchItems();
  };

  const handleResetFilters = () => {
    setSearch('');
    setType('');
    setCategory('All');
    setStatus('All');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Browse Lost &amp; Found Directory
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Search through {totalItems} reported items across campus.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-96">
          <SearchBar
            search={search}
            setSearch={setSearch}
            onSearchSubmit={handleSearchSubmit}
          />
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24">
          <Filters
            type={type}
            setType={(val) => {
              setType(val);
              setPage(1);
            }}
            category={category}
            setCategory={(val) => {
              setCategory(val);
              setPage(1);
            }}
            status={status}
            setStatus={(val) => {
              setStatus(val);
              setPage(1);
            }}
            sort={sort}
            setSort={(val) => {
              setSort(val);
              setPage(1);
            }}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center space-x-2 text-sm font-semibold text-slate-800"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>{showMobileFilters ? 'Hide Filters' : 'Filter Items'}</span>
          </button>
          <span className="text-xs text-slate-500 font-medium">
            {totalItems} items found
          </span>
        </div>

        {showMobileFilters && (
          <div className="lg:hidden col-span-1">
            <Filters
              type={type}
              setType={(val) => {
                setType(val);
                setPage(1);
              }}
              category={category}
              setCategory={(val) => {
                setCategory(val);
                setPage(1);
              }}
              status={status}
              setStatus={(val) => {
                setStatus(val);
                setPage(1);
              }}
              sort={sort}
              setSort={(val) => {
                setSort(val);
                setPage(1);
              }}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Items Grid Container */}
        <main className="lg:col-span-9 space-y-8">
          {loading ? (
            <Loading text="Searching campus items..." />
          ) : items.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                <PackageSearch className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">No Matching Items Found</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  We couldn't find any reports matching your search criteria. Try clearing filters or searching for broader terms.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">
                    Page {page} of {totalPages}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default BrowseItems;

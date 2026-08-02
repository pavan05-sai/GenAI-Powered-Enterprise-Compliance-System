import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AuditTrailPage() {
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [userFilter, setUserFilter] = useState('All Users');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.getAuditTrail({
          action: actionFilter,
          user: userFilter,
          search: searchQuery,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          page,
          limit
        });
        setLogs(res.data.logs || []);
        setTotalLogs(res.data.total || 0);
      } catch (err) {
        console.warn('Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [actionFilter, userFilter, searchQuery, dateFrom, dateTo, page]);

  const totalPages = Math.max(1, Math.ceil(totalLogs / limit));
  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, totalLogs);

  const handleClearFilters = () => {
    setActionFilter('All Actions');
    setUserFilter('All Users');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasActiveFilters = dateFrom || dateTo || searchQuery || actionFilter !== 'All Actions' || userFilter !== 'All Users';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#1A1918]">Audit Trail</h1>
        <p className="text-xs text-[#6E6B62] mt-0.5">Track all queries, answers, evidence retrievals, and user activities.</p>
      </div>

      {/* Filter Bar */}
      <div className="veritas-card p-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Action filter */}
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-md focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
          >
            <option value="All Actions">All Actions</option>
            <option value="Ask Question">Ask Question</option>
            <option value="AI Analyst">AI Analyst Answer</option>
            <option value="View Document">View Document</option>
            <option value="Upload Document">Upload Document</option>
            <option value="Process Document">Process Document</option>
            <option value="Generate Report">Generate Report</option>
            <option value="Risk Detected">Risk Detected</option>
          </select>

          {/* User filter */}
          <select
            value={userFilter}
            onChange={(e) => { setUserFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-md focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
          >
            <option value="All Users">All Users</option>
            <option value="Riya Sharma">Riya Sharma</option>
            <option value="AI System">AI System</option>
          </select>

          {/* Date From */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F5F0] border border-[#E6E2D8] rounded-md text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#8C6B1B] flex-shrink-0" />
            <span className="text-[#8C6B1B] font-medium">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="bg-transparent focus:outline-none text-[#1A1918] text-xs"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F5F0] border border-[#E6E2D8] rounded-md text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#8C6B1B] flex-shrink-0" />
            <span className="text-[#8C6B1B] font-medium">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="bg-transparent focus:outline-none text-[#1A1918] text-xs"
            />
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C877A]" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-md focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 text-xs text-[#8C6B1B] border border-[#C59B27] rounded-md hover:bg-[#F0ECE1] font-medium transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Activity Table */}
      <div className="veritas-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-14">
              <Loader2 className="w-7 h-7 text-[#8C6B1B] animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left text-xs text-[#1A1918]">
              <thead className="bg-[#F7F5F0] border-b border-[#E6E2D8] text-[10px] text-[#6E6B62] font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3 text-center">Docs Used</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E2D8]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#F9F8F6]">
                    <td className="px-4 py-3 text-[#6E6B62] font-mono text-[11px] whitespace-nowrap">
                      {typeof log.timestamp === 'string' ? log.timestamp : new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1A1918]">{log.userName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-[#F0ECE1] text-[#8C6B1B] font-semibold text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[#6E6B62] italic">{log.agent || '—'}</td>
                    <td className="px-4 py-3 text-[#1A1918] max-w-xs truncate">{log.details}</td>
                    <td className="px-4 py-3 text-center font-bold text-[#8C6B1B]">{log.documentsUsed ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.status === 'Success' ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                        log.status === 'Failed' ? 'bg-[#FFEBEE] text-[#D32F2F]' : 'bg-[#F7F5F0] text-[#6E6B62]'
                      }`}>
                        {log.status || 'Success'}
                      </span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-xs text-[#6E6B62]">
                      No audit log entries match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-[#F7F5F0] border-t border-[#E6E2D8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6E6B62]">
          <span>
            {totalLogs > 0
              ? `Showing ${startEntry} to ${endEntry} of ${totalLogs} results`
              : 'No results found'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 rounded border border-[#E6E2D8] bg-white flex items-center justify-center hover:bg-[#F0ECE1] disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = i + 1;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-7 h-7 rounded border flex items-center justify-center font-semibold text-xs ${
                    page === pg
                      ? 'border-[#8C6B1B] bg-[#8C6B1B] text-white'
                      : 'border-[#E6E2D8] bg-white hover:bg-[#F0ECE1]'
                  }`}
                >
                  {pg}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className="px-1">...</span>
                <button
                  onClick={() => setPage(totalPages)}
                  className="w-7 h-7 rounded border border-[#E6E2D8] bg-white flex items-center justify-center hover:bg-[#F0ECE1] text-xs"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="w-7 h-7 rounded border border-[#E6E2D8] bg-white flex items-center justify-center hover:bg-[#F0ECE1] disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

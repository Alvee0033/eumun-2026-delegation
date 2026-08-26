'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  Download,
  Copy,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  X,
  Check,
} from 'lucide-react'
import { StatusBadge } from '@/components/admin/Charts'
import AdminHeader from '@/components/admin/AdminHeader'
import { COMMITTEES, STATUSES } from '@/lib/types'

interface Submission {
  id: number
  name: string
  department: string
  phone: string
  whatsapp: string
  email: string
  dob: string
  emergency_contact: string
  mun_experience: string
  committee_1st: string
  committee_2nd: string
  preferred_role: string
  status: string
  campus_envoy: string
  created_at: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

function formatDate(iso: string) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function SubmissionsPage() {
  const [data, setData] = useState<Submission[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [committeeFilter, setCommitteeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [updating, setUpdating] = useState<number | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<Submission | null>(null)
  const [copiedEmails, setCopiedEmails] = useState(false)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: '25',
      ...(search && { search }),
      ...(statusFilter && { status: statusFilter }),
      ...(committeeFilter && { committee: committeeFilter }),
    })
    try {
      const res = await fetch(`/api/admin/submissions?${params}`)
      const json = await res.json()
      setData(json.data ?? [])
      setPagination(json.pagination)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, committeeFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function updateStatus(id: number, status: string) {
    setUpdating(id)
    try {
      await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setData((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord({ ...selectedRecord, status })
      }
    } finally {
      setUpdating(null)
    }
  }

  async function deleteSubmission(id: number, name: string) {
    if (!confirm(`Delete application for ${name || 'this delegate'}? This action cannot be reversed.`)) return
    setUpdating(id)
    try {
      await fetch(`/api/admin/submissions/${id}`, { method: 'DELETE' })
      setData((prev) => prev.filter((s) => s.id !== id))
      if (selectedRecord?.id === id) setSelectedRecord(null)
      if (pagination) setPagination({ ...pagination, total: pagination.total - 1 })
    } finally {
      setUpdating(null)
    }
  }

  // Export to CSV
  function exportCSV() {
    if (!data.length) return
    const headers = [
      'ID',
      'Name',
      'Department',
      'Email',
      'Phone',
      'WhatsApp',
      '1st Committee',
      '2nd Committee',
      'Role',
      'Status',
      'Campus Envoy',
      'Created At',
    ]
    const rows = data.map((d) => [
      d.id,
      `"${(d.name || '').replace(/"/g, '""')}"`,
      `"${(d.department || '').replace(/"/g, '""')}"`,
      d.email || '',
      d.phone || '',
      d.whatsapp || '',
      `"${(d.committee_1st || '').replace(/"/g, '""')}"`,
      `"${(d.committee_2nd || '').replace(/"/g, '""')}"`,
      d.preferred_role || '',
      d.status || '',
      d.campus_envoy || '',
      d.created_at || '',
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `eumun_delegations_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Copy all emails
  function copyAllEmails() {
    const emails = data.map((d) => d.email).filter(Boolean).join(', ')
    if (!emails) return
    navigator.clipboard.writeText(emails)
    setCopiedEmails(true)
    setTimeout(() => setCopiedEmails(false), 2500)
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* ── Background Ambient Glows ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-indigo-900/15 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* ── Client Admin Header with Working Navigation & Sign Out ── */}
        <AdminHeader subtitle="Applicant Records & Management" />

        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-5">

          {/* ── Control Bar: Search & Action Buttons ── */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, email, department, phone..."
                className="input-field pl-10 pr-10"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={exportCSV}
                disabled={!data.length}
                className="btn-secondary flex-1 sm:flex-initial"
                title="Download CSV"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={copyAllEmails}
                disabled={!data.length}
                className="btn-secondary flex-1 sm:flex-initial"
                title="Copy all delegate emails"
              >
                {copiedEmails ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Emails Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Copy Emails</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Filter Pills Row ── */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => { setStatusFilter(''); setPage(1) }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all
                  ${!statusFilter
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm border border-indigo-500/50'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
              >
                All Statuses
              </button>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1) }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all
                    ${statusFilter === s
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm border border-indigo-500/50'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Committee Dropdown Filter */}
            <select
              value={committeeFilter}
              onChange={(e) => { setCommitteeFilter(e.target.value); setPage(1) }}
              className="input-field text-xs py-1.5 w-auto font-semibold cursor-pointer"
            >
              <option value="">All 9 Committees</option>
              {COMMITTEES.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-slate-100">{c.split('(')[0].trim()}</option>
              ))}
            </select>
          </div>

          {/* ── Submissions Table: Desktop ── */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/75 backdrop-blur-xl shadow-glass">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-4 py-3.5 font-mono">ID</th>
                  <th className="px-4 py-3.5">Delegate</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">1st Choice</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Submitted</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-slate-500">
                      Loading applications...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-slate-500 font-medium">
                      No applications found matching your query.
                    </td>
                  </tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-slate-500">#{row.id}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-100 text-sm">{row.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{row.email}</p>
                      </td>
                      <td className="px-4 py-3.5 max-w-[150px] truncate text-slate-300">
                        {row.department}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded text-[11px] font-bold">
                          {row.committee_1st ? row.committee_1st.split('(')[0].trim() : 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-200 font-semibold">{row.preferred_role}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRecord(row)}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/60 rounded-lg transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <select
                            value={row.status}
                            onChange={(e) => updateStatus(row.id, e.target.value)}
                            disabled={updating === row.id}
                            className="text-[11px] font-semibold bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 shadow-xs cursor-pointer"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s} className="capitalize bg-slate-900 text-slate-100">{s}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => deleteSubmission(row.id, row.name)}
                            disabled={updating === row.id}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Submissions Cards: Mobile & Tablet ── */}
          <div className="flex flex-col gap-3 lg:hidden">
            {loading ? (
              <div className="card text-center text-slate-500 py-12">Loading applications...</div>
            ) : data.length === 0 ? (
              <div className="card text-center text-slate-500 py-12">No delegate applications found.</div>
            ) : (
              data.map((row) => (
                <div key={row.id} className="card p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">#{row.id}</span>
                        <h3 className="font-bold text-slate-100 text-sm">{row.name}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{row.department}</p>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 py-2 border-y border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">1st Choice</span>
                      <span className="font-bold text-indigo-400">{row.committee_1st ? row.committee_1st.split('(')[0].trim() : 'General'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Role</span>
                      <span className="font-semibold text-slate-200">{row.preferred_role}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Email</span>
                      <span className="truncate block font-mono text-[11px] text-slate-400">{row.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Phone</span>
                      <span className="font-mono text-[11px] text-slate-400">{row.phone}</span>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setSelectedRecord(row)}
                      className="btn-secondary text-xs flex-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Details</span>
                    </button>

                    <select
                      value={row.status}
                      onChange={(e) => updateStatus(row.id, e.target.value)}
                      disabled={updating === row.id}
                      className="input-field text-xs py-2 w-auto font-semibold cursor-pointer"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize bg-slate-900 text-slate-100">{s}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => deleteSubmission(row.id, row.name)}
                      disabled={updating === row.id}
                      className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 rounded-xl"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Pagination Bar ── */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between card p-3.5 text-xs text-slate-400">
              <span className="font-medium">
                Showing Page {page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="btn-secondary py-1.5 px-3 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages || loading}
                  className="btn-secondary py-1.5 px-3 disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ── Delegate Detail Inspection Modal (Dark Theme) ── */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-slate-900/95 border-slate-700/80 shadow-2xl flex flex-col gap-5 relative">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-100">{selectedRecord.name}</h2>
                    <StatusBadge status={selectedRecord.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">EUMUN 2026 Application Ref #{selectedRecord.id}</p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Delegate Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Department & Batch</span>
                  <span className="font-semibold text-slate-200">{selectedRecord.department}</span>
                </div>

                <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Date of Birth</span>
                  <span className="font-semibold text-slate-200">{selectedRecord.dob}</span>
                </div>

                <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Primary Phone</span>
                  <span className="font-bold text-slate-200 font-mono">{selectedRecord.phone}</span>
                </div>

                <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">WhatsApp Number</span>
                  <span className="font-bold text-slate-200 font-mono">{selectedRecord.whatsapp}</span>
                </div>

                <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 sm:col-span-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Email Address</span>
                  <span className="font-bold text-indigo-400 font-mono">{selectedRecord.email}</span>
                </div>

                <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 sm:col-span-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Emergency Contact</span>
                  <span className="font-semibold text-slate-200">{selectedRecord.emergency_contact}</span>
                </div>
              </div>

              {/* Committee Allocations */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs">
                <span className="text-indigo-400 font-bold uppercase text-[10px]">Committee Preferences & Role</span>
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">1st Preference:</span>
                    <span className="font-extrabold text-indigo-300">{selectedRecord.committee_1st}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">2nd Preference:</span>
                    <span className="font-bold text-slate-200">{selectedRecord.committee_2nd}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Preferred Role:</span>
                    <span className="font-bold text-slate-200">{selectedRecord.preferred_role}</span>
                  </div>
                </div>
              </div>

              {/* MUN Background / Experience */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Previous MUN Experience</span>
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap pt-1 font-sans">
                  {selectedRecord.mun_experience}
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Update Status:</span>
                  <select
                    value={selectedRecord.status}
                    onChange={(e) => updateStatus(selectedRecord.id, e.target.value)}
                    className="input-field text-xs py-1.5 w-auto"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize bg-slate-900 text-slate-100">{s}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setSelectedRecord(null)}
                  className="btn-secondary"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}


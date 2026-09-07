'use client'

import { useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  ShieldAlert,
  FileText,
  Award,
  Globe,
  AlertCircle,
  ArrowRight,
  Send,
  Loader2,
  Check,
  X,
  Sparkles,
} from 'lucide-react'
import { COMMITTEES, ROLES, type Committee, type Role } from '@/lib/types'

// ─── Committee metadata ──────────────────────────────────────────────────────

interface CommitteeInfo {
  code: string
  name: string
  fullName: string
  type: string
}

const COMMITTEE_DETAILS: CommitteeInfo[] = [
  { code: 'OPEN', name: 'Open Allocation (Decide Upon Official Release)', fullName: 'Open Allocation (To Be Decided Upon Official Release)', type: 'Flexible' },
  { code: 'CRISIS', name: 'Crisis & Strategic Affairs', fullName: 'Crisis & Strategic Affairs', type: 'Flagship Crisis' },
  { code: 'LEGAL', name: 'International Law & Justice', fullName: 'International Law & Justice', type: 'Legal Procedures' },
  { code: 'GA', name: 'General Assembly & Disarmament', fullName: 'General Assembly & Disarmament', type: 'General Assembly' },
  { code: 'HR', name: 'Human Rights & Humanitarian Affairs', fullName: 'Human Rights & Humanitarian Affairs', type: 'Human Rights' },
  { code: 'ECON', name: 'Economics & Sustainable Development', fullName: 'Economics & Sustainable Development', type: 'Sustainable Growth' },
  { code: 'IP', name: 'International Press & Media', fullName: 'International Press / Media (IP)', type: 'Journalism' },
  { code: 'SPEC', name: 'Specialized & National Bodies', fullName: 'Specialized / National Body', type: 'Specialized' },
]

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

// ─── Mobile-Friendly DOB Selector Component (Dark Themed) ───────────────────

function MobileDOBPicker({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (val: string) => void
  error?: string
}) {
  const parts = value ? value.split('-') : ['', '', '']
  const currentYear = parts[0] || ''
  const currentMonth = parts[1] || ''
  const currentDay = parts[2] || ''

  const years = useMemo(() => {
    const list: number[] = []
    const now = new Date().getFullYear()
    for (let y = now - 14; y >= 1990; y--) {
      list.push(y)
    }
    return list
  }, [])

  const daysInMonth = useMemo(() => {
    const y = parseInt(currentYear) || 2004
    const m = parseInt(currentMonth) || 1
    const total = new Date(y, m, 0).getDate()
    const days: string[] = []
    for (let d = 1; d <= total; d++) {
      days.push(d < 10 ? `0${d}` : `${d}`)
    }
    return days
  }, [currentYear, currentMonth])

  function updateDate(newYear: string, newMonth: string, newDay: string) {
    if (newYear && newMonth && newDay) {
      onChange(`${newYear}-${newMonth}-${newDay}`)
    } else if (newYear || newMonth || newDay) {
      onChange(`${newYear || '2004'}-${newMonth || '01'}-${newDay || '01'}`)
    } else {
      onChange('')
    }
  }

  const formattedDisplay = useMemo(() => {
    if (!value || !currentYear || !currentMonth || !currentDay) return null
    const monthObj = MONTHS.find((m) => m.value === currentMonth)
    const birthDate = new Date(`${currentYear}-${currentMonth}-${currentDay}`)
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    return {
      text: `${parseInt(currentDay)} ${monthObj?.label || ''} ${currentYear}`,
      age: isNaN(age) || age < 0 ? null : age,
    }
  }, [value, currentYear, currentMonth, currentDay])

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {/* Day Select */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400">Day</label>
          <select
            value={currentDay}
            onChange={(e) => updateDate(currentYear || '2004', currentMonth || '01', e.target.value)}
            className={`input-field px-2.5 py-3 text-xs font-semibold cursor-pointer ${error ? 'input-field-error' : ''}`}
          >
            <option value="" className="bg-slate-900 text-slate-400">Day</option>
            {daysInMonth.map((d) => (
              <option key={d} value={d} className="bg-slate-900 text-slate-100">
                {parseInt(d)}
              </option>
            ))}
          </select>
        </div>

        {/* Month Select */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400">Month</label>
          <select
            value={currentMonth}
            onChange={(e) => updateDate(currentYear || '2004', e.target.value, currentDay || '01')}
            className={`input-field px-2 py-3 text-xs font-semibold cursor-pointer ${error ? 'input-field-error' : ''}`}
          >
            <option value="" className="bg-slate-900 text-slate-400">Month</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value} className="bg-slate-900 text-slate-100">
                {m.label.slice(0, 3)}
              </option>
            ))}
          </select>
        </div>

        {/* Year Select */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400">Year</label>
          <select
            value={currentYear}
            onChange={(e) => updateDate(e.target.value, currentMonth || '01', currentDay || '01')}
            className={`input-field px-2.5 py-3 text-xs font-semibold cursor-pointer ${error ? 'input-field-error' : ''}`}
          >
            <option value="" className="bg-slate-900 text-slate-400">Year</option>
            {years.map((y) => (
              <option key={y} value={String(y)} className="bg-slate-900 text-slate-100">
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Preview in Glowing Badge */}
      {formattedDisplay && (
        <div className="flex items-center justify-between bg-indigo-950/60 border border-indigo-700/50 px-3 py-1.5 rounded-xl text-xs shadow-xs">
          <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formattedDisplay.text}</span>
            {formattedDisplay.age !== null && (
              <span className="text-[11px] font-normal text-indigo-200">({formattedDisplay.age} years)</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-indigo-400 hover:text-indigo-200 p-0.5"
            title="Reset Date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Modern Field Component (Dark Themed) ───────────────────────────────────

function FormFieldWrapper({
  label,
  required,
  error,
  hint,
  icon: Icon,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
          {Icon && <Icon className="w-3.5 h-3.5 text-indigo-400" />}
          <span>{label}</span>
          {required && <span className="text-rose-400">*</span>}
        </label>
        {hint && <span className="text-[11px] text-slate-400 font-medium">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 animate-fade-in" role="alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

// ─── Modern Interactive Committee Selector (Dark Themed) ────────────────────

function ModernCommitteePicker({
  title,
  name,
  value,
  onChange,
  disabledValue,
  error,
}: {
  title: string
  name: string
  value: string
  onChange: (v: string) => void
  disabledValue?: string
  error?: string
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{title}</span>
        {value && (
          <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-700/50 px-2 py-0.5 rounded-full shadow-xs">
            Selected: {COMMITTEE_DETAILS.find((c) => c.fullName === value)?.code || 'Selected'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup">
        {COMMITTEE_DETAILS.map((c) => {
          const isSelected = value === c.fullName
          const isDisabled = disabledValue === c.fullName

          return (
            <label
              key={c.code}
              className={`relative flex flex-col p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none
                ${isDisabled
                  ? 'opacity-35 cursor-not-allowed border-slate-800 bg-slate-950/60'
                  : isSelected
                    ? 'border-indigo-500 bg-indigo-950/50 ring-2 ring-indigo-500/30 shadow-neon-blue'
                    : 'border-slate-800/90 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-850/80 shadow-xs'
                }`}
            >
              <input
                type="radio"
                name={name}
                value={c.fullName}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => !isDisabled && onChange(c.fullName)}
                className="sr-only"
              />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md uppercase tracking-wider
                    ${isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                    {c.code}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{c.type}</span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                  ${isSelected ? 'border-indigo-400 bg-indigo-600' : 'border-slate-600 bg-slate-900'}`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <p className={`mt-1.5 text-xs font-bold leading-snug ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`}>
                {c.name}
              </p>
              {isDisabled && (
                <span className="text-[10px] text-amber-400 mt-1 font-semibold">Chosen as 1st preference</span>
              )}
            </label>
          )
        })}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 animate-fade-in" role="alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

// ─── Form State ───────────────────────────────────────────────────────────────

type FormData = {
  name: string
  department: string
  phone: string
  whatsapp: string
  dob: string
  emergency_contact: string
  email: string
  mun_experience: string
  committee_1st: string
  committee_2nd: string
  preferred_role: string
}

type Errors = Partial<Record<keyof FormData, string>>

const INITIAL: FormData = {
  name: '',
  department: '',
  phone: '',
  whatsapp: '',
  dob: '',
  emergency_contact: '',
  email: '',
  mun_experience: '',
  committee_1st: '',
  committee_2nd: '',
  preferred_role: 'Delegate',
}

// ─── Main Form Component (Dark Themed) ────────────────────────────────────────

export default function RegistrationForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'committees'>('personal')
  const formTopRef = useRef<HTMLDivElement>(null)

  const set = (key: keyof FormData) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const requiredKeys: (keyof FormData)[] = [
      'name',
      'department',
      'dob',
      'email',
      'phone',
      'whatsapp',
      'emergency_contact',
      'committee_1st',
      'mun_experience',
    ]
    const filledCount = requiredKeys.filter((k) => (form[k] || '').trim().length > 0).length
    return Math.round((filledCount / requiredKeys.length) * 100)
  }, [form])

  const personalDone = Boolean(form.name.trim() && form.department.trim() && form.dob && form.email.trim())
  const contactDone = Boolean(form.phone.trim() && form.whatsapp.trim() && form.emergency_contact.trim())
  const munDone = Boolean(form.committee_1st.trim() && form.mun_experience.trim())

  function validate(tabOnly?: 'personal' | 'contact'): boolean {
    const errs: Errors = {}

    if (tabOnly === 'personal' || !tabOnly) {
      if (!form.name.trim() || form.name.trim().length < 2)
        errs.name = 'Full name is required (min 2 characters)'
      if (!form.department.trim())
        errs.department = 'Department and batch are required'
      if (!form.dob)
        errs.dob = 'Date of birth is required'
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errs.email = 'Valid email address required'
    }

    if (tabOnly === 'contact' || !tabOnly) {
      if (!form.phone.trim() || form.phone.trim().length < 7)
        errs.phone = 'Valid phone number required'
      if (!form.whatsapp.trim() || form.whatsapp.trim().length < 7)
        errs.whatsapp = 'Valid WhatsApp number required'
      if (!form.emergency_contact.trim())
        errs.emergency_contact = 'Emergency contact details required'
    }

    if (!tabOnly) {
      if (!form.committee_1st.trim())
        errs.committee_1st = 'Please write your committee preference or type Open'
      if (!form.mun_experience.trim())
        errs.mun_experience = 'Please describe your MUN experience (or write First Time)'
    }

    setErrors((prev) => ({ ...prev, ...errs }))
    return Object.keys(errs).length === 0
  }

  function handleNextTab() {
    if (activeTab === 'personal') {
      if (validate('personal')) {
        setActiveTab('contact')
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else if (activeTab === 'contact') {
      if (validate('contact')) {
        setActiveTab('committees')
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')
    if (!validate()) {
      if (errors.name || errors.department || errors.dob || errors.email) {
        setActiveTab('personal')
      } else if (errors.phone || errors.whatsapp || errors.emergency_contact) {
        setActiveTab('contact')
      } else {
        setActiveTab('committees')
      }
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, campus_envoy: 'Syed Saimum Hasan' }),
      })
      const data = await res.json()

      if (res.ok) {
        router.push(`/success?name=${encodeURIComponent(form.name)}&dept=${encodeURIComponent(form.department)}&c1=${encodeURIComponent(form.committee_1st)}`)
      } else if (res.status === 409) {
        setServerError('An application with this email address has already been submitted.')
      } else if (res.status === 400 && data.details) {
        const apiErrors: Errors = {}
        for (const [key, msgs] of Object.entries(data.details)) {
          if (Array.isArray(msgs) && msgs.length > 0) {
            apiErrors[key as keyof FormData] = msgs[0] as string
          }
        }
        setErrors(apiErrors)
      } else {
        setServerError(data.error ?? 'Submission error. Please check all details and try again.')
      }
    } catch {
      setServerError('Network connection issue. Please verify your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div ref={formTopRef} className="flex flex-col gap-6">

      {/* ── Progress Bar & Step Tabs in Dark ── */}
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">Application Progress</span>
            <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-700/50 px-2 py-0.5 rounded-full shadow-xs">
              {completionPercentage}% Complete
            </span>
          </div>
          <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
            EUMUN 2026 · 8–10 Oct · Envoy: Syed Saimum Hasan
          </span>
        </div>

        {/* Progress Fill */}
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-neon-blue"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Registration Fee & Group Scholarship Note */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-1.5 px-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="font-semibold text-slate-400">Registration Fee:</span>
            <span className="font-mono font-bold text-cyan-400">3,050 BDT</span>
          </div>
          <div className="flex items-center gap-1 text-purple-300 font-medium">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Bring more friends to unlock Delegation Scholarship!</span>
          </div>
        </div>

        {/* Segmented Step Buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all
              ${activeTab === 'personal'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-neon-blue border border-indigo-500/50'
                : personalDone
                  ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/40'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
          >
            {personalDone ? <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <User className="w-3.5 h-3.5 shrink-0" />}
            <span className="truncate">1. Identity</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all
              ${activeTab === 'contact'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-neon-blue border border-indigo-500/50'
                : contactDone
                  ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/40'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
          >
            {contactDone ? <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Phone className="w-3.5 h-3.5 shrink-0" />}
            <span className="truncate">2. Contact</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('committees')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all
              ${activeTab === 'committees'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-neon-blue border border-indigo-500/50'
                : munDone
                  ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/40'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
          >
            {munDone ? <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Globe className="w-3.5 h-3.5 shrink-0" />}
            <span className="truncate">3. Allocation</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

        {/* ── TAB 1: Personal Information ── */}
        {activeTab === 'personal' && (
          <div className="card-glow-indigo flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  Personal Information
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Please provide exact details matching your university documents</p>
              </div>
              <span className="text-[11px] font-mono font-bold bg-indigo-950/80 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/50">Part 1/3</span>
            </div>

            <FormFieldWrapper label="Full Name" required error={errors.name} hint="Certificate name" icon={User}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name')(e.target.value)}
                placeholder="e.g. Syed Saimum Hasan"
                className={`input-field ${errors.name ? 'input-field-error' : ''}`}
                autoComplete="name"
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="Department & Batch" required error={errors.department} hint="Academic ID" icon={GraduationCap}>
              <input
                type="text"
                value={form.department}
                onChange={(e) => set('department')(e.target.value)}
                placeholder="e.g. Computer Science & Engineering, Batch 2022"
                className={`input-field ${errors.department ? 'input-field-error' : ''}`}
              />
            </FormFieldWrapper>

            {/* Mobile-Friendly Date of Birth Selector */}
            <FormFieldWrapper label="Date of Birth" required error={errors.dob} hint="Touch friendly" icon={Calendar}>
              <MobileDOBPicker
                value={form.dob}
                onChange={(val) => set('dob')(val)}
                error={errors.dob}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="Email Address" required error={errors.email} hint="Official correspondence" icon={Mail}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email')(e.target.value)}
                placeholder="delegate@domain.com"
                className={`input-field ${errors.email ? 'input-field-error' : ''}`}
                autoComplete="email"
                inputMode="email"
              />
            </FormFieldWrapper>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleNextTab}
                className="btn-primary sm:w-auto"
              >
                <span>Continue to Contact Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 2: Contact Details ── */}
        {activeTab === 'contact' && (
          <div className="card-glow-indigo flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-400" />
                  Contact & Emergency Details
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Used for delegation announcements and schedule updates</p>
              </div>
              <span className="text-[11px] font-mono font-bold bg-indigo-950/80 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/50">Part 2/3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormFieldWrapper label="Primary Phone Number" required error={errors.phone} hint="Direct voice calls" icon={Phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone')(e.target.value)}
                  placeholder="+880 1700 000000"
                  className={`input-field font-mono ${errors.phone ? 'input-field-error' : ''}`}
                  autoComplete="tel"
                  inputMode="tel"
                />
              </FormFieldWrapper>

              <FormFieldWrapper label="WhatsApp Number" required error={errors.whatsapp} hint="Delegation group" icon={MessageSquare}>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => set('whatsapp')(e.target.value)}
                  placeholder="+880 1700 000000"
                  className={`input-field font-mono ${errors.whatsapp ? 'input-field-error' : ''}`}
                  inputMode="tel"
                />
              </FormFieldWrapper>
            </div>

            <FormFieldWrapper
              label="Emergency Contact"
              required
              error={errors.emergency_contact}
              hint="Guardian Name & Relationship"
              icon={ShieldAlert}
            >
              <input
                type="text"
                value={form.emergency_contact}
                onChange={(e) => set('emergency_contact')(e.target.value)}
                placeholder="e.g. M. A. Hasan (Father) — +880 1800 000000"
                className={`input-field ${errors.emergency_contact ? 'input-field-error' : ''}`}
              />
            </FormFieldWrapper>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNextTab}
                className="btn-primary sm:w-auto"
              >
                <span>Continue to Committee Preferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 3: Allocation & MUN Experience ── */}
        {activeTab === 'committees' && (
          <div className="card-glow-indigo flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  Committee Preference & Experience
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Please share your committee preferences and diplomatic background</p>
              </div>
              <span className="text-[11px] font-mono font-bold bg-indigo-950/80 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/50">Part 3/3</span>
            </div>

            {/* 1. Committee Preference */}
            <FormFieldWrapper
              label="Committee Preference"
              required
              error={errors.committee_1st}
              hint="Preferred topics / fields or 'Open Allocation'"
              icon={Globe}
            >
              <textarea
                value={form.committee_1st}
                onChange={(e) => set('committee_1st')(e.target.value)}
                placeholder="Enter your committee preferences (e.g. Crisis, Security, Human Rights, Law, Economics, or 'Open to any committee allocation once released')..."
                rows={3}
                className={`input-field resize-none leading-relaxed ${errors.committee_1st ? 'input-field-error' : ''}`}
              />
            </FormFieldWrapper>

            {/* 2. MUN Experience */}
            <FormFieldWrapper
              label="Previous MUN Experiences"
              required
              error={errors.mun_experience}
              hint="Conferences, awards, or 'First time'"
              icon={FileText}
            >
              <div className="relative">
                <textarea
                  value={form.mun_experience}
                  onChange={(e) => set('mun_experience')(e.target.value)}
                  placeholder="Detail your previous MUN participation, past conferences attended, committees, and any awards won. If this is your first conference, write 'First time MUNer'..."
                  rows={4}
                  className={`input-field resize-none leading-relaxed pb-6 ${errors.mun_experience ? 'input-field-error' : ''}`}
                />
                <span className="absolute right-3 bottom-2 text-[10px] font-mono text-slate-500 font-medium">
                  {form.mun_experience.length} / 5000 chars
                </span>
              </div>
            </FormFieldWrapper>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary sm:w-auto px-8"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit EUMUN 2026 Registration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Server Error Alert ── */}
        {serverError && (
          <div className="rounded-xl bg-rose-950/40 border border-rose-800/60 p-4 text-xs font-semibold text-rose-300 flex items-start gap-3 animate-fade-in" role="alert">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>{serverError}</p>
          </div>
        )}

      </form>
    </div>
  )
}


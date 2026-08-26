import { z } from 'zod'

export const COMMITTEES = [
  'Open Allocation (To Be Decided Upon Official Release)',
  'Crisis & Strategic Affairs',
  'International Law & Justice',
  'General Assembly & Disarmament',
  'Human Rights & Humanitarian Affairs',
  'Economics & Sustainable Development',
  'International Press / Media (IP)',
  'Specialized / National Body',
] as const

export type Committee = (typeof COMMITTEES)[number] | string

export const ROLES = ['Delegate', 'Chair', 'IP Reporter', 'Crisis Director'] as const
export type Role = (typeof ROLES)[number]

export const STATUSES = ['pending', 'confirmed', 'rejected', 'waitlisted'] as const
export type Status = (typeof STATUSES)[number]

export const delegationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name too long')
    .trim(),
  department: z
    .string()
    .min(2, 'Department/batch is required')
    .max(255, 'Department too long')
    .trim(),
  phone: z
    .string()
    .min(7, 'Phone number too short')
    .max(30, 'Phone number too long')
    .regex(/^[+\d\s\-()]+$/, 'Invalid phone number format')
    .trim(),
  whatsapp: z
    .string()
    .min(7, 'WhatsApp number too short')
    .max(30, 'WhatsApp number too long')
    .regex(/^[+\d\s\-()]+$/, 'Invalid WhatsApp number format')
    .trim(),
  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((v) => !isNaN(Date.parse(v)), { message: 'Invalid date format' }),
  emergency_contact: z
    .string()
    .min(7, 'Emergency contact too short')
    .max(255, 'Emergency contact too long')
    .trim(),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .trim()
    .toLowerCase(),
  committee_1st: z
    .string()
    .min(1, 'Committee preference is required')
    .max(500, 'Preference too long')
    .trim(),
  committee_2nd: z.string().default('Open Allocation'),
  preferred_role: z.string().default('Delegate'),
  mun_experience: z
    .string()
    .min(2, 'Please provide your MUN experience (or write First Time)')
    .max(5000, 'Too long — max 5000 characters')
    .trim(),
  campus_envoy: z.string().default('Syed Saimum Hasan'),
})

export type DelegationInput = z.infer<typeof delegationSchema>

export interface Delegation extends DelegationInput {
  id: number
  status: Status
  created_at: string
  updated_at: string
}


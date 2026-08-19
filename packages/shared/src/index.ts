// =============================================================================
// CivicTrack — Shared TypeScript Types
// All entities defined per the S16 spec data model.
// =============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export enum UserRole {
  Citizen = 'citizen',
  Officer = 'officer',
  Admin = 'admin',
}

export enum IssueStatus {
  Reported = 'reported',
  Acknowledged = 'acknowledged',
  InProgress = 'in_progress',
  Resolved = 'resolved',
  Verified = 'verified',
  Disputed = 'disputed',
  Closed = 'closed',
}

export enum IssueSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

export enum IssueCategory {
  Pothole = 'pothole',
  GarbageOverflow = 'garbage_overflow',
  BrokenStreetlight = 'broken_streetlight',
  WaterLeakage = 'water_leakage',
  SewerOverflow = 'sewer_overflow',
  IllegalParking = 'illegal_parking',
  NoiseComplaint = 'noise_complaint',
  StrayAnimals = 'stray_animals',
  DamagedRoad = 'damaged_road',
  TreeFall = 'tree_fall',
  Other = 'other',
}

// ---------------------------------------------------------------------------
// Geo types (GeoJSON-compatible)
// ---------------------------------------------------------------------------

export interface GeoPoint {
  type: 'Point';
  coordinates: [longitude: number, latitude: number];
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: Array<Array<[longitude: number, latitude: number]>>;
}

// ---------------------------------------------------------------------------
// Core entities
// ---------------------------------------------------------------------------

/**
 * User — a citizen, field officer, or administrator.
 */
export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  wardId?: string;
  avatarUrl?: string;
  reputationScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ward — an administrative geographic zone of the city.
 */
export interface Ward {
  id: string;
  name: string;
  boundary: GeoPolygon;
  departmentMapping: Record<IssueCategory, string>; // category → department id
  officerIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Department — a municipal department responsible for a set of categories.
 */
export interface Department {
  id: string;
  name: string;
  categoryMapping: IssueCategory[];
  headUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Issue — the core entity representing a civic complaint.
 */
export interface Issue {
  id: string;
  /** Client-generated idempotency UUID — prevents duplicate submissions on retry */
  uuid: string;
  citizenId: string;
  category: IssueCategory;
  description: string;
  photoUrls: string[];
  /** GeoJSON Point of the reported issue */
  location: GeoPoint;
  wardId: string;
  departmentId?: string;
  assignedOfficerId?: string;
  status: IssueStatus;
  severity: IssueSeverity;
  /** Computed score: category weight × upvote count × population density factor */
  severityScore: number;
  upvoteCount: number;
  /** ID of the canonical issue if this is a duplicate */
  duplicateOfIssueId?: string;
  /** After-photo URLs uploaded by officer as proof of resolution */
  resolutionPhotoUrls: string[];
  resolutionNote?: string;
  slaDueAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * StatusHistory — immutable audit log of every status transition on an Issue.
 */
export interface StatusHistory {
  id: string;
  issueId: string;
  status: IssueStatus;
  changedBy: string; // User id
  note?: string;
  /** Photo evidence attached to this status change (e.g., resolution proof) */
  photoUrl?: string;
  timestamp: Date;
}

/**
 * Upvote — a citizen upvoting an existing issue to signal shared impact.
 */
export interface Upvote {
  id: string;
  issueId: string;
  citizenId: string;
  createdAt: Date;
}

/**
 * Escalation — triggered automatically when SLA is breached.
 */
export interface Escalation {
  id: string;
  issueId: string;
  escalatedTo: string; // User id (next-level officer or department head)
  escalatedBy?: string; // User id, or undefined for system-triggered
  reason: string;
  isResolved: boolean;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// API response shapes (used by both frontend apps and the API)
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// SLA config (category → resolution hours)
// ---------------------------------------------------------------------------

export const SLA_HOURS: Record<IssueCategory, number> = {
  [IssueCategory.WaterLeakage]: 4,
  [IssueCategory.SewerOverflow]: 4,
  [IssueCategory.TreeFall]: 6,
  [IssueCategory.BrokenStreetlight]: 24,
  [IssueCategory.Pothole]: 48,
  [IssueCategory.GarbageOverflow]: 24,
  [IssueCategory.DamagedRoad]: 72,
  [IssueCategory.IllegalParking]: 12,
  [IssueCategory.NoiseComplaint]: 12,
  [IssueCategory.StrayAnimals]: 24,
  [IssueCategory.Other]: 72,
};


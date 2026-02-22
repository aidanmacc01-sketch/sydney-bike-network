/**
 * Micro2Move Quiz Engine
 *
 * Delivers education modules, grades attempts, enforces cooldowns,
 * and awards credits on first pass. No UI — consumes quiz_spec.json
 * and exposes pure functions for any front-end or API layer.
 */

import quizSpec from "./quiz_spec.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ModuleId = "safety_basics" | "nsw_rules" | "ebike_tech_battery";

export interface ModuleQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

export interface Module {
  id: ModuleId;
  title: string;
  description: string;
  required_score: number;   // 1.0 = 100% correct
  credits_on_pass: number;
  cooldown_seconds: number; // 300 = 5 minutes
  questions: ModuleQuestion[];
}

/**
 * Persisted per-user per-module state.
 * In production this lives in your database (e.g. UserProgress table).
 */
export interface UserProgress {
  userId: string;
  moduleId: ModuleId;
  passed: boolean;
  lastAttemptAt: Date | null;
  nextAllowedAttemptAt: Date | null;
}

/**
 * Persisted per-user credit wallet.
 */
export interface UserAccount {
  userId: string;
  credits: number;
}

// ---------------------------------------------------------------------------
// In-memory stores (replace with DB calls in production)
// ---------------------------------------------------------------------------

const progressStore = new Map<string, UserProgress>();
const accountStore = new Map<string, UserAccount>();

function progressKey(userId: string, moduleId: ModuleId): string {
  return `${userId}::${moduleId}`;
}

function getOrInitProgress(userId: string, moduleId: ModuleId): UserProgress {
  const key = progressKey(userId, moduleId);
  if (!progressStore.has(key)) {
    progressStore.set(key, {
      userId,
      moduleId,
      passed: false,
      lastAttemptAt: null,
      nextAllowedAttemptAt: null,
    });
  }
  return progressStore.get(key)!;
}

function getOrInitAccount(userId: string): UserAccount {
  if (!accountStore.has(userId)) {
    accountStore.set(userId, { userId, credits: 0 });
  }
  return accountStore.get(userId)!;
}

// ---------------------------------------------------------------------------
// Core engine functions
// ---------------------------------------------------------------------------

/**
 * Returns the Module spec by id, or null if not found.
 */
export function getModule(moduleId: ModuleId): Module | null {
  const found = (quizSpec.modules as Module[]).find((m) => m.id === moduleId);
  return found ?? null;
}

/**
 * Returns every module's metadata without question content.
 * Useful for rendering a module-selection screen.
 */
export function listModules(): Omit<Module, "questions">[] {
  return (quizSpec.modules as Module[]).map(({ questions: _q, ...meta }) => meta);
}

/**
 * Checks whether a user is currently allowed to start (or restart) a module.
 *
 * Rules:
 *  - No progress record  → true
 *  - nextAllowedAttemptAt is null → true
 *  - now < nextAllowedAttemptAt  → false (still in cooldown)
 *  - otherwise → true
 */
export function canStartModule(
  progress: UserProgress | null,
  _module: Module,
  now: Date
): boolean {
  if (!progress) return true;
  if (!progress.nextAllowedAttemptAt) return true;
  return now >= progress.nextAllowedAttemptAt;
}

// ---------------------------------------------------------------------------
// Submit attempt
// ---------------------------------------------------------------------------

export interface SubmitQuizAttemptArgs {
  userId: string;
  moduleId: ModuleId;
  /** Selected option index for each question, in question order. */
  answers: number[];
  now: Date;
}

export interface QuestionFeedback {
  questionId: string;
  correct: boolean;
  explanation: string;
}

export interface SubmitQuizAttemptResult {
  status: "passed" | "failed";
  score: number;               // 0.0 – 1.0
  requiredScore: number;       // always 1.0
  nextAllowedAttemptAt: Date | null;
  creditsAwarded: number;
  totalCredits: number;
  feedback: QuestionFeedback[];
}

export interface CooldownError {
  error: "COOLDOWN_ACTIVE";
  message: string;
  nextAllowedAttemptAt: Date;
}

/**
 * Grades a quiz attempt and returns a structured result.
 *
 * Throws a {@link CooldownError} object if the user is still within the
 * post-failure cooldown window — callers should handle this case explicitly.
 *
 * Awards credits only on the **first** successful pass per module to prevent
 * farming.
 */
export function submitQuizAttempt(
  args: SubmitQuizAttemptArgs
): SubmitQuizAttemptResult | CooldownError {
  const { userId, moduleId, answers, now } = args;

  // ── 1. Load module ────────────────────────────────────────────────────────
  const module = getModule(moduleId);
  if (!module) {
    throw new Error(`Unknown moduleId: "${moduleId}"`);
  }

  // ── 2. Load / initialise user records ─────────────────────────────────────
  const progress = getOrInitProgress(userId, moduleId);
  const account = getOrInitAccount(userId);

  // ── 3. Cooldown check ─────────────────────────────────────────────────────
  if (!canStartModule(progress, module, now)) {
    return {
      error: "COOLDOWN_ACTIVE",
      message: `You must wait until ${progress.nextAllowedAttemptAt!.toISOString()} before retrying this module.`,
      nextAllowedAttemptAt: progress.nextAllowedAttemptAt!,
    };
  }

  // ── 4. Validate answer array length ──────────────────────────────────────
  if (answers.length !== module.questions.length) {
    throw new Error(
      `Expected ${module.questions.length} answers for module "${moduleId}", got ${answers.length}.`
    );
  }

  // ── 5. Score the attempt ──────────────────────────────────────────────────
  let correctCount = 0;
  const feedback: QuestionFeedback[] = module.questions.map((q, i) => {
    const isCorrect = answers[i] === q.correct_option_index;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      correct: isCorrect,
      explanation: q.explanation,
    };
  });

  const score = correctCount / module.questions.length;
  const passed = score >= module.required_score; // requires 1.0 (100%)

  // ── 6a. Failed attempt ────────────────────────────────────────────────────
  if (!passed) {
    progress.lastAttemptAt = now;
    progress.nextAllowedAttemptAt = new Date(
      now.getTime() + module.cooldown_seconds * 1_000
    );
    // Persist (in-memory store already holds the reference; DB layer would save here)

    return {
      status: "failed",
      score,
      requiredScore: module.required_score,
      nextAllowedAttemptAt: progress.nextAllowedAttemptAt,
      creditsAwarded: 0,
      totalCredits: account.credits,
      feedback,
    };
  }

  // ── 6b. Passed attempt ────────────────────────────────────────────────────
  const wasPreviouslyPassed = progress.passed;

  progress.passed = true;
  progress.lastAttemptAt = now;
  progress.nextAllowedAttemptAt = null; // no cooldown once the module is passed

  let creditsAwarded = 0;
  if (!wasPreviouslyPassed) {
    creditsAwarded = module.credits_on_pass;
    account.credits += creditsAwarded;
  }
  // If already passed, award 0 credits to prevent farming.

  // Persist (in-memory stores update by reference; DB layer would save here)

  return {
    status: "passed",
    score,
    requiredScore: module.required_score,
    nextAllowedAttemptAt: null,
    creditsAwarded,
    totalCredits: account.credits,
    // Every question was correct on a pass, so mark all true
    feedback: module.questions.map((q) => ({
      questionId: q.id,
      correct: true,
      explanation: q.explanation,
    })),
  };
}

// ---------------------------------------------------------------------------
// Type guard helper for consumers
// ---------------------------------------------------------------------------

export function isCooldownError(
  result: SubmitQuizAttemptResult | CooldownError
): result is CooldownError {
  return (result as CooldownError).error === "COOLDOWN_ACTIVE";
}

// ---------------------------------------------------------------------------
// Read-only progress helpers (for UI state queries)
// ---------------------------------------------------------------------------

/**
 * Returns the current progress record for a user/module pair,
 * or a default "not started" record if none exists.
 */
export function getUserProgress(
  userId: string,
  moduleId: ModuleId
): UserProgress {
  return getOrInitProgress(userId, moduleId);
}

/**
 * Returns the user's credit balance, defaulting to 0.
 */
export function getUserCredits(userId: string): number {
  return getOrInitAccount(userId).credits;
}

/**
 * Converts credits to an approximate AUD value using the spec rate.
 */
export function creditsToAUD(credits: number): number {
  return credits * (quizSpec.credit_to_currency_rate as number);
}

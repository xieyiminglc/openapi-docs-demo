/**
 * A tiny in-memory user manager — the TypeScript counterpart of
 * `go-sdk-demo/usermgr` and `python-sdk-demo/usermgr`.
 *
 * ## Quick start
 *
 * ```ts
 * import { Client } from 'usermgr'
 *
 * const c = new Client()
 * const id = c.create({ name: 'alice', age: 20, email: 'alice@example.com' })
 * console.log(c.get(id).name)  // 'alice'
 * ```
 *
 * ## Error handling
 *
 * Missing lookups throw {@link NotFoundError}; invalid input throws
 * {@link ValidationError} carrying the offending `field`.
 *
 * @module
 */

/** Raised by {@link Client.get} when no user matches the given ID. */
export class NotFoundError extends Error {
  constructor(id: number) {
    super(`usermgr: user ${id} not found`)
    this.name = 'NotFoundError'
  }
}

/** Raised when input fields fail validation. */
export class ValidationError extends Error {
  /** The offending field, e.g. `"name"`. */
  readonly field: string
  constructor(field: string, message: string) {
    super(`usermgr: invalid ${field}: ${message}`)
    this.name = 'ValidationError'
    this.field = field
  }
}

/** The canonical user record. */
export interface User {
  id: number
  name: string
  age: number
  email: string
}

/**
 * Parameters required to register a new user.
 *
 * Validation rules — see {@link Client.create}:
 * - `name`: 1–31 characters
 * - `age`: integer in `[0, 200)`
 * - `email`: must contain `@`
 */
export interface CreateParams {
  name: string
  age: number
  email: string
}

/**
 * Filter and pagination options for {@link Client.list}.
 *
 * Omitted fields fall back to sensible defaults: no filter, page 1,
 * size 20 (capped at 100).
 */
export interface ListOptions {
  /** Case-insensitive substring filter on `name`. */
  keyword?: string
  /** 1-based page number. */
  page?: number
  /** Items per page (clamped to `[1, 100]`). */
  size?: number
}

/**
 * A thread-safe-ish in-memory user store.
 *
 * (Node's single-threaded event loop makes locking unnecessary; this class
 * mirrors the Go/Python siblings for parity.)
 */
export class Client {
  private nextId = 0
  private users = new Map<number, User>()

  /**
   * Validate `params` and insert a new user.
   *
   * @returns The generated user ID.
   * @throws {ValidationError} If any field is invalid.
   */
  create(params: CreateParams): number {
    if (params.name.length < 1 || params.name.length > 31) {
      throw new ValidationError('name', 'must be 1-31 chars')
    }
    if (!Number.isInteger(params.age) || params.age < 0 || params.age >= 200) {
      throw new ValidationError('age', 'must be in [0, 200)')
    }
    if (!params.email.includes('@')) {
      throw new ValidationError('email', 'must contain @')
    }

    this.nextId += 1
    const id = this.nextId
    this.users.set(id, { id, ...params })
    return id
  }

  /**
   * Return the user with the given ID.
   *
   * @throws {NotFoundError} If no such user exists.
   */
  get(id: number): User {
    const u = this.users.get(id)
    if (!u) throw new NotFoundError(id)
    return u
  }

  /**
   * Return users matching `opts` plus the pre-pagination total.
   *
   * Results are sorted by `id` ascending for deterministic output.
   */
  list(opts: ListOptions = {}): { users: User[]; total: number } {
    const page = opts.page && opts.page > 0 ? opts.page : 1
    const sizeRaw = opts.size && opts.size > 0 ? opts.size : 20
    const size = Math.min(sizeRaw, 100)
    const kw = (opts.keyword ?? '').toLowerCase()

    const all = [...this.users.values()]
      .filter((u) => kw === '' || u.name.toLowerCase().includes(kw))
      .sort((a, b) => a.id - b.id)

    const start = (page - 1) * size
    return { users: all.slice(start, start + size), total: all.length }
  }
}

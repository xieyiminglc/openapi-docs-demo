/**
 * Hono + @hono/zod-openapi demo — 与 go-server 同样的 UserService API surface.
 *
 * 类型驱动：zod schema 同时承担运行时校验、TS 类型推断、OpenAPI 生成。
 */
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

// ---------- Schemas ----------
const BaseResp = z.object({
  status_code: z.number().int().openapi({ example: 0 }),
  status_msg: z.string().openapi({ example: 'ok' }),
})

const UserInfo = z.object({
  user_id: z.number().int(),
  name: z.string(),
  age: z.number().int().nonnegative().lt(200),
  email: z.string().email(),
})

const CreateUserReq = z.object({
  name: z.string().min(1).max(31),
  age: z.number().int().nonnegative().lt(200),
  email: z.string().email(),
})

const CreateUserResp = z.object({ base: BaseResp, user_id: z.number().int() })
const GetUserResp = z.object({ base: BaseResp, user: UserInfo })
const ListUsersResp = z.object({ base: BaseResp, users: z.array(UserInfo), total: z.number().int() })

// ---------- Routes ----------
const createUser = createRoute({
  method: 'post',
  path: '/api/v1/users',
  tags: ['UserService'],
  operationId: 'CreateUser',
  summary: 'Create a user',
  request: { body: { content: { 'application/json': { schema: CreateUserReq } } } },
  responses: {
    200: { description: 'ok', content: { 'application/json': { schema: CreateUserResp } } },
  },
})

const getUser = createRoute({
  method: 'get',
  path: '/api/v1/users/{user_id}',
  tags: ['UserService'],
  operationId: 'GetUser',
  summary: 'Get a user by ID',
  request: {
    params: z.object({ user_id: z.string().regex(/^\d+$/).openapi({ example: '42' }) }),
    headers: z.object({ 'x-trace-id': z.string().optional() }),
  },
  responses: {
    200: { description: 'ok', content: { 'application/json': { schema: GetUserResp } } },
  },
})

const listUsers = createRoute({
  method: 'get',
  path: '/api/v1/users',
  tags: ['UserService'],
  operationId: 'ListUsers',
  summary: 'List users',
  request: {
    query: z.object({
      q: z.string().optional(),
      page: z.coerce.number().int().min(1).default(1),
      size: z.coerce.number().int().min(1).max(100).default(20),
    }),
  },
  responses: {
    200: { description: 'ok', content: { 'application/json': { schema: ListUsersResp } } },
  },
})

// ---------- App ----------
export const app = new OpenAPIHono()

app.openapi(createUser, (c) =>
  c.json({ base: { status_code: 0, status_msg: 'ok' }, user_id: 42 }),
)

app.openapi(getUser, (c) => {
  const { user_id } = c.req.valid('param')
  return c.json({
    base: { status_code: 0, status_msg: 'ok' },
    user: { user_id: Number(user_id), name: 'alice', age: 20, email: 'a@example.com' },
  })
})

app.openapi(listUsers, (c) =>
  c.json({ base: { status_code: 0, status_msg: 'ok' }, users: [], total: 0 }),
)

// Mount the spec at /openapi.json (curl this to grab the spec at runtime)
app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: { title: 'UserService', version: '0.1.0' },
})

import { strict as assert } from 'node:assert'
import { describe, test } from 'node:test'

import { Client, NotFoundError, ValidationError } from './usermgr.ts'

function seed(): Client {
  const c = new Client()
  c.create({ name: 'alice', age: 20, email: 'a@x.com' })
  c.create({ name: 'bob', age: 30, email: 'b@x.com' })
  c.create({ name: 'carol', age: 40, email: 'c@x.com' })
  return c
}

describe('usermgr.Client', () => {
  test('create assigns sequential ids', () => {
    const c = new Client()
    assert.equal(c.create({ name: 'a', age: 1, email: 'a@x' }), 1)
    assert.equal(c.create({ name: 'b', age: 2, email: 'b@x' }), 2)
  })

  test('get returns user', () => {
    assert.equal(seed().get(2).name, 'bob')
  })

  test('get on missing id throws NotFoundError', () => {
    assert.throws(() => new Client().get(404), NotFoundError)
  })

  test('list filters and paginates', () => {
    const { users, total } = seed().list({ keyword: 'a' })
    assert.equal(total, 2)
    assert.deepEqual(
      users.map((u) => u.name),
      ['alice', 'carol'],
    )
  })

  for (const [params, field] of [
    [{ name: '', age: 10, email: 'x@y' }, 'name'],
    [{ name: 'x', age: -1, email: 'x@y' }, 'age'],
    [{ name: 'x', age: 10, email: 'noat' }, 'email'],
  ] as const) {
    test(`validation: ${field}`, () => {
      try {
        new Client().create(params)
        assert.fail('expected throw')
      } catch (err) {
        assert.ok(err instanceof ValidationError)
        assert.equal((err as ValidationError).field, field)
      }
    })
  }
})

# ts-sdk-demo

A tiny in-memory user manager — the TypeScript counterpart of
`go-sdk-demo/usermgr` and `python-sdk-demo/usermgr`.

## Quick start

```ts
import { Client } from 'usermgr'

const c = new Client()
const id = c.create({ name: 'alice', age: 20, email: 'alice@example.com' })
console.log(c.get(id).name)  // 'alice'
```

## Error handling

Missing lookups throw [NotFoundError](#notfounderror); invalid input throws
[ValidationError](#validationerror) carrying the offending `field`.

## Classes

### Client

Defined in: src/usermgr.ts:85

A thread-safe-ish in-memory user store.

(Node's single-threaded event loop makes locking unnecessary; this class
mirrors the Go/Python siblings for parity.)

#### Constructors

##### Constructor

```ts
new Client(): Client;
```

###### Returns

[`Client`](#client)

#### Methods

##### create()

```ts
create(params: CreateParams): number;
```

Defined in: src/usermgr.ts:95

Validate `params` and insert a new user.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | [`CreateParams`](#createparams) |

###### Returns

`number`

The generated user ID.

###### Throws

If any field is invalid.

##### get()

```ts
get(id: number): User;
```

Defined in: src/usermgr.ts:117

Return the user with the given ID.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `number` |

###### Returns

[`User`](#user)

###### Throws

If no such user exists.

##### list()

```ts
list(opts?: ListOptions): {
  total: number;
  users: User[];
};
```

Defined in: src/usermgr.ts:128

Return users matching `opts` plus the pre-pagination total.

Results are sorted by `id` ascending for deterministic output.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts` | [`ListOptions`](#listoptions) |

###### Returns

```ts
{
  total: number;
  users: User[];
}
```

###### total

```ts
total: number;
```

###### users

```ts
users: User[];
```

***

### NotFoundError

Defined in: src/usermgr.ts:24

Raised by [Client.get](#get) when no user matches the given ID.

#### Extends

- `Error`

#### Constructors

##### Constructor

```ts
new NotFoundError(id: number): NotFoundError;
```

Defined in: src/usermgr.ts:25

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `number` |

###### Returns

[`NotFoundError`](#notfounderror)

###### Overrides

```ts
Error.constructor
```

#### Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="cause"></a> `cause?` | `unknown` | `Error.cause` | node\_modules/typescript/lib/lib.es2022.error.d.ts:26 |
| <a id="message"></a> `message` | `string` | `Error.message` | node\_modules/typescript/lib/lib.es5.d.ts:1077 |
| <a id="name"></a> `name` | `string` | `Error.name` | node\_modules/typescript/lib/lib.es5.d.ts:1076 |
| <a id="stack"></a> `stack?` | `string` | `Error.stack` | node\_modules/typescript/lib/lib.es5.d.ts:1078 |

***

### ValidationError

Defined in: src/usermgr.ts:32

Raised when input fields fail validation.

#### Extends

- `Error`

#### Constructors

##### Constructor

```ts
new ValidationError(field: string, message: string): ValidationError;
```

Defined in: src/usermgr.ts:35

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `field` | `string` |
| `message` | `string` |

###### Returns

[`ValidationError`](#validationerror)

###### Overrides

```ts
Error.constructor
```

#### Properties

| Property | Modifier | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="cause-1"></a> `cause?` | `public` | `unknown` | - | `Error.cause` | node\_modules/typescript/lib/lib.es2022.error.d.ts:26 |
| <a id="field"></a> `field` | `readonly` | `string` | The offending field, e.g. `"name"`. | - | src/usermgr.ts:34 |
| <a id="message-1"></a> `message` | `public` | `string` | - | `Error.message` | node\_modules/typescript/lib/lib.es5.d.ts:1077 |
| <a id="name-1"></a> `name` | `public` | `string` | - | `Error.name` | node\_modules/typescript/lib/lib.es5.d.ts:1076 |
| <a id="stack-1"></a> `stack?` | `public` | `string` | - | `Error.stack` | node\_modules/typescript/lib/lib.es5.d.ts:1078 |

## Interfaces

### CreateParams

Defined in: src/usermgr.ts:58

Parameters required to register a new user.

Validation rules — see [Client.create](#create):
- `name`: 1–31 characters
- `age`: integer in `[0, 200)`
- `email`: must contain `@`

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="age"></a> `age` | `number` | src/usermgr.ts:60 |
| <a id="email"></a> `email` | `string` | src/usermgr.ts:61 |
| <a id="name-2"></a> `name` | `string` | src/usermgr.ts:59 |

***

### ListOptions

Defined in: src/usermgr.ts:70

Filter and pagination options for [Client.list](#list).

Omitted fields fall back to sensible defaults: no filter, page 1,
size 20 (capped at 100).

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="keyword"></a> `keyword?` | `string` | Case-insensitive substring filter on `name`. | src/usermgr.ts:72 |
| <a id="page"></a> `page?` | `number` | 1-based page number. | src/usermgr.ts:74 |
| <a id="size"></a> `size?` | `number` | Items per page (clamped to `[1, 100]`). | src/usermgr.ts:76 |

***

### User

Defined in: src/usermgr.ts:43

The canonical user record.

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="age-1"></a> `age` | `number` | src/usermgr.ts:46 |
| <a id="email-1"></a> `email` | `string` | src/usermgr.ts:47 |
| <a id="id"></a> `id` | `number` | src/usermgr.ts:44 |
| <a id="name-3"></a> `name` | `string` | src/usermgr.ts:45 |

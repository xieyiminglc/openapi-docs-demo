# usermgr

A small in-memory client for managing users.

This package exists as the Python counterpart of ``go-sdk-demo/usermgr``,
showing how Python SDK docs flow from source to the docs site via
``pydoc-markdown``.

Quick start::

    from usermgr import Client, CreateParams

    c = Client()
    uid = c.create(CreateParams(name="alice", age=20, email="a@example.com"))
    print(c.get(uid).name)
    # 'alice'

Error handling
    Lookups for missing IDs raise :class:`NotFoundError`. Validation
    failures raise :class:`ValidationError` carrying the offending field.

## NotFoundError

```python
class NotFoundError(LookupError)
```

Raised by :meth:`Client.get` when no user matches the given ID.

## ValidationError

```python
class ValidationError(ValueError)
```

Raised when input fields fail validation.

**Attributes**:

- `field` - The name of the offending field (e.g. ``"name"``).
- `message` - A human-readable reason.

## User

```python
class User()
```

A canonical user record returned by the client.

## CreateParams

```python
class CreateParams()
```

Parameters required to register a new user.

All fields are required; see :meth:`Client.create` for validation rules.

## ListOptions

```python
class ListOptions()
```

Filter and pagination options for :meth:`Client.list`.

A default-constructed instance returns all users in insertion order.

**Attributes**:

- `keyword` - Case-insensitive substring filter on ``name``.
- `page` - 1-based page number. Values ``<= 0`` are treated as 1.
- `size` - Items per page (capped at 100). Values ``<= 0`` default to 20.

## Client

```python
class Client()
```

A thread-safe in-memory user store.

Example::

c = Client()
c.create(CreateParams(name="alice", age=20, email="a@x.com"))
# 1

#### Client.create

```python
def create(params: CreateParams) -> int
```

Validate ``params`` and insert a new user.

**Arguments**:

- `params` - The new user's fields.
  

**Returns**:

  The generated user ID.
  

**Raises**:

- `ValidationError` - If ``name`` is empty or > 31 chars, ``age``
  is outside ``[0, 200)``, or ``email`` lacks ``@``.

#### Client.get

```python
def get(user_id: int) -> User
```

Return the user with the given ID.

**Raises**:

- `NotFoundError` - If no such user exists.

#### Client.list

```python
def list(opts: Optional[ListOptions] = None) -> tuple[list[User], int]
```

Return users matching ``opts`` plus the pre-pagination total.

Results are sorted by ``id`` ascending for deterministic output.

**Arguments**:

- `opts` - Filter and pagination; ``None`` yields defaults.
  

**Returns**:

  A ``(users, total)`` tuple.


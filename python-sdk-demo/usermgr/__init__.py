"""A small in-memory client for managing users.

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
"""

from __future__ import annotations

from dataclasses import dataclass
from threading import RLock
from typing import Optional

__all__ = [
    "Client",
    "CreateParams",
    "ListOptions",
    "NotFoundError",
    "User",
    "ValidationError",
]


class NotFoundError(LookupError):
    """Raised by :meth:`Client.get` when no user matches the given ID."""


class ValidationError(ValueError):
    """Raised when input fields fail validation.

    Attributes:
        field: The name of the offending field (e.g. ``"name"``).
        message: A human-readable reason.
    """

    def __init__(self, field: str, message: str) -> None:
        super().__init__(f"invalid {field}: {message}")
        self.field = field
        self.message = message


@dataclass
class User:
    """A canonical user record returned by the client."""

    id: int
    name: str
    age: int
    email: str


@dataclass
class CreateParams:
    """Parameters required to register a new user.

    All fields are required; see :meth:`Client.create` for validation rules.
    """

    name: str
    age: int
    email: str


@dataclass
class ListOptions:
    """Filter and pagination options for :meth:`Client.list`.

    A default-constructed instance returns all users in insertion order.

    Attributes:
        keyword: Case-insensitive substring filter on ``name``.
        page: 1-based page number. Values ``<= 0`` are treated as 1.
        size: Items per page (capped at 100). Values ``<= 0`` default to 20.
    """

    keyword: str = ""
    page: int = 1
    size: int = 20


class Client:
    """A thread-safe in-memory user store.

    Example::

        c = Client()
        c.create(CreateParams(name="alice", age=20, email="a@x.com"))
        # 1
    """

    def __init__(self) -> None:
        self._lock = RLock()
        self._next_id = 0
        self._users: dict[int, User] = {}

    def create(self, params: CreateParams) -> int:
        """Validate ``params`` and insert a new user.

        Args:
            params: The new user's fields.

        Returns:
            The generated user ID.

        Raises:
            ValidationError: If ``name`` is empty or > 31 chars, ``age``
                is outside ``[0, 200)``, or ``email`` lacks ``@``.
        """
        if not 1 <= len(params.name) <= 31:
            raise ValidationError("name", "must be 1-31 chars")
        if not 0 <= params.age < 200:
            raise ValidationError("age", "must be in [0, 200)")
        if "@" not in params.email:
            raise ValidationError("email", "must contain @")

        with self._lock:
            self._next_id += 1
            uid = self._next_id
            self._users[uid] = User(id=uid, name=params.name, age=params.age, email=params.email)
            return uid

    def get(self, user_id: int) -> User:
        """Return the user with the given ID.

        Raises:
            NotFoundError: If no such user exists.
        """
        with self._lock:
            try:
                return self._users[user_id]
            except KeyError:
                raise NotFoundError(f"user {user_id} not found") from None

    def list(self, opts: Optional[ListOptions] = None) -> tuple[list[User], int]:
        """Return users matching ``opts`` plus the pre-pagination total.

        Results are sorted by ``id`` ascending for deterministic output.

        Args:
            opts: Filter and pagination; ``None`` yields defaults.

        Returns:
            A ``(users, total)`` tuple.
        """
        opts = opts or ListOptions()
        page = opts.page if opts.page > 0 else 1
        size = opts.size if opts.size > 0 else 20
        size = min(size, 100)

        with self._lock:
            kw = opts.keyword.lower()
            matched = [u for u in self._users.values() if kw == "" or kw in u.name.lower()]
            matched.sort(key=lambda u: u.id)
            total = len(matched)
            start = (page - 1) * size
            return matched[start : start + size], total

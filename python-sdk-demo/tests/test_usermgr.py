"""Smoke tests so the SDK examples stay honest."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from usermgr import Client, CreateParams, ListOptions, NotFoundError, ValidationError


def make_client() -> Client:
    c = Client()
    c.create(CreateParams(name="alice", age=20, email="a@x.com"))
    c.create(CreateParams(name="bob", age=30, email="b@x.com"))
    c.create(CreateParams(name="carol", age=40, email="c@x.com"))
    return c


def test_create_assigns_sequential_ids() -> None:
    c = Client()
    assert c.create(CreateParams(name="a", age=1, email="a@x")) == 1
    assert c.create(CreateParams(name="b", age=2, email="b@x")) == 2


def test_get_returns_user() -> None:
    c = make_client()
    assert c.get(2).name == "bob"


def test_get_missing_raises_notfound() -> None:
    with pytest.raises(NotFoundError):
        Client().get(404)


def test_list_filters_and_paginates() -> None:
    c = make_client()
    users, total = c.list(ListOptions(keyword="a"))
    assert total == 2
    assert [u.name for u in users] == ["alice", "carol"]


@pytest.mark.parametrize(
    ("params", "field"),
    [
        (CreateParams(name="", age=10, email="x@y"), "name"),
        (CreateParams(name="x", age=-1, email="x@y"), "age"),
        (CreateParams(name="x", age=10, email="noat"), "email"),
    ],
)
def test_validation_errors(params: CreateParams, field: str) -> None:
    with pytest.raises(ValidationError) as exc:
        Client().create(params)
    assert exc.value.field == field

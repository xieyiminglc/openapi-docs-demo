"""
FastAPI demo — 与 go-server 同样的 UserService API surface。

启动：    uvicorn app.main:app --reload --port 8000
导出 spec：python -m app.export > openapi.json
交互文档：http://localhost:8000/docs（Swagger UI）
        http://localhost:8000/redoc（ReDoc）
"""

from __future__ import annotations

from typing import Annotated

from fastapi import FastAPI, Header, Path, Query
from pydantic import BaseModel, Field

app = FastAPI(
    title="UserService",
    version="0.1.0",
    description="FastAPI demo for the OpenAPI docs-site project.",
)


# ---------- Models ----------
class BaseResp(BaseModel):
    status_code: int = 0
    status_msg: str = "ok"


class UserInfo(BaseModel):
    user_id: int
    name: str
    age: int = Field(ge=0, lt=200)
    email: str


class CreateUserReq(BaseModel):
    name: str = Field(min_length=1, max_length=31)
    age: int = Field(ge=0, lt=200)
    email: str


class CreateUserResp(BaseModel):
    base: BaseResp
    user_id: int


class GetUserResp(BaseModel):
    base: BaseResp
    user: UserInfo


class ListUsersResp(BaseModel):
    base: BaseResp
    users: list[UserInfo]
    total: int


# ---------- Routes ----------
@app.post(
    "/api/v1/users",
    response_model=CreateUserResp,
    tags=["UserService"],
    operation_id="CreateUser",
    summary="Create a user",
)
async def create_user(req: CreateUserReq) -> CreateUserResp:
    return CreateUserResp(base=BaseResp(), user_id=42)


@app.get(
    "/api/v1/users/{user_id}",
    response_model=GetUserResp,
    tags=["UserService"],
    operation_id="GetUser",
    summary="Get a user by ID",
)
async def get_user(
    user_id: Annotated[int, Path()],
    x_trace_id: Annotated[str | None, Header(alias="X-Trace-Id")] = None,
) -> GetUserResp:
    return GetUserResp(
        base=BaseResp(),
        user=UserInfo(user_id=user_id, name="alice", age=20, email="a@example.com"),
    )


@app.get(
    "/api/v1/users",
    response_model=ListUsersResp,
    tags=["UserService"],
    operation_id="ListUsers",
    summary="List users",
)
async def list_users(
    q: Annotated[str | None, Query()] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> ListUsersResp:
    return ListUsersResp(base=BaseResp(), users=[], total=0)

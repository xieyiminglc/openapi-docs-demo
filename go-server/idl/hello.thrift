namespace go demo.user

// ---------- Common ----------
struct BaseResp {
    1: i32    StatusCode (api.body="status_code")
    2: string StatusMsg  (api.body="status_msg")
}

// ---------- CreateUser ----------
struct CreateUserReq {
    1: string Name  (api.body="name", api.vd="len($)>0 && len($)<32")
    2: i32    Age   (api.body="age",  api.vd="$>=0 && $<200")
    3: string Email (api.body="email")
}

struct CreateUserResp {
    1: BaseResp Base (api.body="base")
    2: i64      UserID (api.body="user_id")
}

// ---------- GetUser ----------
struct GetUserReq {
    1: i64    UserID  (api.path="user_id")
    2: string TraceID (api.header="X-Trace-Id")
}

struct UserInfo {
    1: i64    UserID (api.body="user_id")
    2: string Name   (api.body="name")
    3: i32    Age    (api.body="age")
    4: string Email  (api.body="email")
}

struct GetUserResp {
    1: BaseResp Base (api.body="base")
    2: UserInfo User (api.body="user")
}

// ---------- ListUsers ----------
struct ListUsersReq {
    1: optional string Keyword (api.query="q")
    2: optional i32    Page    (api.query="page")
    3: optional i32    Size    (api.query="size")
}

struct ListUsersResp {
    1: BaseResp        Base  (api.body="base")
    2: list<UserInfo>  Users (api.body="users")
    3: i64             Total (api.body="total")
}

service UserService {
    CreateUserResp CreateUser(1: CreateUserReq req) (
        api.post = "/api/v1/users",
        api.handler_path = "user",
    )

    GetUserResp GetUser(1: GetUserReq req) (
        api.get = "/api/v1/users/:user_id",
        api.handler_path = "user",
    )

    ListUsersResp ListUsers(1: ListUsersReq req) (
        api.get = "/api/v1/users",
        api.handler_path = "user",
    )
} (
    api.base_domain = "http://127.0.0.1:6789",
)

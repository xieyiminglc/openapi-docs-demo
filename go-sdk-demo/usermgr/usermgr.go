package usermgr

import (
	"errors"
	"fmt"
	"sort"
	"strings"
	"sync"
)

// ErrNotFound is returned by [Client.Get] when no user matches the given ID.
var ErrNotFound = errors.New("usermgr: user not found")

// ValidationError describes one or more invalid fields on the input.
//
// Callers can match this with [errors.As] to surface field-level details to
// end users.
type ValidationError struct {
	Field   string
	Message string
}

// Error implements the [error] interface.
func (e *ValidationError) Error() string {
	return fmt.Sprintf("usermgr: invalid %s: %s", e.Field, e.Message)
}

// User is the canonical user record returned by the client.
type User struct {
	ID    int64
	Name  string
	Age   int
	Email string
}

// CreateParams carries the fields needed to register a new user.
//
// All fields are required. See [Client.Create] for the validation rules.
type CreateParams struct {
	Name  string
	Age   int
	Email string
}

// ListOptions filters and paginates [Client.List] results.
//
// A zero-value ListOptions returns all users in insertion order.
type ListOptions struct {
	// Keyword filters users whose Name contains this substring (case-insensitive).
	Keyword string
	// Page is 1-based. Zero is treated as 1.
	Page int
	// Size caps results per page. Zero is treated as 20. Maximum is 100.
	Size int
}

// Client is a thread-safe handle to an in-memory user store.
//
// The zero value is not usable; obtain a Client via [New].
type Client struct {
	mu     sync.RWMutex
	nextID int64
	users  map[int64]User
}

// New returns a ready-to-use [Client] with an empty store.
func New() *Client {
	return &Client{users: make(map[int64]User)}
}

// Create validates p and inserts a new user, returning its generated ID.
//
// Validation rules:
//   - Name must be 1–31 characters
//   - Age must be in [0, 200)
//   - Email must contain "@"
//
// On any validation failure Create returns a [*ValidationError] describing the
// first offending field.
func (c *Client) Create(p CreateParams) (int64, error) {
	switch {
	case len(p.Name) == 0 || len(p.Name) > 31:
		return 0, &ValidationError{Field: "Name", Message: "must be 1-31 chars"}
	case p.Age < 0 || p.Age >= 200:
		return 0, &ValidationError{Field: "Age", Message: "must be in [0, 200)"}
	case !strings.Contains(p.Email, "@"):
		return 0, &ValidationError{Field: "Email", Message: "must contain @"}
	}

	c.mu.Lock()
	defer c.mu.Unlock()
	c.nextID++
	id := c.nextID
	c.users[id] = User{ID: id, Name: p.Name, Age: p.Age, Email: p.Email}
	return id, nil
}

// Get returns the user with the given ID.
//
// It returns [ErrNotFound] (wrappable with [errors.Is]) if no such user exists.
func (c *Client) Get(id int64) (User, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	u, ok := c.users[id]
	if !ok {
		return User{}, ErrNotFound
	}
	return u, nil
}

// List returns users matching opts plus the total count *before* pagination.
//
// Results are sorted by ID ascending for deterministic output.
func (c *Client) List(opts ListOptions) (users []User, total int) {
	if opts.Page <= 0 {
		opts.Page = 1
	}
	if opts.Size <= 0 {
		opts.Size = 20
	}
	if opts.Size > 100 {
		opts.Size = 100
	}

	c.mu.RLock()
	defer c.mu.RUnlock()

	all := make([]User, 0, len(c.users))
	kw := strings.ToLower(opts.Keyword)
	for _, u := range c.users {
		if kw != "" && !strings.Contains(strings.ToLower(u.Name), kw) {
			continue
		}
		all = append(all, u)
	}
	sort.Slice(all, func(i, j int) bool { return all[i].ID < all[j].ID })

	total = len(all)
	start := (opts.Page - 1) * opts.Size
	if start >= total {
		return nil, total
	}
	end := start + opts.Size
	if end > total {
		end = total
	}
	return all[start:end], total
}

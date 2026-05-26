// Package usermgr provides a small in-memory client for managing users.
//
// It exists as a documentation demo for the openapi-docs-demo project, paired
// with the equivalent HTTP services in go-server/, python-server/, and
// ts-server/.
//
// # Quick start
//
//	client := usermgr.New()
//	id, _ := client.Create(usermgr.CreateParams{
//	    Name:  "alice",
//	    Age:   20,
//	    Email: "alice@example.com",
//	})
//	user, _ := client.Get(id)
//	fmt.Println(user.Name)
//
// # Error handling
//
// Lookups for missing IDs return [ErrNotFound]; validation errors return
// [*ValidationError] so callers can distinguish them with [errors.Is] and
// [errors.As].
package usermgr

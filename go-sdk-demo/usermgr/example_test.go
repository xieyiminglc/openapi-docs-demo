package usermgr_test

import (
	"errors"
	"fmt"

	"github.com/xieyiminglc/openapi-docs-demo/go-sdk-demo/usermgr"
)

func ExampleClient_Create() {
	c := usermgr.New()
	id, err := c.Create(usermgr.CreateParams{
		Name:  "alice",
		Age:   20,
		Email: "alice@example.com",
	})
	fmt.Println(id, err)
	// Output: 1 <nil>
}

func ExampleClient_Get() {
	c := usermgr.New()
	id, _ := c.Create(usermgr.CreateParams{Name: "bob", Age: 30, Email: "b@e.com"})

	u, _ := c.Get(id)
	fmt.Println(u.Name)
	// Output: bob
}

func ExampleClient_Get_notFound() {
	c := usermgr.New()
	_, err := c.Get(404)
	fmt.Println(errors.Is(err, usermgr.ErrNotFound))
	// Output: true
}

func ExampleClient_List() {
	c := usermgr.New()
	_, _ = c.Create(usermgr.CreateParams{Name: "alice", Age: 20, Email: "a@e.com"})
	_, _ = c.Create(usermgr.CreateParams{Name: "bob", Age: 30, Email: "b@e.com"})
	_, _ = c.Create(usermgr.CreateParams{Name: "carol", Age: 40, Email: "c@e.com"})

	page, total := c.List(usermgr.ListOptions{Keyword: "a", Page: 1, Size: 10})
	fmt.Println(total, len(page), page[0].Name, page[1].Name)
	// Output: 2 2 alice carol
}

func ExampleValidationError() {
	c := usermgr.New()
	_, err := c.Create(usermgr.CreateParams{Name: "", Age: 20, Email: "x@y.com"})

	var ve *usermgr.ValidationError
	if errors.As(err, &ve) {
		fmt.Println(ve.Field, "->", ve.Message)
	}
	// Output: Name -> must be 1-31 chars
}

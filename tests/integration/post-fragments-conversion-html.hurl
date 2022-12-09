# tests/integration/post-fragments-conversion-html.hurl
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
```
# This is a fragment
```

HTTP/1.1 201
[Captures]
url: header "Location"

GET {{url}}.html
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/html
```
<h1>This is a fragment</h1>
```

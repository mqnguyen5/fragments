# tests/integration/put-fragments-html.hurl
POST http://localhost:8080/v1/fragments
Content-Type: text/html
[BasicAuth]
user1@email.com:password1
```
<h1>This is a fragment!</h1>
```

HTTP/1.1 201
[Captures]
url: header "Location"

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
```
<h1>This is a fragment!</h1>
```

PUT {{url}}
Content-Type: text/html
[BasicAuth]
user1@email.com:password1
```
<h1>Hello world</h1>
```

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/html"
jsonpath "$.fragment.size" == 21
jsonpath "$.fragment.formats" includes "text/plain"
jsonpath "$.fragment.formats" includes "text/html"

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/html
Content-Length: 21
```
<h1>Hello world</h1>
```

PUT {{url}}
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{
  "error": "invalid data"
}

HTTP/1.1 400

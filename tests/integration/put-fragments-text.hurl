# tests/integration/put-fragments-text.hurl
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
```This is a fragment!```

HTTP/1.1 201
[Captures]
url: header "Location"

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
body == "This is a fragment!"

PUT {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
```Hello world```

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 11
jsonpath "$.fragment.formats" includes "text/plain"

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 11
[Asserts]
body == "Hello world"

PUT {{url}}
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{
  "error": "invalid data"
}

HTTP/1.1 400

# tests/integration/put-fragments-json.hurl
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{
  "title": "Introduction",
  "message": "This is a fragment"
}

HTTP/1.1 201
[Captures]
url: header "Location"

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
{
  "title": "Introduction",
  "message": "This is a fragment"
}

PUT {{url}}
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{
  "student_id": "mqnguyen5",
  "marks": [10, 9.5, 9]
}

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 56
jsonpath "$.fragment.formats" includes "application/json"

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json
Content-Length: 56
{
  "student_id": "mqnguyen5",
  "marks": [10, 9.5, 9]
}

PUT {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
```Invalid data```

HTTP/1.1 400

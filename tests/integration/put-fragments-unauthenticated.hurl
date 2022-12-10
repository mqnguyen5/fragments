# tests/integration/put-fragments-unauthenticated.hurl
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
```This is a fragment!```

HTTP/1.1 201
[Captures]
url: header "Location"

PUT {{url}}
Content-Type: text/plain
```Hello world```

HTTP/1.1 401
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 401
jsonpath "$.error.message" == "Unauthorized"

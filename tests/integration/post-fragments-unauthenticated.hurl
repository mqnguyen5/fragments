# tests/integration/post-fragments-unauthenticated.hurl
# Authenticated POST to /v1/fragments without authenticating
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
```This is a fragment!```

HTTP/1.1 401
[Asserts]
# Status should be "error"
jsonpath "$.status" == "error"
# Error code should be 401
jsonpath "$.error.code" == 401
# Error message should be "Unauthorized"
jsonpath "$.error.message" == "Unauthorized"

# tests/integration/post-fragments-unsupported-type.hurl
# Authenticated POST to /v1/fragments with unsupported type
POST http://localhost:8080/v1/fragments
Content-Type: application/gzip
[BasicAuth]
user1@email.com:password1
```This is a fragment!```

HTTP/1.1 415
[Asserts]
# Status should be "error"
jsonpath "$.status" == "error"
# Error code should be 415
jsonpath "$.error.code" == 415
# Error message should be "Content-Type not supported, got ..."
jsonpath "$.error.message" == "Content-Type not supported, got application/gzip"

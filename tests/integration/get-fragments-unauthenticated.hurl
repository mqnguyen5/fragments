# tests/integration/get-fragments-unauthenticated.hurl
GET http://localhost:8080/v1/fragments

HTTP/1.1 401
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 401
jsonpath "$.error.message" == "Unauthorized"

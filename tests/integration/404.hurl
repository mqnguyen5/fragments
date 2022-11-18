# 404 Test
GET http://localhost:8080/no-such-route

HTTP/1.1 404
[Asserts]
# Status should be "error"
jsonpath "$.status" == "error"
# Error code should be 404
jsonpath "$.error.code" == 404
# Error message should be "not found"
jsonpath "$.error.message" == "not found"

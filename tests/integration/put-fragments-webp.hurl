# tests/integration/put-fragments-webp.hurl
POST http://localhost:8080/v1/fragments
Content-Type: image/webp
[BasicAuth]
user1@email.com:password1
file,sample_data/icon-excel.webp;

HTTP/1.1 201
[Captures]
url: header "Location"

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
file,sample_data/icon-excel.webp;

PUT {{url}}
Content-Type: image/webp
[BasicAuth]
user1@email.com:password1
file,sample_data/icon-word.webp;

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "image/webp"
jsonpath "$.fragment.size" == 938
jsonpath "$.fragment.formats" includes "image/png"
jsonpath "$.fragment.formats" includes "image/jpeg"
jsonpath "$.fragment.formats" includes "image/gif"
jsonpath "$.fragment.formats" includes "image/webp"

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/webp
Content-Length: 938
file,sample_data/icon-word.webp;

PUT {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
```Invalid data```

HTTP/1.1 400

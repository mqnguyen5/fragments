# tests/integration/put-fragments-gif.hurl
POST http://localhost:8080/v1/fragments
Content-Type: image/gif
[BasicAuth]
user1@email.com:password1
file,sample_data/icon-excel.gif;

HTTP/1.1 201
[Captures]
url: header "Location"

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
file,sample_data/icon-excel.gif;

PUT {{url}}
Content-Type: image/gif
[BasicAuth]
user1@email.com:password1
file,sample_data/icon-word.gif;

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "image/gif"
jsonpath "$.fragment.size" == 2076
jsonpath "$.fragment.formats" includes "image/png"
jsonpath "$.fragment.formats" includes "image/jpeg"
jsonpath "$.fragment.formats" includes "image/gif"
jsonpath "$.fragment.formats" includes "image/webp"

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/gif
Content-Length: 2076
file,sample_data/icon-word.gif;

PUT {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
```Invalid data```

HTTP/1.1 400

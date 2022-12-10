# tests/integration/post-fragments-images.hurl
# Creating PNG image
POST http://localhost:8080/v1/fragments
Content-Type: image/png
[BasicAuth]
user1@email.com:password1
file,sample_data/icon-excel.png;

HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "image/png"
jsonpath "$.fragment.size" == 2356
[Captures]
png_url: header "Location"

GET {{png_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/png
Content-Length: 2356
file,sample_data/icon-excel.png;

# Creating JPEG image
POST http://localhost:8080/v1/fragments
Content-Type: image/jpeg
[BasicAuth]
user1@email.com:password1
file,sample_data/icon-excel.jpg;

HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "image/jpeg"
jsonpath "$.fragment.size" == 2614
[Captures]
jpeg_url: header "Location"

GET {{jpeg_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/jpeg
Content-Length: 2614
file,sample_data/icon-excel.jpg;

# Creating WEBP image
POST http://localhost:8080/v1/fragments
Content-Type: image/webp
[BasicAuth]
user1@email.com:password1
file,sample_data/icon-excel.webp;

HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "image/webp"
jsonpath "$.fragment.size" == 1400
[Captures]
webp_url: header "Location"

GET {{webp_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/webp
Content-Length: 1400
file,sample_data/icon-excel.webp;

# Creating GIF image
POST http://localhost:8080/v1/fragments
Content-Type: image/gif
[BasicAuth]
user1@email.com:password1
file,sample_data/icon-excel.gif;

HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "image/gif"
jsonpath "$.fragment.size" == 2356
[Captures]
gif_url: header "Location"

GET {{gif_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/gif
Content-Length: 2356
file,sample_data/icon-excel.gif;

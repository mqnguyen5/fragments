# tests/integration/post-fragments-images.hurl
# Creating PNG image
POST http://localhost:8080/v1/fragments
Content-Type: image/png
[BasicAuth]
user1@email.com:password1
file,sample_data/icon.png;

HTTP/1.1 201
[Asserts]
jsonpath "$.fragment.type" == "image/png"
[Captures]
png_url: header "Location"

GET {{png_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/png
file,sample_data/icon.png;

# Creating JPEG image
POST http://localhost:8080/v1/fragments
Content-Type: image/jpeg
[BasicAuth]
user1@email.com:password1
file,sample_data/icon.jpg;

HTTP/1.1 201
[Asserts]
jsonpath "$.fragment.type" == "image/jpeg"
[Captures]
jpeg_url: header "Location"

GET {{jpeg_url}}
[BasicAuth]
user1@email.com:password1
file,sample_data/icon.jpg;

HTTP/1.1 200
Content-Type: image/jpeg
file,sample_data/icon.jpg;

# Creating WEBP image
POST http://localhost:8080/v1/fragments
Content-Type: image/webp
[BasicAuth]
user1@email.com:password1
file,sample_data/icon.webp;

HTTP/1.1 201
[Asserts]
jsonpath "$.fragment.type" == "image/webp"
[Captures]
webp_url: header "Location"

GET {{webp_url}}
[BasicAuth]
user1@email.com:password1
file,sample_data/icon.webp;

HTTP/1.1 200
Content-Type: image/webp

# Creating GIF image
POST http://localhost:8080/v1/fragments
Content-Type: image/gif
[BasicAuth]
user1@email.com:password1
file,sample_data/icon.gif;

HTTP/1.1 201
[Asserts]
jsonpath "$.fragment.type" == "image/gif"
[Captures]
gif_url: header "Location"

GET {{gif_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/gif
file,sample_data/icon.gif;

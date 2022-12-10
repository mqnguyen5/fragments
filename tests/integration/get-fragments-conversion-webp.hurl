# tests/integration/get-fragments-conversion-png.hurl
POST http://localhost:8080/v1/fragments
Content-Type: image/webp
[BasicAuth]
user1@email.com:password1
file,sample_data/icon-excel.webp;

HTTP/1.1 201
[Captures]
url: header "Location"

# Converting to PNG
GET {{url}}.png
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/png

# Converting to JPEG
GET {{url}}.jpg
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/jpeg

# Converting to GIF
GET {{url}}.gif
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/gif

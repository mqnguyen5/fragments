# tests/integration/get-fragments-conversion-png.hurl
POST http://localhost:8080/v1/fragments
Content-Type: image/jpeg
[BasicAuth]
user1@email.com:password1
file,sample_data/icon.jpg;

HTTP/1.1 201
[Captures]
url: header "Location"

# Converting to PNG
GET {{url}}.png
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/png

# Converting to WEBP
GET {{url}}.webp
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/webp

# Converting to GIF
GET {{url}}.gif
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/gif

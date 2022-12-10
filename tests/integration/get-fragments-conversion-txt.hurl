# tests/integration/get-fragments-conversion-txt.hurl
# Converting JSON to plain text
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{
  "id": 1,
  "user": "mqnguyen5",
  "data": [1, 2, 3]
}

HTTP/1.1 201
[Captures]
json_url: header "Location"

GET {{json_url}}.txt
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
{
  "id": 1,
  "user": "mqnguyen5",
  "data": [1, 2, 3]
}

# Converting Markdown to plain text
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
```# This is a fragment```

HTTP/1.1 201
[Captures]
md_url: header "Location"

GET {{md_url}}.txt
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
```# This is a fragment```

# Converting HTML to plain text
POST http://localhost:8080/v1/fragments
Content-Type: text/html
[BasicAuth]
user1@email.com:password1
```<h1>This is a fragment</h1>```

HTTP/1.1 201
[Captures]
html_url: header "Location"

GET {{html_url}}.txt
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
```<h1>This is a fragment</h1>```

# Converting image to plain text
POST http://localhost:8080/v1/fragments
Content-Type: image/png
[BasicAuth]
user1@email.com:password1
file,sample_data/icon.png;

HTTP/1.1 201
[Captures]
img_url: header "Location"

GET {{img_url}}.txt
[BasicAuth]
user1@email.com:password1

HTTP/1.1 415

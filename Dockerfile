# Dockerfile for Fragments microservice

FROM node:16.18.0-alpine3.16@sha256:2175727cef5cad4020cb77c8c101d56ed41d44fbe9b1157c54f820e3d345eab1 AS dependencies

LABEL maintainer="Minh Quan Nguyen <mqnguyen5@myseneca.ca>"
LABEL description="Fragments node.js microservice"

ENV NODE_ENV=production

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package*.json /app/

# Install node dependencies defined in package-lock.json
RUN npm ci --only=production && npm install --platform=linux --arch=x64 --libc=musl sharp@0.31.2
# Install sharp binaries for Alpine Linux 
# https://sharp.pixelplumbing.com/install#common-problems
# https://github.com/humphd/cloud-computing-for-programmers-fall-2022/discussions/463

#######################################################################

FROM node:16.18.0-alpine3.16@sha256:2175727cef5cad4020cb77c8c101d56ed41d44fbe9b1157c54f820e3d345eab1

# Use /app as our working directory
WORKDIR /app

# Copy cached dependencies from previous stage so we don't have to download
COPY --chown=node:node --from=dependencies /app /app

# Copy src to /app/src/
COPY --chown=node:node ./src ./src

# Copy our HTPASSWD file
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

# Switch user to 'node' before we run the app
USER node

# Start the container by running our server
CMD ["node", "src/index.js"]

# We run our service on port 8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \ 
  CMD wget --no-verbose --tries=1 --spider localhost:8080 || exit 1

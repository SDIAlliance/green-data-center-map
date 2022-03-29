FROM node:12.22
WORKDIR /

# Install dependencies
RUN apt-get update && apt-get install -y jq unzip
RUN cp -a web ./
RUN yarn install --frozen-lockfile

ADD web/src/world.json ./src/world.json
ARG ELECTRICITYMAP_PUBLIC_TOKEN

# Build
# (note: this will override the world.json that was previously created)
ADD config /config
ADD web ./
RUN yarn lint
RUN yarn build-release

EXPOSE 8000
ENV PORT 8000
CMD node server.js

HEALTHCHECK CMD curl --fail http://localhost:${PORT}/ || exit 1

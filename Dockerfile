FROM node:16-alpine3.15

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      tzdata

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN cp /usr/share/zoneinfo/America/Whitehorse /etc/localtime
RUN echo "America/Whitehorse" > /etc/timezone
RUN apk del tzdata

RUN mkdir /home/node/web && chown -R node:node /home/node/web
WORKDIR /home/node/web
COPY --chown=node:node src/web/package*.json ./
RUN npm install && npm cache clean --force --loglevel=error
COPY --chown=node:node src/web ./

RUN mkdir /home/node/app && chown -R node:node /home/node/app
RUN mkdir /home/node/app/db && chown -R node:node /home/node/app/db
WORKDIR /home/node/app
COPY --chown=node:node src/api/package*.json ./

ENV NODE_ENV=production
USER node
RUN npm install && npm cache clean --force --loglevel=error
COPY --chown=node:node src/api ./

RUN npm run build

WORKDIR /home/node/web
RUN npm run build:docker

WORKDIR /home/node/app

#COPY --chown=node:node api/src/templates/* /home/node/app/dist/templates/

CMD ["node", "./dist/index.js"]

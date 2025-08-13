FROM node:alpine

WORKDIR /usr/src/app

COPY package* ./

RUN npm ci

COPY index.js .

RUN mkdir -p /usr/src/app/shared-logs

RUN mkdir -p /usr/src/app/shared-data

CMD ["npm", "start"]

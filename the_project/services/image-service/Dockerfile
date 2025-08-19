FROM node:alpine

WORKDIR /usr/src/app

COPY package* ./

RUN npm ci

COPY index.js .

RUN mkdir /usr/src/app/image-cache

CMD ["npm", "start"]

FROM node:alpine

WORKDIR /usr/src/app

COPY package* ./

RUN npm ci

COPY index.js .

CMD ["npm", "start"]
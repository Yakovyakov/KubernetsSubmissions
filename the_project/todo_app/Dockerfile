FROM node:18-alpine

WORKDIR /app

COPY package.json index.js ./

RUN npm install

ENV PORT=3000

EXPOSE $PORT

CMD ["npm", "start"]

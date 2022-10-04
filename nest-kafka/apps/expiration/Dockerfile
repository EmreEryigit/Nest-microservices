FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY libs ./libs
COPY apps/expiration ./apps/expiration

COPY tsconfig.json .
COPY nest-cli.json .
CMD ["npm", "run", "start:dev", "expiration"]
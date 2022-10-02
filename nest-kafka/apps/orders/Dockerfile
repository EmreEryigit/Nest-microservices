FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY libs ./libs
COPY tsconfig.json .
COPY nest-cli.json .
COPY apps/orders ./apps/orders

CMD ["npm", "run", "start:dev", "orders"]
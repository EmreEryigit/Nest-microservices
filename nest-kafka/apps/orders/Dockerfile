FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY libs ./libs
COPY apps/orders ./apps/orders

COPY tsconfig.json .
COPY nest-cli.json .

CMD ["npm", "run", "start:dev", "orders"]
FROM node:16-buster-slim AS build

RUN apt update

RUN apt -y install rsync

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:16-buster-slim
WORKDIR /usr/src/app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
RUN mv ./dist/.env ./.env
RUN mv ./dist/tee-app ./tee-app

EXPOSE 5500

CMD [ "node", "./dist/app.js" ]
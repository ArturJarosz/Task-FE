FROM node:20-alpine3.18 as build

WORKDIR /application

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build --prod

FROM nginx:1.24-alpine

COPY --from=build /application/dist/task-fe /usr/share/nginx/html
COPY /nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80


FROM node:20-alpine3.18 as build

WORKDIR /application

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build --prod

FROM nginx:1.25.3-alpine

COPY --from=build /application/dist/task-fe /usr/share/nginx/html
COPY /nginx.conf /etc/nginx/conf.d/default.conf.template

RUN addgroup task && adduser --disabled-password task --ingroup task
RUN mkdir /fe-app

RUN chown -R task:task /fe-app
WORKDIR /fe-app

COPY --chown=task:task entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD "./entrypoint.sh"

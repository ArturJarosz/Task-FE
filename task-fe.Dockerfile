FROM node:24-alpine AS build

WORKDIR /application

COPY package*.json ./

RUN npm ci

COPY . .

# production is the default build configuration
RUN npm run build

# nginx stable branch; the minor tag lets rebuilds pick up nginx and Alpine security patches
FROM nginx:1.30-alpine

COPY --from=build /application/dist/task-fe /usr/share/nginx/html
COPY task-fe.nginx.conf /etc/nginx/conf.d/default.conf

RUN addgroup task && adduser --disabled-password task --ingroup task
RUN mkdir /fe-app

RUN chown -R task:task /fe-app
WORKDIR /fe-app

COPY --chown=task:task entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD "./entrypoint.sh"

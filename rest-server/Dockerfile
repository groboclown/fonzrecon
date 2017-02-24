# Basic Docker launcher

FROM node:slim

COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm install

# Reference the hostname as declared in the docker-compose.yml file.
ENV DYNAMODB_ENDPOINT http://dynamodb:8000

ENV PORT 3000
EXPOSE 3000

CMD [ "npm", "start" ]

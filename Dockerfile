FROM node:13.8.0

WORKDIR /usr/src/app

ADD . .

RUN npm install

EXPOSE 3040

CMD [ "npm", "start" ]
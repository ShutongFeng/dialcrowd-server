FROM node:carbon

WORKDIR /usr/src/app

ADD . .

WORKDIR /usr/src/app

RUN npm install 

EXPOSE 3040

CMD [ "npm", "start" ]
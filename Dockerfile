FROM node:carbon

WORKDIR /usr/src/app

ADD . .

WORKDIR /usr/src/app

RUN npm install 

CMD [ "npm", "start" ]


FROM node:carbon

WORKDIR /usr/src/app

COPY . .

WORKDIR /usr/src/app

RUN npm install --unsafe-perm

EXPOSE 3040

CMD [ "npm", "start" ]

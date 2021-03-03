FROM node:14

WORKDIR /usr/src/app

ADD . .

WORKDIR /usr/src/app

ENV GENERATE_SOURCEMAP false
RUN npm install --no-save --unsafe-perm

EXPOSE 3040

CMD [ "npm", "start" ]
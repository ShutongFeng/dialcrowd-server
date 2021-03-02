FROM node:12

WORKDIR /usr/src/app

ADD . .

WORKDIR /usr/src/app

ENV GENERATE_SOURCEMAP false
RUN npm install --no-save

EXPOSE 3040

CMD [ "npm", "start" ]
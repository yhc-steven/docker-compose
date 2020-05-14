FROM node:7.7.2-alpine
WORKDIR /dist
ADD ./*  /dist
RUN npm i
EXPOSE 4000
CMD [ "npm","start" ]
COPY . .



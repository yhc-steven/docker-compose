FROM node:7.7.2-alpine
LABEL maintainer=435084418@qq.com”
LABEL version=“1.0”
LABEL description=“hello”
COPY .  /dist
WORKDIR /dist
RUN npm i
EXPOSE 4000
CMD [ "npm","start" ]
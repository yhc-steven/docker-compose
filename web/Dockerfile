FROM node:latest
LABEL maintainer=435084418@qq.com”
LABEL version=“1.0”
LABEL description=“hello”
COPY .  /dist
WORKDIR /dist
RUN yarn
EXPOSE 8080
CMD [ "yarn","serve" ]
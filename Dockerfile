FROM node:latest

RUN apt-get update -y


ADD . /DtubeSubsProcessor
WORKDIR /DtubeSubsProcessor
RUN npm install

EXPOSE 5000

ENV CORSVAR '*'
ENV IPFSIP  "127.0.0.1"
ENV IPFSPORT  "5001"
ENV IPFSPROTOCOL "http"

CMD ["npm", "start"]

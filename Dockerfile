# docker build -t elena/grabenv .
FROM ghcr.io/puppeteer/puppeteer:19.4.1

ARG DEBIAN_FRONTEND=noninteractive

USER root

RUN apt-get update && apt-get install -y ffmpeg jq

WORKDIR /grab
COPY package-lock.json package.json /grab/
RUN npm install

RUN rm package-lock.json package.json
FROM node:boron
WORKDIR /usr/src
RUN git clone --depth=1 --branch master https://github.com/Mattersight/deck-watch.git apps/deck-watch
WORKDIR /usr/src/apps/deck-watch
RUN npm install --no-bin-links
EXPOSE 9143
ENTRYPOINT []
FROM node:boron
WORKDIR /usr/src
RUN git clone --depth=1 --branch master https://github.com/Mattersight/deck-watch.git apps/deck-watch

FROM node:boron
COPY --from=0 /usr/src/apps /usr/src/apps
WORKDIR /usr/src/apps/deck-watch
RUN npm install --no-bin-links
EXPOSE 80
ENTRYPOINT ["node", "code/main"]

FROM node:boron
COPY code /usr/src/apps/deck-watch/code
COPY package.json /usr/src/apps/deck-watch/package.json
COPY README.md /usr/src/apps/deck-watch/README.md
WORKDIR /usr/src/apps/deck-watch
RUN npm install --no-bin-links
EXPOSE 80
ENTRYPOINT ["node", "code/main"]

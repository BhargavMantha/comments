FROM node:16-alpine
ENV NODE_ENV=prod \
    NODE_OPTIONS=--max_old_space_size=16384 \
    NPM_CONFIG_PREFIX=/home/node/.npm-global \
    PATH=$PATH:/home/node/.npm-global/bin:/home/node/node_modules/.bin:$PATH
RUN mkdir -p /usr/src/app/node_modules
RUN chown -R node:node /usr/src/app
USER node
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
RUN npm i -g @nestjs/cli
COPY --chown=node:node . ./
RUN ls -l
CMD [ "npm", "start" ]
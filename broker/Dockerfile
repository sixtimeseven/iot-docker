FROM node:22-alpine
WORKDIR /app
RUN npm install -g corepack@0.34.6 && corepack enable
#COPY package.json .
COPY broker/package.json .yarnrc.yml ./broker/
RUN cd broker && yarn install

COPY broker/src/ ./broker/src/
COPY broker/tsconfig.json ./broker/
RUN cd broker && yarn run build

WORKDIR /app/broker
CMD ["node", "dist/index.js"]
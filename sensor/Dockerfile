FROM node:22-alpine
WORKDIR /app

COPY shared/package.json ./shared/
COPY shared/src/          ./shared/src/
COPY shared/tsconfig.json ./shared/
RUN cd shared && npm install && npm run build

COPY sensor/package.json ./sensor/
RUN cd sensor && npm install

COPY sensor/src/       ./sensor/src/
COPY sensor/tsconfig.json ./sensor/
RUN cd sensor && npm run build

WORKDIR /app/sensor
CMD ["node", "dist/index.js"]
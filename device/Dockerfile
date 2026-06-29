FROM node:22-alpine
WORKDIR /app

COPY shared/package.json ./shared/
COPY shared/src/          ./shared/src/
COPY shared/tsconfig.json ./shared/
RUN cd shared && npm install && npm run build

COPY device/package.json ./device/
RUN cd device && npm install

COPY device/src/       ./device/src/
COPY device/tsconfig.json ./device/
RUN cd device && npm run build

WORKDIR /app/device
CMD ["node", "dist/index.js"]
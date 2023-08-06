FROM node:14.17.5-alpine
ENV NODE_ENV development
WORKDIR /app
COPY ./package.json /app
RUN npm install
COPY . .
CMD npm start
FROM node:22-bookworm-slim
WORKDIR /app

ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm install

EXPOSE 4000
# nodemon -L (polling) reloads on changes made through the Windows bind mount
CMD ["npx", "--yes", "nodemon", "-L", "server.js"]

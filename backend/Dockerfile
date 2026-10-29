FROM node:22-bookworm-slim
WORKDIR /app

ENV NODE_ENV=development
# npm install (not npm ci): the lock file from Windows lacks some Linux-only optional packages
COPY package.json package-lock.json ./
RUN npm install

EXPOSE 1337
# Source code is mounted from the host by docker-compose.yml; develop reloads on changes
CMD ["npm", "run", "develop"]

FROM node:24-bookworm-slim

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src

ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/data/taskflow.db
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 3001

CMD ["node", "--experimental-strip-types", "src/index.ts"]

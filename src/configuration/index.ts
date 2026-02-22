import dbconfig from './dbconfig';
export default () => ({
  wordDifficulty: {
    baseUrl: process.env.WORD_DIFFICULTY_URL || 'http://localhost:8000',
  },
  discord: {
    botToken: process.env.DISCORD_BOT_TOKEN,
    logChannel: process.env.DISCORD_LOG_CHANNEL,
    bugChannel: process.env.DISCORD_BUG_CHANNEL,
    warnChannel: process.env.DISCORD_WARN_CHANNEL,
  },
  database: dbconfig,
  proxyRedis: {
    host: process.env.PROXY_REDIS_HOST,
    port: process.env.PROXY_REDIS_PORT,
  },
});

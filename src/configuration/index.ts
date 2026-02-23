import dbconfig from './dbconfig';
export default () => ({
  wordDifficulty: {
    baseUrl: process.env.WORD_DIFFICULTY_URL || 'http://localhost:8000',
  },
  toPhonetic: {
    apiUrl: process.env.TO_PHONETIC_API_URL || 'https://tophonetics.com/',
  },
  cambridge: {
    baseUrl:
      process.env.CAMBRIDGE_BASE_URL ||
      'https://dictionary.cambridge.org/vi/dictionary/english',
  },
  chatgpt: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    model: process.env.CHATGPT_MODEL ?? 'gpt-4o-mini',
    // Base URL only (no /chat/completions): SDK appends chat/completions automatically
    baseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
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
  aibitranslator: {
    apiKey:
      process.env.AIBIT_API_KEY
  },
});

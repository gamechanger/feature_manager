export const APPLICATION_HOSTNAME = '0.0.0.0';
export const APPLICATION_PORT = 3000;
export const APPLICATION_ENVIRONMENT = Deno.env.get('DENO_ENV') || 'dev';

export const DB_PATH = 'db.json';
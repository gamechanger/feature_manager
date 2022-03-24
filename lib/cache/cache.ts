import { connect, Redis } from 'redis/mod.ts';

const redis = await connect({ hostname: "127.0.0.1", maxRetryCount: 10 });

export const populateCache = async () => {
    for await(const f of Deno.readDir('./features')) {
      if(!f.isFile) continue;
      const data = await Deno.readTextFile(`./features/${f.name}`); //name of the file
      Cache.set(f.name.replace('.json', ''), JSON.stringify(data))
    }
}

export const Cache = {
    get: async (featureName: string) => {
        const reply = await redis.sendCommand('GET', featureName);
        return reply.value() as string
    },
    set: (featureName: string, data: string) => {
        return redis.set(featureName, data);
    },
}
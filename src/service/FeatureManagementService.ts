import { Cache } from 'lib/cache/cache.ts';

export const FeatureManagementService = {
  addOrUpdate(featureId: string, namespace: string, category: string, data: object) {
    let fileName = [namespace, category, featureId].join(":");
    Cache.set(fileName, JSON.stringify(data))
  },
  async read(featureId: string, namespace: string, category: string) {
    let fileName = [namespace, category, featureId].join(":");
    try {
      const feature = await Cache.get(fileName)
      return JSON.parse(feature);
    } catch {
      throw new Error('Item not found')
    }
  },
};
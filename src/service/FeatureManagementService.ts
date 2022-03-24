import { Cache } from 'lib/cache/cache.ts';

export const FeatureManagementService = {
	async addOrUpdate(
		featureId: string,
		namespace: string,
		category: string,
		data: object,
	) {
		const fileName = [namespace, category, featureId].join(':');
		await Cache.set(fileName, JSON.stringify(data));
		return data;
	},
	async read(featureId: string, namespace: string, category: string) {
		const fileName = [namespace, category, featureId].join(':');
		try {
			const feature = await Cache.get(fileName);
			return JSON.parse(feature);
		} catch {
			throw new Error('Item not found');
		}
	},
};

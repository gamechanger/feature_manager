import { Cache } from 'lib/cache/cache.ts';
import { computeRulesState, FeatureDefinition } from 'lib/rules/checker.ts';

export const FeatureManagementService = {
	async addOrUpdate(
		featureId: string,
		namespace: string,
		category: string,
		data: FeatureDefinition,
	) {
		const fileName = [namespace, category, featureId].join(':');
		data.state.created_at = new Date().valueOf();
		await Cache.set(fileName, JSON.stringify(data));
		return data;
	},
	async read(featureId: string, namespace: string, category: string) {
		const fileName = [namespace, category, featureId].join(':');
		try {
			const feature = await Cache.get(fileName);
			const parsedFeature = JSON.parse(feature);
			const computedFeature = {
				...parsedFeature,
				state: computeRulesState(parsedFeature),
			};
			return computedFeature;
		} catch {
			throw new Error('Item not found');
		}
	},
};

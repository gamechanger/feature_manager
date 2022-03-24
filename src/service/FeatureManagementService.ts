export class FeatureManagementService {
    constructor() {}
    public async addOrUpdateFeature(featureId: string, namespace: string, category: string, data: object) {
        let fileName = [namespace, category, featureId].join(":");
		let featurePath = './features/' + fileName + ".json";

        try {
          Deno.writeTextFileSync(featurePath, JSON.stringify(data));
        } catch (e) {
            console.error(e);
        }
      } 
}
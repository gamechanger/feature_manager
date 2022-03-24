import { Router } from 'oak/mod.ts';
import { checker } from 'lib/rules/checker.ts';
import {FeatureManagementService} from 'src/service/FeatureManagementService.ts'

const router = new Router();
const featureManagementService = new FeatureManagementService()
router
	.get('/', (context) => {
		context.response.body = 'Hello world!';
	})
	.get('/feature/:namespace/:category/:id', (context) => {
		console.log(context.params.namespace);
		console.log(context.params.category);
		console.log(context.params.id);

		context.response.body = 'response';
	})
	.post('/feature/:namespace/:category/:id',  async (context) => {
		let body = context.request.body();
		let parsedBody = await body.value;
		try {
			await featureManagementService.addOrUpdateFeature(context.params.id, context.params.namespace, context.params.category, parsedBody);
			context.response.status = 200;
		} catch {
			context.response.status = 500;
		}
	})
	.post('/check/:namespace/:category/:id', async (context) => {
		const feature = `${context.params.namespace}:${context.params.category}:${context.params.id}`
		const result = context.request.body();
		const parsedBody = await result.value;
		context.response.body = checker(feature, parsedBody.value);
	});

export default router;

function addFeature(toPath: string, data: object): string {
	try {
	  Deno.writeTextFileSync(toPath, JSON.stringify(data));
  
	  return "Written to " + toPath;
	} catch (e) {
	  return e.message;
	}
  }

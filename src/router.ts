import { Router } from 'oak/mod.ts';
import { checker } from 'lib/rules/checker.ts';
import { FeatureManagementService } from 'src/service/FeatureManagementService.ts';

const router = new Router();
router
	.get('/', (context) => {
		context.response.body = 'Hello world!';
	})
	.get('/feature/:namespace/:category/:id', async (context) => {
		context.response.body = await FeatureManagementService.read(
			context.params.id,
			context.params.namespace,
			context.params.category,
		);
	})
	.post('/feature/:namespace/:category/:id', async (context) => {
		const body = context.request.body();
		const parsedBody = await body.value;
		try {
			const feature = await FeatureManagementService.addOrUpdate(
				context.params.id,
				context.params.namespace,
				context.params.category,
				parsedBody,
			);
			context.response.status = 200;
			context.response.body = feature;
			
		} catch {
			context.response.status = 500;
		}
	})
	.post('/check/:namespace/:category/:id', async (context) => {
		const result = context.request.body();
		const parsedBody = await result.value;
		const feature = await FeatureManagementService.read(
			context.params.id,
			context.params.namespace,
			context.params.category,
		);
		context.response.body = checker(feature, parsedBody.value);
	});

export default router;

import { Router } from 'oak/mod.ts';
import { checker } from 'lib/rules/checker.ts';

const router = new Router();

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
	.post('/feature/:namespace/:category/:id', (context) => {
		context.response.body = 'response';
	})
	.post('/check/:namespace/:category/:id', async (context) => {
		const feature = `${context.params.namespace}:${context.params.category}:${context.params.id}`
		const result = context.request.body();	
		context.response.body = checker(feature, (await result.value).value);
	});

export default router;

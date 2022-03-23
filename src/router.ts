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
	.post('/feature/:namespace/:category/:id',  async (context) => {
		let fileName = [context.params.namespace, context.params.category, context.params.id].join(":");
		let featurePath = './features/' + fileName + ".json";
		let body = context.request.body();
		let parsedBody = await body.value;
		try {
			let successMessage = addFeature(featurePath, parsedBody);
			console.log(successMessage);
			context.response.status = 200;
		} catch {
			context.response.status = 500;
		}
	})
	.post('/check/:namespace/:category/:id', (context) => {
		context.response.body = 'response';
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

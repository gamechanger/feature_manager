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
		console.log(context.params);

		let fileName = [context.params.namespace, context.params.category, context.params.id].join(":") ;
		let featurePath = './features/' + fileName + ".json";
		const successMessage = addFeature(featurePath, context.request.body);
		console.log(successMessage);
		context.response.body = 'response';
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

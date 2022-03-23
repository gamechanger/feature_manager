import { Application, isHttpError, Status } from 'oak/mod.ts';
import { APPLICATION_HOSTNAME, APPLICATION_PORT } from 'lib/constants.ts';
import router from 'src/router.ts';

const app = new Application();

//logger
app.use(async (ctx, next) => {
	await next();
	const rt = ctx.response.headers.get('X-Response-Time');
	console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Timing
app.use(async (ctx, next) => {
	const start = Date.now();
	await next();
	const ms = Date.now() - start;
	ctx.response.headers.set('X-Response-Time', `${ms}ms`);
});

app.use(async (ctx, next) => {
	try {
		await next();
	} catch (err) {
		if (isHttpError(err)) {
			switch (err.status) {
				case Status.NotFound:
					// handle NotFound
					break;
				default:
					// handle other statuses
			}
		} else {
			// rethrow if you can't handle the error
			throw err;
		}
	}
});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener('listen', ({ hostname, port, secure }) => {
	console.log(
		`Listening on: ${secure ? 'https://' : 'http://'}${
			hostname ??
				'localhost'
		}:${port}`,
	);
});

await app.listen({ hostname: APPLICATION_HOSTNAME, port: APPLICATION_PORT });

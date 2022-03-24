help:  ## Prints out this help text
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

run:  ## Run the application
	docker-compose up -d
	deno run --allow-env=DENO_ENV --allow-net --allow-read --watch src/main.ts

lint:
	deno lint

fmt:
	deno fmt

pretty:
	make lint fmt

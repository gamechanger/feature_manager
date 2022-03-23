##Description:
The intention of this hack is to abstract away the Feature Toggle capability from Eden into a service (Feature Manager)
and make it accessible and customizable not only for Eden but for any system.

##Why:
- To reduce the amount of code in Eden, making it faster to compile, easier to maintain and less noisy for
  firefighting and debugging.
- FM as a service allows to easily add new features and scope them to specific applications without interfering with other in app
  business logics.
- Keep an audit-trail of what and when something has changed, notify interested parties about changes or expiration
- Feature toggling allows a code logic to check whether the feature is enabled or not in order to run. By making a feature checker customizable
  we could move some business logic checks to a more dynamic place that wouldn't require build/deployment process (only authorization).

##Features:
- Multi-application
- Rule based checker
- Auto disable feature
- In-memory cached client
- Notifications on change

##Data Structures:

***feature (key:value)***

<ins>**key**</ins>: represents a self-descriptive id in the format of
`namespace:category:name`; this naming convention helps organize features into spaces and categories.
It makes it easier to find and organize features under similar groups.

`namespace`:
defines the high level application logic or domain; i.e: auth, scoring, android-app, ios-app, streaming

`category`: defines to what category the feature belongs, think of this as a way to organize features under a common
name; i.e: auth:web:x, auth:android:x, scoring:bats:x, scoring:soccer:x

`name`: defines the identifier of the feature; i.e: auth:web:require-attestation,
auth:android:required-attestation, scoring:bats:allow-multi-scoring, scoring:soccer:allow-ai-scoring

<ins>**value**</ins>: defines what the rule should perform and how.

```
{
  id: string,
  description: string,
    
  rule: {
     type: [state_checker, value_checker, list_checker, range_checker, regex_matcher],
     value: boolean|number|string|[number]|[string]|json
  },

  state: {
     is_enabled: boolean
     is_expired?: boolean
     data?: boolean|number|string|json
  }

  expiration: {
     time: number
     date: number
     duration: number
  },

  events: {
    onExpiration:
    onChange:
    onEnabled:
    onDisabled:
  }
}
```

##Api definitions

Data Flow:

```
POST /features/:namespace/:category/:feature_id -> To create a new feature
<- 201 | 500 | 401 | 403
PATCH /features/:namespace/:category/:feature_id -> To update an existing feature
<- 200 | 500 | 401 | 403
GET /features/:namespace/:category/:feature_id -> To retrieve a feature information
<- 200 | 500 | 401 | 403
GET /features/:namespace/:category
<- 200 | 500 | 401 | 403
GET /features/:namespace
<- 200 | 500 | 401 | 403

POST /check/:namespace/:category/:feature_id
{
    value?: boolean|string|number 
}
<- 200 | 500 | 401 | 403
{
    checks: {
        value: boolean,
    },
    state: {
        is_enabled: boolean,
        is_expired: boolean,
    }
}
```

deno install --allow-read --allow-run --allow-write -f --unstable https://deno.land/x/denon/denon.ts

Tech stack:
node/deno/go/rust
redis/dynamodb/S3



Plan:

Stage 1
Restful communication layer
Rules checker logic: boolean_checker
Rules in memory caching
Postman collection


Stage 2
Client caching capabilities
Websocket communication layer
Client SDK
Application token authentication logic
Infrastructure
Feature Migration
Eden refactoring
Cx Tool refactoring


Stage 3
Auto toggle
Auto delete
Change alerting
Templating system



Tech debt:
Application client/daemon
Client sync and in memory caching logic
Infrastructure setup (EC2 instances, DynamoDB credentials, connectivity, consul and TF setup)

Migrate FT definitions to FM
Implement a management system (CX tools?) to use the new FM
Migrate Eden to use the FM client

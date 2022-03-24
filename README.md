## Description:

A small service that gives product managers and business logic makers a great deal of power.

## Current state

Feature Toggle is a capability hosted in Eden's code. It allows a user (developer) to check if a certain piece of 
code should run or not by checking what is the toggle status of the feature.

## Defying the status quo

As the company continues to grow we think this capability could be better organized and enriched; by turning a
decision-making place into a solution with customized rules that take action with the tap of a button without waiting
for code build process and deployment.

The main goal of Feature Manager is to improve and extend the management of features based on rules and parameters and 
go beyond the on/off state.


## Data Structures:

***feature (key:value)***

<ins>**key**</ins>: represents a self-descriptive id in the format of
`namespace:category:id`; this naming convention by definition helps organize features into spaces and categories.

* `namespace`: defines the high level application logic or domain  
  example: `auth:x:x, scoring:x:x, android-app:x:x, ios-app:x:x, streaming:x:x`

* `category`: defines a section withing the namespace to put features that are related to a specific logic together  
  example: `auth:web:x, auth:android:x, scoring:bats:x, scoring:soccer:x`

* `id`: the feature identifier  
  example: `auth:web:required-attestation,
  auth:android:required-attestation, scoring:bats:allow-multi-scoring, scoring:soccer:allow-ai-scoring`

<ins>**value**</ins>: defines the feature definition as a JSON

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

## Feature rule types

* *value_checker*: this is the simplest rule type checker, it compares the incoming value with the one defined in the
rule, it is also the way to check for on/off as the Feature Toggle works  
* *list_checker*: compares the incoming value against each one on the lists, if it matches at least one, returns true 
* *range_checker*: returns true if the incoming value is withing any of the ranges (inclusive)
* *regex_matcher*: returns true if the incoming value matches the regex 

## Scenarios

_Custom logs (value_checker)_

Imagine you are working on a feature, and you would like to debug/trace a specific user activity as you perform some 
tests. *value_checker* rule type could save the day as you keep the same code but tests different users logs output.

```json
{
  "id": "custom_logs",
  "description": "Checks if the user email matches the provided value",

  "rule": {
    "type": "value_checker",
    "value": "awesome_user@domain.com"
  },

  "state": {
    "is_enabled": true
  }
}
```

_Feature Toggle (value_checker)_

Similar to the previous example we can use `value_checker` to check for on/off as FT currently work.

```json
{
  "id": "allow_unverified_emails",
  "description": "FT: Whether or not we should allow unverified emails sign-in",
  "rule": {
    "type": "value_checker",
    "value": true
  },
  "state": {
    "is_enabled": true
  }
}
```

_Selected users (list_checker)_

Bats has implemented a new way of scoring; we would like to make it available to a selected number of users and expand
that list gradually as we gather feedback.

Enter a *list_checker* rule type, where your code could get a `good to go` response if the email matches any of the ones
defined in the list.

```json
{
  "id": "enhanced_scoring",
  "description": "Checks if the user is allowed to use the new enhance scoring feature",

  "rule": {
    "type": "list_checker",
    "value": [
      "got_em_all@catchers.com",
      "heavy_bat@homerun.com",
      "swing_wizzard@coaches.com"
    ]
  },

  "state": {
    "is_enabled": true
  }
}
```

_Adjustable ranges (range_checker)_

The DNA team came up recently with an AI powerful enough to score plays with great accuracy but the model is still under 
training. They have an idea of the range that should be taken in consideration as safe scoring parameter, they 
are confident enough to give it a try and gradually tweak the range.

```json
{
  "id": "score_on_range",
  "description": "Defines the scoring range to consider when using AI to determine a score play.",

  "rule": {
    "type": "range_checker",
    "value": [
      {
        "min": 0.9,
        "max": 1
      }
    ]
  },

  "state": {
    "is_enabled": true
  }
}
```

_Only from our VPN (regex_matcher)_

We would like to bypass certain logic in Eden for a specific feature only if the request is coming from our VPN, for
this we could make use of the *regex_matcher* rule type to which we pass the request ip address and check for the
response.

```json
{
  "id": "vpn_ip_range",
  "description": "Defines the scoring range to consider when using AI to determine a score play.",

  "rule": {
    "type": "regex_matcher",
    "value": "^100\\.22\\.33\\.([1-9]|[1-9]\\d|1\\d\\d|2[0-4]\\d|250)$"
  },

  "state": {
    "is_enabled": true
  }
}
```

## Key Features:
- Application based features 
- Rule based checker
- Auto disable feature
- Notifications on change
- In-memory cached client

## Other Benefits
- Reduces the amount of code in Eden, making it slightly faster to compile and less noisy for
  maintaining the core capabilities.
- FM as a service allows to easily add new features and scope them to specific applications without interfering with other in app
  business logics.
- Feature toggling allows a code logic to check whether the feature is enabled or not in order to run. By making a feature checker customizable
  we could move some business logic checks to a more dynamic place that wouldn't require build/deployment process (only authorization).
- Keep an audit-trail of what and when something has changed, notify interested parties about changes or expiration


The intention of this hack is to abstract away the Feature Toggle capability from Eden into a service (Feature Manager)
and make it accessible and customizable not only for Eden but for any system.

## Api definition

Data Flow:

```
POST /features/:namespace/:category/:feature_id -> To create a new feature
<- 201 | 500 | 401 | 403
PATCH /features/:namespace/:category/:feature_id -> To update an existing feature
<- 200 | 500 | 401 | 403
GET /features/:namespace/:category/:feature_id -> To retrieve a feature information
<- 200 | 500 | 401 | 403
GET /features/:namespace/:category -> To list all features under a category
<- 200 | 500 | 401 | 403
GET /features/:namespace -> To list all features under a namespace
<- 200 | 500 | 401 | 403

POST /check/:namespace/:category/:feature_id
{
    value?: boolean|string|number 
}
<- 200 | 500 | 401 | 403
{
    checks: {
        value?: boolean,
    },
    state: {
        is_enabled: boolean,
        is_expired?: boolean,
    }
}
```

## Tech stack
* Deno - https://deno.land/ (because it is cooler than Node) 
* OAK - https://deno.land/x/oak/ (like Koa but for Deno)
* Redis - for caching

# To the *feature* and beyond

### Stage 1
* Infrastructure setup (EC2 instances, DynamoDB credentials, connectivity, consul and TF setup)
* In memory caching of features
* Client SDK

### Stage 2
* Feature Migration (FT -> FM)
* Client sync and in memory caching logic
* Eden refactoring
* Cx Tool refactoring
* FM Management system (CX tools?)

### Stage 3
* Application token authentication
* Websocket communication layer
* Auto toggle
* Auto delete
* Alerting system on change
* Templating system

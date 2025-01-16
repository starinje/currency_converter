## Currency Converter API

A REST API for currency conversion powered by the Coinbase API. Features include rate limiting and request tracking.

### API Usage

#### Convert Currency

```http
GET /api/convert
Authorization: Bearer <user_token>
```

Query Parameters:

- `from`: Source currency code (BTC, ETH, USD, EUR)
- `to`: Target currency code (BTC, ETH, USD, EUR)
- `amount`: Amount to convert (numeric)

Example Request:

```bash
curl -X GET 'http://localhost:3000/api/convert?from=BTC&to=USD&amount=1' \
     -H 'Authorization: Bearer user123'
```

Success Response:

```json
{
  "from": "BTC",
  "to": "USD",
  "amount": 1,
  "rate": 43000.5,
  "result": 43000.5
}
```

### Rate Limits

- 100 requests per day (weekdays)
- 200 requests per day (weekends)
- Resets at midnight

### Supported Currencies

- BTC (Bitcoin)
- ETH (Ethereum)
- USD (US Dollar)
- EUR (Euro)

### Error Responses

```json
{
  "error": "Invalid currency"
}
```

```json
{
  "error": "Rate limit exceeded",
  "remaining": 0,
  "resetAt": "2024-01-16T00:00:00.000Z"
}
```

```json
{
  "error": "No authorization token provided"
}
```

## Development

### Prerequisites

To run the project, you need to have the following dependencies installed:

- task (https://taskfile.dev/installation/)
- docker (https://docs.docker.com/get-started/get-docker/)
- docker-compose (this is included in docker desktop above)
- node (https://nodejs.org/en/download/)
- npm (https://www.npmjs.com/get-npm)

### Running the application

This application uses a Docker Compose stack to run the application and database.

The application can be started with the following command:

```bash
task start
```

_Once started, the application is available at [localhost:3000](http://localhost:3000)_

The application can be stopped with the following command:

```bash
task stop
```

_This will stop the application and the database and will also remove the database volumes_

### Running Tests

#### Unit Tests

Unit tests can be run with:

```bash
task test
```

#### Integration Tests

To run integration tests:

1. First start the application:

```bash
task start
```

2. In a second terminal, run the integration tests:

```bash
task test:integration
```

## Areas for Improvement

### 1. Timezone Handling

- Currently, the application uses the server's timezone
- This is not ideal as the server could be in a different timezone than the user
- Future improvement would involve proper timezone handling based on user location or preference

### 2. Request Authentication

- Currently uses a static token in the header to identify users
- A more robust authentication system (e.g., JWT, OAuth) should be implemented for production use

### 3. API Documentation

- Need to implement automatic API documentation (Swagger, OpenAPI, etc...)

### 4. Exchange Rate Caching

- Currently fetches exchange rates from Coinbase API for each request
- For high-traffic scenarios, implementing a caching system would be beneficial
- Could cache exchange rates for different currency pairs and refresh at regular intervals

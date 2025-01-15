<div align="center">

![A bear](images/yona.png)

</div>

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
- Resets at midnight UTC

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

### Available Commands

The project uses [Task](https://taskfile.dev) for managing development commands. Here are all available commands:

```bash
# Install Nix package manager (optional)
task install-nix

# Start the application stack with Docker Compose
task start

# Stop the Docker Compose stack and remove volumes
task stop

# Run unit tests
task test

# Run integration tests, you will need to run this from a second terminal
# with the application running
task test:integration

# Uninstall Nix package manager (if previously installed)
task uninstall-nix
```

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

2. In another terminal, run the integration tests:

```bash
task test:integration
```

### Nix Development Environment

This project uses Nix to ensure that developers' local environments are all the same.

To install Nix:

```bash
task install-nix
```

To enter the Nix shell:

```bash
nix-shell
```

To uninstall Nix:

```bash
task uninstall-nix
```

For more information about Nix, visit the [Nix website](https://nixos.org/nix/).

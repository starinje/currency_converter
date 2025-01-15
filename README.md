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

## Dependencies

To run the project, you need to have the following dependencies installed:

- task (https://taskfile.dev/installation/)
- docker (https://docs.docker.com/get-started/get-docker/)
- docker-compose (this is included in docker desktop above)

### 1. Install Nix

This project uses Nix to ensure that developers' local environments are all the same.

To install Nix, run the following command at the root level of the project directory:

```bash
task install-nix
```

To uninstall Nix if needed:

```bash
task uninstall-nix
```

### 2. Start Nix

To enter the Nix shell and set up your development environment, run the following command in your terminal:

```bash
nix-shell
```

This command creates an isolated environment based on your `shell.nix` file, allowing you to access all specified tools and dependencies. You can exit the Nix shell by typing `exit` or pressing `Ctrl + D`. For more information about Nix, visit the [Nix website](https://nixos.org/nix/).

### 4. Start the Application

To start the application, run:

```bash
task start
```

This command will launch the application in the background.

### 5. Stop the Application

To stop the application, use:

```bash
task stop
```

This command will terminate the running application.

### 6. Run Backend Tests

To run the tests for the application, execute:

```bash
task test
```

This command will run all the defined tests to ensure everything is functioning correctly.

Note: Ensure Docker containers are running when executing migration commands.

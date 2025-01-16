## Areas of improvement

1. Timezone handling

- currently the application simply uses the timezone of the server
- this is not ideal, as the server could be in a different timezone than the user

2. Request Authentication

- currently the application simply uses a static token passed in the header to uniquely identify the user

3. Autodocumenting of the API such as swagger

4. Caching of the exchange rate

- currently the exchange rate is fetched from the coinbase api for each request
- if this was a high traffic application, we would probably want to cache the exchange rate for different currency pairs and refresh at some regular interval

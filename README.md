# TypeScript HTTP Client Library

## Overview
This library is a simple and efficient HTTP client for making API calls in TypeScript applications. It provides a clean API for sending HTTP requests and handling responses.

## Features
- **Easy to use**: A simple interface for making HTTP requests.
- **Type safety**: Built with TypeScript to ensure type safety in request and response handling.
- **Supports various HTTP methods**: GET, POST, PUT, DELETE, etc.
- **Customizable request headers**: Set custom headers for your requests.
- **Error handling**: Built-in error handling for easy debugging.
- **Promise-based API**: Supports asynchronous requests using Promises.

## Installation
To install this library, run:
```bash
npm install ts-http-client
```

## Usage Examples
### Basic GET Request
```typescript
import { HttpClient } from 'ts-http-client';

const client = new HttpClient();

client.get('https://api.example.com/data').then(response => {
    console.log(response.data);
}).catch(error => {
    console.error('Error fetching data:', error);
});
```

### POST Request with Custom Headers
```typescript
import { HttpClient } from 'ts-http-client';

const client = new HttpClient();

const data = { key: 'value' };
const headers = { 'Authorization': 'Bearer token' };

client.post('https://api.example.com/submit', data, { headers }).then(response => {
    console.log('Data submitted:', response.data);
}).catch(error => {
    console.error('Error submitting data:', error);
});
```

## API Reference
### HttpClient Class
- `get(url: string, options?: RequestOptions): Promise<Response>` - Sends a GET request.
- `post(url: string, data: any, options?: RequestOptions): Promise<Response>` - Sends a POST request.
- `put(url: string, data: any, options?: RequestOptions): Promise<Response>` - Sends a PUT request.
- `delete(url: string, options?: RequestOptions): Promise<Response>` - Sends a DELETE request.

### RequestOptions
- `headers?: Record<string, string>` - Custom headers for the request.
- `timeout?: number` - Request timeout in milliseconds.

### Response Interface
- `data: any` - The response data.
- `status: number` - The HTTP status code.
- `statusText: string` - The status message.

## Development Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/abdul-kasif/ts-http-client.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
4. Run tests:
   ```bash
   npm test
   ```
5. Create your feature branches and submit pull requests for changes.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
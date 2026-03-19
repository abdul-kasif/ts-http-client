// src/example.ts
import { createHttpClient } from "./index";

interface User {
  id: number;
  name: string;
}

const api = createHttpClient("https://jsonplaceholder.typicode.com");

async function run() {
  console.log("--- Testing Fluent Interface ---");

  try {
    // SCENARIO 1: Simple Await (Backwards compatible feel)
    // Because we implemented .then(), this works exactly like before!
    console.log("1. Simple Await:");
    const res1 = await api.get<User[]>("/users");
    console.log(`Fetched ${res1.data.length} users.`);

    // SCENARIO 2: The New Fluent Chain!
    console.log("\n2. Fluent Retry Chain:");
    const res2 = await api
      .get<User[]>("/users")
      .retry(3, 500) // Retry 3 times, 500ms base delay
      .setHeaders({
        "X-Custome": "MyValue",
      })
      .query({ page: 1 }); // Add query params

    console.log(`Fetched with retries enabled. Status: ${res2.status}`);

    // SCENARIO 3: Explicit .send() (Optional)
    console.log("\n3. Explicit .send():");
    const res3 = await api.get<User[]>("/posts").retry(2, 200).send(); // Explicitly call send

    console.log(`Fetched posts. Count: ${res3.data.length}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();

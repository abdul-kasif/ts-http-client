import { createHttpClient, HttpError } from "./index";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

const api = createHttpClient("https://jsonplaceholder.typicode.com");

api.interceptor.request.use((config) => {
  console.log(`[Request] ${config.method} ${config.url}`);
  // Simulate adding an Auth Token
  config.headers = {
    ...config.headers,
    Authorization: "Bearer secret-token-123",
  };
  return config;
});

api.interceptor.response.use((response) => {
  console.log(`[Response] ${response.status} ${response.statusText}`);
  return response;
});

async function main() {
  console.log("--- Starting HTTP Client Demo ---\n");

  try {
    console.log("1. Fetching Users...");
    const userResponse = await api.get<User[]>("/users");

    console.log("First User:", userResponse.data[0].name);
    console.log("Email:", userResponse.data[0].email);
    console.log("");

    console.log("2. Creating a Post...");
    const newPostPayload = {
      title: "My New Post",
      body: "This is the content of my post.",
      userId: 1,
    };

    const postResponse = await api.post<Post, typeof newPostPayload>(
      "/posts",
      newPostPayload,
    );

    console.log("Created Post ID:", postResponse.data.id);
    console.log("Created Post Title:", postResponse.data.title);
    console.log("");

    console.log("3. Triggering a 404 Error...");
    try {
      await api.get("/invalid-route-that-does-not-exist");
    } catch (error) {
      if (error instanceof HttpError) {
        console.log(`Caught HttpError: ${error.status} ${error.statusText}`);
        console.log("Error Data:", error.data);
      } else {
        console.log("Unknown Error:", error);
      }
    }
  } catch (error) {
    console.error("Global Error:", error);
  }
}
main();

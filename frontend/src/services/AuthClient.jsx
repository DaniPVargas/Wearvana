export default class AuthClient {
  constructor() {
    this.apiBaseUrl = "http://localhost:5000";
  }

  async signIn(token) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Error signing in", error);
      throw error;
    }
  }

  async register(alias) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alias }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Error registering user", error);
      throw error;
    }
  }
}

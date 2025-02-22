export default class AuthClient {
  constructor() {
    this.apiBaseUrl = "https://wearvana.onrender.com";
  }

  async signIn(token) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Erro ao iniciar sesión");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao iniciar sesión", error);
      throw error;
    }
  }

  async register(alias) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/users?user_alias=${alias}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao rexistrar o usuario");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async textSearch(query, brand) {
    const response = await fetch(
      `${this.apiBaseUrl}/clothing:text_search?query=${query}?brand=${brand}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Non se puideron obter resultados");
    }

    return await response.json();
  }
}

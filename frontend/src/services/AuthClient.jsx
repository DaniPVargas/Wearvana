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
        throw new Error("Autenticación fallida");
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
        throw new Error(errorData.error || "Erro rexistrando o usuario");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async analyzeImage(file) {
    // Aquí iría la lógica para hacer la llamada a la API en el futuro
    // Por ahora, devolvemos un mock de datos

    // Simulamos un retraso para imitar una llamada a la API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock de datos
    const mockResponse = {
      status: "success",
      data: [
        {
          type: "shirt",
          color: "blue",
          brand: "Brand A",
        },
        {
          type: "pants",
          color: "black",
          brand: "Brand B",
        },
        {
          type: "shoes",
          color: "white",
          brand: "Brand C",
        },
      ],
    };

    return mockResponse;
  }
}

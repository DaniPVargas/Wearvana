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

  async register(alias, description, profilePictureUrl) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_alias: alias,
          description: description,
          profile_picture_url: profilePictureUrl,
        }),
      });

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
    // check if brand exists
    const search = brand
      ? `${this.apiBaseUrl}/clothing:text_search?query=${query}&brand=${brand}`
      : `${this.apiBaseUrl}/clothing:text_search?query=${query}`;
    const response = await fetch(search, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Non se puideron obter resultados");
    }

    return await response.json();
  }

  async imageSearch(image, userAlias) {
    const formData = new FormData();
    formData.append("image", image);

    // First upload the image to the server
    const uploadResponse = await fetch(
      `${this.apiBaseUrl}/${userAlias}/pictures`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error("Erro ao subir a imaxe");
    } else {
      const searchResult = await searchResponse.json();
      const imageUrl = searchResult.image_url;
      console.log("Image URL", imageUrl);
    }
  }
}

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

  async uploadImage(image, userID) {
    const formData = new FormData();
    formData.append("file", image);

    if (!userID) 
      throw new Error("O ID do usuario é necesario para subir a imaxe");
    

    // First upload the image to the server
    const uploadResponse = await fetch(
      `${this.apiBaseUrl}/${userID}/pictures`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error("Erro ao subir a imaxe");
    } 

      const searchResult = await searchResponse.json();
      const imageUrl = searchResult.image_url;
      console.log("Image URL", imageUrl);

    return imageUrl;

  }

  async imageSearch(image, userID) {
    const imageUrl = await this.uploadImage(image, userID);

    const searchResponse = await fetch(
      `${this.apiBaseUrl}/clothing:image_search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ picture_url: imageUrl }),
      }
    );

    if (!searchResponse.ok) {
      throw new Error("Non se puideron obter resultados");
    }

    const searchResult = await searchResponse.json();
    console.log("Search result", searchResult);
    return searchResult;
  }
}

export default class AuthClient {
  constructor() {
    this.apiBaseUrl = "https://wearvana.onrender.com";
  }

  async signIn(token) {
    const response = await fetch(`${this.apiBaseUrl}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) throw new Error("Erro ao iniciar sesión");
    return await response.json();
  }

  async register(alias, description, profilePictureUrl) {
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

    if (!response.ok)
      throw new Error((await response.json()) || "Erro ao rexistrar o usuario");

    return await response.json();
  }

  async updateUser(userID, description, profilePictureUrl) {
    const response = await fetch(`${this.apiBaseUrl}/users/${userID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: description,
        profile_picture_url: profilePictureUrl,
      }),
    });

    if (!response.ok) throw new Error("Erro ao actualizar o usuario");

    return;
  }

  async getUser(userID) {
    const response = await fetch(`${this.apiBaseUrl}/users/${userID}`);
    if (!response.ok) throw new Error("Erro ao obter o usuario");
    return await response.json();
  }

  async getUserPosts(userID) {
    const response = await fetch(`${this.apiBaseUrl}/users/${userID}/posts`);
    if (!response.ok) throw new Error("Erro ao obter os posts do usuario");
    return await response.json();
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

    if (!response.ok) throw new Error("Non se puideron obter resultados");
    return await response.json();
  }

  async uploadImage(image, userID) {
    const formData = new FormData();
    formData.append("file", image);

    if (!userID)
      throw new Error("O ID do usuario é necesario para subir a imaxe");

    // First upload the image to the server
    const uploadResponse = await fetch(
      `${this.apiBaseUrl}/users/${userID}/pictures`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!uploadResponse.ok) throw new Error("Erro ao subir a imaxe");

    const searchResult = await uploadResponse.json();
    console.log("Image URL", searchResult.image_url);

    return searchResult.image_url;
  }

  async imageSearch(image, userID) {
    const imageUrl = await this.uploadImage(image, userID);

    const searchResponse = await fetch(
      `${this.apiBaseUrl}/clothing:image_search?picture_url=${imageUrl}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    if (!searchResponse.ok) {
      throw new Error("Non se puideron obter resultados");
    }

    const searchResult = await searchResponse.json();
    return searchResult;
  }
}

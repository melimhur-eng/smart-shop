const state = {
  products: [],
  favorites: [],
  search: "",
  showFavorites: false,
};

const searchform = document.querySelector("#search-form");
const searchinput = document.querySelector("#search-input");
const message = document.querySelector("#message");
const productsContainer = document.querySelector("#products-container");
const favoritesContainer = document.querySelector("#favorites-container");

const favoritesBtn = document.querySelector("#favorites-btn");

favoritesBtn.addEventListener("click", () => {
  state.showFavorites = !state.showFavorites;
  render();
});

async function loadproducts() {
  message.innerHTML = "Loading...";

  try {
    const response = await fetch("https://dummyjson.com/products");

    if (!response.ok) {
      throw new Error("Failed to fetch from API");
    }

    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      message.innerHTML = "No products found.";
      state.products = [];
      render();
      return;
    }

    state.products = data.products;

    message.innerHTML = "";

    render();
  } catch (err) {
    message.innerHTML = "Can't fetch from the API.";
    console.error("The real error is:", err);
  }
}

function render() {
  const term = state.search.toLowerCase().trim();

  if (state.showFavorites) {
    productsContainer.innerHTML = state.favorites
      .map((product) => createCard(product))
      .join("");

    favoritesContainer.innerHTML = "";
    return;
  }

  const filtered = state.products.filter((product) =>
    product.title.toLowerCase().includes(term),
  );

  productsContainer.innerHTML = filtered
    .map((product) => createCard(product))
    .join("");

  favoritesContainer.innerHTML = state.favorites
    .map((fav) => createCard(fav))
    .join("");
}

function createCard(product) {
  const image = product?.thumbnail;
  const name = product?.title;
  const rating = product?.rating;

  const saved = state.favorites.some((fav) => fav.id === product.id);

  return `
    <article class="card">

      <img src="${image}" alt="${name}" style="object-fit: contain">

      <div class="card-content">

        <h3>${name}</h3>

        <p>Rating: ${rating || "N/A"}</p>

        <button 
    class="${saved ? "remove-btn" : "favorite-btn"}"
    onclick="toggleFavorite(${product.id})"
>
    ${saved ? "Remove" : "Favorite"}
</button>

      </div>

    </article>
  `;
}

function toggleFavorite(id) {
  const exist = state.favorites.some((fav) => fav.id === id);

  if (exist) {
    state.favorites = state.favorites.filter((data) => data.id !== id);
  } else {
    const data = state.products.find((item) => item.id === id);

    if (data) {
      state.favorites.push(data);
    }
  }

  saveFavorites();

  render();
}

function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
}

function loadFavorites() {
  const savedData = localStorage.getItem("favorites");

  state.favorites = JSON.parse(savedData) || [];
}

searchform.addEventListener("submit", (e) => {
  e.preventDefault();

  state.search = searchinput.value.trim();

  render();
});

async function init() {
  loadFavorites();

  await loadproducts("home");
}

init();

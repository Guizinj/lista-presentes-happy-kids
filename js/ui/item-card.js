export function formatPrice(price) {
  if (price === null || price === undefined || !Number.isFinite(price)) {
    return null;
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

function setImageFallback(image, fallback, title) {
  image.addEventListener(
    "error",
    () => {
      image.hidden = true;
      image.removeAttribute("src");
      image.alt = `Foto de ${title} indisponível`;
      fallback.hidden = false;
    },
    { once: true },
  );
}

function isValidWhatsAppUrl(value) {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    const phoneNumber = url.pathname.replace(/^\//, "");

    return (
      url.protocol === "https:" &&
      url.hostname === "wa.me" &&
      /^\d{8,15}$/.test(phoneNumber)
    );
  } catch {
    return false;
  }
}

export function createGiftItemCard(item, onOpen, purchaseUrl = null) {
  const listItem = document.createElement("li");
  const card = document.createElement("article");
  const photoButton = document.createElement("button");
  const image = document.createElement("img");
  const fallback = document.createElement("span");
  const content = document.createElement("div");
  const status = document.createElement("p");
  const title = document.createElement("h3");
  const price = document.createElement("p");
  const viewPhoto = document.createElement("button");
  const whatsappLink = document.createElement("a");

  listItem.className = "gift-grid-item";
  card.className = "gift-card";
  card.dataset.status = item.status;
  photoButton.className = "gift-photo-button";
  photoButton.type = "button";
  photoButton.setAttribute("aria-label", `Ver foto ampliada de ${item.title}`);
  image.className = "gift-card-image";
  image.src = item.imageUrl;
  image.alt = `Foto de ${item.title}`;
  image.loading = "lazy";
  fallback.className = "image-fallback gift-card-fallback";
  fallback.textContent = "Foto indisponível";
  fallback.hidden = true;
  setImageFallback(image, fallback, item.title);

  content.className = "gift-card-content";
  status.className = "status-badge";
  status.dataset.status = item.status;
  status.textContent = item.status === "sold" ? "Comprado" : "Disponível";
  title.textContent = item.title;
  price.className = "gift-card-price";
  const formattedPrice = formatPrice(item.price);
  price.hidden = !formattedPrice;
  price.textContent = formattedPrice || "";
  viewPhoto.className = "gift-card-view-photo";
  viewPhoto.type = "button";
  viewPhoto.textContent = "Ver foto ampliada ";
  viewPhoto.setAttribute("aria-label", `Ver foto ampliada de ${item.title}`);

  photoButton.addEventListener("click", onOpen);
  viewPhoto.addEventListener("click", onOpen);
  photoButton.append(image, fallback);
  content.append(status, title, price, viewPhoto);

  if (item.status === "available" && isValidWhatsAppUrl(purchaseUrl)) {
    whatsappLink.className = "gift-card-whatsapp";
    whatsappLink.href = purchaseUrl;
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener noreferrer";
    whatsappLink.textContent = "Quero pelo WhatsApp";
    whatsappLink.setAttribute(
      "aria-label",
      `Quero o presente ${item.title} pelo WhatsApp`,
    );
    content.append(whatsappLink);
  }

  card.append(photoButton, content);
  listItem.append(card);

  return listItem;
}

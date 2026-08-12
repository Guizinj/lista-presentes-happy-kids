import { STORE_WHATSAPP_NUMBER, isSupabaseConfigured } from "../config.js";
import { getPublicGiftItems, getPublicGiftList } from "../services/public-lists-service.js";
import { createPublicGallery } from "../ui/public-gallery.js";
import { createGiftItemCard, formatPrice } from "../ui/item-card.js";

const listSlug = new URLSearchParams(window.location.search).get("lista");
let currentList = null;
let currentItems = [];

const elements = {
  title: document.querySelector("#list-title"),
  eventDate: document.querySelector("#list-event-date"),
  statusPanel: document.querySelector("#list-status"),
  statusTitle: document.querySelector("#list-status-title"),
  feedback: document.querySelector("#public-list-feedback"),
  catalog: document.querySelector("#catalog-section"),
  count: document.querySelector("#catalog-count"),
  items: document.querySelector("#gift-items"),
  gallery: document.querySelector("#gift-gallery"),
};

function isValidSlug(value) {
  return /^[a-f0-9]{32}$/i.test(value || "");
}

function isWhatsAppConfigured() {
  return /^\d{8,15}$/.test(STORE_WHATSAPP_NUMBER);
}

function formatDate(date) {
  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) return "Data do evento a confirmar";

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(parsedDate);
}

function setStatus(title, message, variant = "neutral") {
  elements.statusTitle.textContent = title;
  elements.feedback.textContent = message;
  elements.feedback.dataset.variant = variant;
  elements.statusPanel.hidden = false;
}

function getPurchaseUrl(item) {
  if (!currentList || item.status !== "available" || !isWhatsAppConfigured()) return null;

  const messageParts = [
    `Olá! Quero comprar o presente “${item.title}” da lista de ${currentList.childName}.`,
  ];
  const price = formatPrice(item.price);

  if (price) messageParts.push(`Preço: ${price}.`);
  messageParts.push(`Link da lista: ${window.location.href}`);

  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(messageParts.join("\n"))}`;
}

const gallery = createPublicGallery({
  dialog: elements.gallery,
  getPurchaseUrl,
});

function renderItems(items) {
  elements.items.replaceChildren();
  const availableCount = items.filter((item) => item.status === "available").length;
  const itemLabel = items.length === 1 ? "presente" : "presentes";
  const availableLabel = availableCount === 1 ? "disponível" : "disponíveis";

  elements.count.textContent = `${items.length} ${itemLabel}, ${availableCount} ${availableLabel}`;

  items.forEach((item, index) => {
    const purchaseUrl = getPurchaseUrl(item);
    const card = createGiftItemCard(
      item,
      () => gallery.open(currentItems, index),
      purchaseUrl,
    );
    elements.items.append(card);
  });
}

async function initialize() {
  if (!isSupabaseConfigured()) {
    setStatus(
      "Lista indisponível",
      "A conexão da lista ainda não foi configurada. Tente novamente mais tarde.",
      "error",
    );
    return;
  }

  if (!isValidSlug(listSlug)) {
    setStatus(
      "Link inválido",
      "Confira o link recebido e tente abri-lo novamente.",
      "error",
    );
    return;
  }

  setStatus("Carregando a lista", "Buscando os presentes disponíveis.");

  try {
    currentList = await getPublicGiftList(listSlug);

    if (!currentList) {
      elements.title.textContent = "Lista indisponível";
      elements.eventDate.textContent = "Este link não corresponde a uma lista pública.";
      setStatus(
        "Lista não encontrada",
        "Ela pode ter sido removida ou o link pode estar incompleto.",
        "error",
      );
      return;
    }

    elements.title.textContent = `Lista de presentes de ${currentList.childName}`;
    elements.eventDate.textContent = `Aniversário: ${formatDate(currentList.eventDate)}`;
    document.title = `Lista de ${currentList.childName} | Happy Kids`;

    currentItems = await getPublicGiftItems(listSlug);

    if (currentItems.length === 0) {
      setStatus(
        "Lista em preparação",
        "Ainda não há presentes cadastrados. Volte em breve para conferir as novidades.",
      );
      return;
    }

    renderItems(currentItems);
    elements.statusPanel.hidden = true;
    elements.catalog.hidden = false;
  } catch (error) {
    console.error("Não foi possível carregar a lista pública.", error);
    elements.title.textContent = "Lista indisponível";
    elements.eventDate.textContent = "Tente novamente em alguns instantes.";
    setStatus(
      "Não foi possível carregar a lista",
      "Verifique sua conexão com a internet e tente novamente.",
      "error",
    );
  }
}

initialize();

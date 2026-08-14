import { formatPrice } from "./item-card.js";

export function createPublicGallery({ dialog, getPurchaseUrl }) {
  const elements = {
    close: dialog.querySelector("#gallery-close"),
    media: dialog.querySelector("#gallery-media"),
    image: dialog.querySelector("#gallery-image"),
    imageFallback: dialog.querySelector("#gallery-image-fallback"),
    position: dialog.querySelector("#gallery-position"),
    status: dialog.querySelector("#gallery-status"),
    title: dialog.querySelector("#gallery-item-title"),
    price: dialog.querySelector("#gallery-item-price"),
    message: dialog.querySelector("#gallery-item-message"),
    whatsapp: dialog.querySelector("#gallery-whatsapp"),
    previous: dialog.querySelector("#gallery-previous"),
    next: dialog.querySelector("#gallery-next"),
  };
  let items = [];
  let currentIndex = 0;
  let pointerStartX = null;
  let scrollPosition = 0;

  function lockBackgroundScroll() {
    scrollPosition = window.scrollY;
    document.body.style.setProperty("--gallery-scroll-offset", `-${scrollPosition}px`);
    document.body.classList.add("gallery-open");
  }

  function unlockBackgroundScroll() {
    if (!document.body.classList.contains("gallery-open")) return;

    document.body.classList.remove("gallery-open");
    document.body.style.removeProperty("--gallery-scroll-offset");
    window.scrollTo(0, scrollPosition);
  }

  function getCurrentItem() {
    return items[currentIndex];
  }

  function render() {
    const item = getCurrentItem();
    if (!item) return;

    const price = formatPrice(item.price);
    const purchaseUrl = item.status === "available" ? getPurchaseUrl(item) : null;

    elements.image.hidden = false;
    elements.imageFallback.hidden = true;
    elements.image.src = item.imageUrl;
    elements.image.alt = `Foto de ${item.title}`;
    elements.position.textContent = `${currentIndex + 1} de ${items.length}`;
    elements.status.dataset.status = item.status;
    elements.status.textContent = item.status === "sold" ? "Comprado" : "Disponível";
    elements.title.textContent = item.title;
    elements.price.hidden = !price;
    elements.price.textContent = price || "";
    elements.previous.disabled = items.length <= 1;
    elements.next.disabled = items.length <= 1;

    if (item.status === "sold") {
      elements.message.textContent = "Este presente já foi adquirido.";
      elements.whatsapp.hidden = true;
      elements.whatsapp.removeAttribute("href");
      return;
    }

    if (purchaseUrl) {
      elements.message.textContent = "Confirme a disponibilidade e o pagamento com a Happy Kids Brinquedos.";
      elements.whatsapp.href = purchaseUrl;
      elements.whatsapp.hidden = false;
      return;
    }

    elements.message.textContent = "Disponível. O WhatsApp da loja ainda não foi configurado.";
    elements.whatsapp.hidden = true;
    elements.whatsapp.removeAttribute("href");
  }

  function goTo(index) {
    if (items.length <= 1) return;

    currentIndex = (index + items.length) % items.length;
    render();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  elements.close.addEventListener("click", close);
  elements.previous.addEventListener("click", () => goTo(currentIndex - 1));
  elements.next.addEventListener("click", () => goTo(currentIndex + 1));
  dialog.addEventListener("close", unlockBackgroundScroll);

  elements.image.addEventListener("error", () => {
    const item = getCurrentItem();
    if (!item) return;

    elements.image.hidden = true;
    elements.image.removeAttribute("src");
    elements.image.alt = `Foto de ${item.title} indisponível`;
    elements.imageFallback.hidden = false;
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(currentIndex + 1);
    }
  });

  elements.media.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) return;
    pointerStartX = event.clientX;
  });

  elements.media.addEventListener("pointerup", (event) => {
    if (!event.isPrimary || pointerStartX === null) return;

    const horizontalDistance = event.clientX - pointerStartX;
    pointerStartX = null;

    if (Math.abs(horizontalDistance) < 48) return;
    goTo(horizontalDistance < 0 ? currentIndex + 1 : currentIndex - 1);
  });

  elements.media.addEventListener("pointercancel", () => {
    pointerStartX = null;
  });

  return {
    open(nextItems, index) {
      items = nextItems;
      currentIndex = index;
      render();

      if (!dialog.open) {
        dialog.showModal();
        lockBackgroundScroll();
      }
      window.requestAnimationFrame(() => elements.close.focus());
    },
  };
}

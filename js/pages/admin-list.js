import { isSupabaseConfigured } from "../config.js";
import { getCurrentSession } from "../services/auth-service.js";
import { deleteGiftList } from "../services/lists-service.js";
import {
  createGiftItem,
  deleteGiftItem,
  getGiftItems,
  getGiftListById,
  updateGiftItemStatus,
} from "../services/items-service.js";
import { removeToyImage, uploadToyImage } from "../services/storage-service.js";
import { createImagePicker } from "../ui/image-picker.js";

const listId = new URLSearchParams(window.location.search).get("id");
let currentList = null;

const elements = {
  listName: document.querySelector("#list-name"),
  listDate: document.querySelector("#list-date"),
  feedback: document.querySelector("#admin-list-feedback"),
  management: document.querySelector("#list-management"),
  copyPublicLink: document.querySelector("#copy-public-link"),
  openPublicList: document.querySelector("#open-public-list"),
  deleteList: document.querySelector("#delete-list"),
  form: document.querySelector("#new-item-form"),
  submit: document.querySelector("#new-item-submit"),
  galleryInput: document.querySelector("#gallery-image-input"),
  cameraInput: document.querySelector("#camera-image-input"),
  photoPreview: document.querySelector("#photo-preview"),
  photoPreviewImage: document.querySelector("#photo-preview-image"),
  photoFileName: document.querySelector("#photo-file-name"),
  photoFileDetails: document.querySelector("#photo-file-details"),
  removeSelectedPhoto: document.querySelector("#remove-selected-photo"),
  itemsList: document.querySelector("#items-list"),
  itemsEmptyState: document.querySelector("#items-empty-state"),
};

function setFeedback(message, variant = "neutral") {
  elements.feedback.textContent = message;
  elements.feedback.dataset.variant = variant;
}

function setButtonLoading(button, isLoading, loadingLabel) {
  if (!button.dataset.defaultLabel) {
    button.dataset.defaultLabel = button.textContent.trim();
  }

  button.disabled = isLoading;
  button.textContent = isLoading ? loadingLabel : button.dataset.defaultLabel;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
    new Date(`${date}T12:00:00`),
  );
}

function formatPrice(price) {
  if (price === null || price === undefined) return "Preço não informado";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

function getPublicListUrl(slug) {
  const url = new URL("./lista.html", window.location.href);
  url.searchParams.set("lista", slug);
  return url.href;
}

function isValidUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value || "",
  );
}

function createButton(label, className = "button button-secondary") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  return button;
}

function renderItems(items) {
  elements.itemsList.replaceChildren();
  elements.itemsEmptyState.hidden = items.length > 0;

  if (items.length === 0) {
    elements.itemsEmptyState.textContent = "Nenhum brinquedo cadastrado ainda.";
    return;
  }

  for (const item of items) {
    const listItem = document.createElement("li");
    const media = document.createElement("div");
    const image = document.createElement("img");
    const imageFallback = document.createElement("span");
    const content = document.createElement("div");
    const title = document.createElement("h3");
    const price = document.createElement("p");
    const status = document.createElement("span");
    const actions = document.createElement("div");
    const statusButton = createButton(
      item.status === "sold" ? "Marcar disponível" : "Marcar comprado",
    );
    const deleteButton = createButton("Remover", "button button-danger");

    listItem.className = "item-management-card";
    media.className = "item-management-media";
    image.src = item.image_url;
    image.alt = item.title;
    image.loading = "lazy";
    imageFallback.className = "item-management-image-fallback";
    imageFallback.textContent = "Foto indisponível";
    imageFallback.hidden = true;
    image.addEventListener(
      "error",
      () => {
        image.hidden = true;
        image.alt = `Foto de ${item.title} indisponível`;
        image.removeAttribute("src");
        imageFallback.hidden = false;
      },
      { once: true },
    );
    title.textContent = item.title;
    price.className = "item-price";
    price.textContent = formatPrice(item.price);
    status.className = "status-badge";
    status.dataset.status = item.status;
    status.textContent = item.status === "sold" ? "Comprado" : "Disponível";
    actions.className = "item-management-actions";

    statusButton.addEventListener("click", () => toggleItemStatus(item, statusButton));
    deleteButton.addEventListener("click", () => removeItem(item, deleteButton));

    actions.append(statusButton, deleteButton);
    content.className = "item-management-content";
    content.append(title, price, status, actions);
    media.append(image, imageFallback);
    listItem.append(media, content);
    elements.itemsList.append(listItem);
  }
}

async function loadItems() {
  elements.itemsEmptyState.hidden = false;
  elements.itemsEmptyState.textContent = "Carregando brinquedos…";

  try {
    renderItems(await getGiftItems(currentList.id));
  } catch (error) {
    elements.itemsEmptyState.textContent = "Não foi possível carregar os brinquedos.";
    setFeedback(error.message || "Erro ao carregar brinquedos.", "error");
  }
}

async function toggleItemStatus(item, button) {
  const nextStatus = item.status === "sold" ? "available" : "sold";
  setButtonLoading(button, true, "Salvando…");

  try {
    await updateGiftItemStatus(item.id, nextStatus);
    setFeedback("Status do brinquedo atualizado.", "success");
    await loadItems();
  } catch (error) {
    setFeedback(error.message || "Não foi possível atualizar o status.", "error");
    setButtonLoading(button, false);
  }
}

async function removeItem(item, button) {
  const isConfirmed = window.confirm(
    `Remover “${item.title}” da lista? Essa ação não poderá ser desfeita.`,
  );

  if (!isConfirmed) return;

  setButtonLoading(button, true, "Removendo…");

  try {
    await deleteGiftItem(item.id);

    try {
      await removeToyImage(item.image_path);
      setFeedback("Brinquedo e foto removidos.", "success");
    } catch (storageError) {
      console.error("O item foi removido, mas a foto não pôde ser apagada.", storageError);
      setFeedback(
        "O brinquedo foi removido, mas a foto não pôde ser apagada do Storage.",
        "error",
      );
    }

    await loadItems();
  } catch (error) {
    setFeedback(error.message || "Não foi possível remover o brinquedo.", "error");
    setButtonLoading(button, false);
  }
}

async function removeList() {
  const isConfirmed = window.confirm(
    `Excluir permanentemente a lista de “${currentList.child_name}”, todos os brinquedos e as fotos vinculadas? Essa ação não poderá ser desfeita.`,
  );

  if (!isConfirmed) return;

  setButtonLoading(elements.deleteList, true, "Excluindo…");
  setFeedback("Excluindo a lista e seus brinquedos…");

  try {
    const items = await getGiftItems(currentList.id);
    await deleteGiftList(currentList.id);
    const imagePaths = items.map((item) => item.image_path).filter(Boolean);
    const removals = await Promise.allSettled(
      imagePaths.map((path) => removeToyImage(path)),
    );
    const failedRemovals = removals.filter((result) => result.status === "rejected");

    if (failedRemovals.length > 0) {
      const photoLabel = failedRemovals.length === 1 ? "foto" : "fotos";
      elements.management.hidden = true;
      elements.listDate.textContent = "A lista e seus brinquedos foram excluídos.";
      setFeedback(
        `A lista foi excluída, mas ${failedRemovals.length} ${photoLabel} não puderam ser apagadas do Storage. Pode haver arquivos órfãos; volte para as listas.`,
        "error",
      );
      return;
    }

    setFeedback("Lista e fotos excluídas com sucesso. Voltando para as listas…", "success");
    window.location.replace("./admin.html");
  } catch (error) {
    console.error("Não foi possível excluir a lista.", error);
    setFeedback(
      "Não foi possível excluir a lista. Tente novamente.",
      "error",
    );
    setButtonLoading(elements.deleteList, false);
  }
}

const imagePicker = createImagePicker({
  galleryInput: elements.galleryInput,
  cameraInput: elements.cameraInput,
  preview: elements.photoPreview,
  previewImage: elements.photoPreviewImage,
  fileName: elements.photoFileName,
  fileDetails: elements.photoFileDetails,
  removeButton: elements.removeSelectedPhoto,
  onError: (message) => setFeedback(message, "error"),
  onReady: () => setFeedback("Foto pronta para envio."),
});

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const imageFile = imagePicker.getFile();

  if (!imageFile) {
    setFeedback("Escolha ou tire uma foto antes de adicionar o brinquedo.", "error");
    return;
  }

  const formData = new FormData(elements.form);
  const title = formData.get("title");
  const rawPrice = formData.get("price").trim();
  const price = rawPrice === "" ? null : Number(rawPrice);

  if (!Number.isFinite(price) && price !== null) {
    setFeedback("Informe um preço válido ou deixe o campo em branco.", "error");
    return;
  }

  let uploadedImage = null;
  setButtonLoading(elements.submit, true, "Enviando foto…");
  setFeedback("Otimizando e enviando a foto…");

  try {
    uploadedImage = await uploadToyImage(currentList.id, imageFile);
    setButtonLoading(elements.submit, true, "Salvando brinquedo…");

    await createGiftItem({
      listId: currentList.id,
      title,
      price,
      imageUrl: uploadedImage.publicUrl,
      imagePath: uploadedImage.path,
    });

    elements.form.reset();
    imagePicker.clear();
    setFeedback("Brinquedo adicionado com sucesso.", "success");
    await loadItems();
  } catch (error) {
    if (uploadedImage) {
      try {
        await removeToyImage(uploadedImage.path);
      } catch (cleanupError) {
        console.error("Não foi possível limpar a foto após falha no cadastro.", cleanupError);
      }
    }

    setFeedback(error.message || "Não foi possível adicionar o brinquedo.", "error");
  } finally {
    setButtonLoading(elements.submit, false);
  }
});

elements.copyPublicLink.addEventListener("click", async () => {
  const publicUrl = getPublicListUrl(currentList.public_slug);
  setButtonLoading(elements.copyPublicLink, true, "Copiando…");

  try {
    await navigator.clipboard.writeText(publicUrl);
    setFeedback("Link público copiado. Já pode enviar pelo WhatsApp.", "success");
  } catch (error) {
    setFeedback(`Não foi possível copiar automaticamente. Copie este link: ${publicUrl}`, "error");
  } finally {
    setButtonLoading(elements.copyPublicLink, false);
  }
});

elements.deleteList.addEventListener("click", () => {
  removeList();
});

async function initialize() {
  if (!isSupabaseConfigured()) {
    setFeedback("Configure o Supabase antes de gerenciar uma lista.", "error");
    return;
  }

  if (!isValidUuid(listId)) {
    setFeedback("Esta lista não é válida. Volte e escolha uma lista existente.", "error");
    return;
  }

  try {
    const session = await getCurrentSession();
    if (!session) {
      window.location.replace("./admin.html");
      return;
    }

    currentList = await getGiftListById(listId);
    elements.listName.textContent = `Lista de ${currentList.child_name}`;
    elements.listDate.textContent = `Evento: ${formatDate(currentList.event_date)}`;
    elements.openPublicList.href = getPublicListUrl(currentList.public_slug);
    elements.management.hidden = false;
    setFeedback("Lista carregada.", "success");
    await loadItems();
  } catch (error) {
    setFeedback(
      "Não foi possível abrir esta lista. Confirme que sua conta é uma vendedora autorizada.",
      "error",
    );
  }
}

initialize();

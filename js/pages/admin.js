import { isSupabaseConfigured } from "../config.js";
import { getCurrentSession, signInWithPassword, signOut } from "../services/auth-service.js";
import { createGiftList, getGiftLists } from "../services/lists-service.js";

const elements = {
  feedback: document.querySelector("#admin-feedback"),
  loginSection: document.querySelector("#login-section"),
  loginForm: document.querySelector("#login-form"),
  loginSubmit: document.querySelector("#login-submit"),
  dashboard: document.querySelector("#dashboard-section"),
  sellerEmail: document.querySelector("#seller-email"),
  signOutButton: document.querySelector("#sign-out-button"),
  newListForm: document.querySelector("#new-list-form"),
  newListSubmit: document.querySelector("#new-list-submit"),
  listsList: document.querySelector("#lists-list"),
  emptyState: document.querySelector("#lists-empty-state"),
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
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
    new Date(`${date}T12:00:00`),
  );
}

function getPublicListUrl(slug) {
  const url = new URL("./lista.html", window.location.href);
  url.searchParams.set("lista", slug);
  return url.href;
}

function getAdminListUrl(id) {
  const url = new URL("./admin-list.html", window.location.href);
  url.searchParams.set("id", id);
  return url.href;
}

function renderGiftLists(lists) {
  elements.listsList.replaceChildren();
  elements.emptyState.hidden = lists.length > 0;

  if (lists.length === 0) {
    elements.emptyState.textContent = "Nenhuma lista criada ainda.";
    return;
  }

  for (const list of lists) {
    const item = document.createElement("li");
    const details = document.createElement("div");
    const name = document.createElement("strong");
    const date = document.createElement("p");
    const actions = document.createElement("div");
    const manageLink = document.createElement("a");
    const publicLink = document.createElement("a");

    name.textContent = list.child_name;
    date.className = "panel-description";
    date.textContent = formatDate(list.event_date);
    actions.className = "list-summary-actions";
    manageLink.href = getAdminListUrl(list.id);
    manageLink.textContent = "Gerenciar";
    publicLink.href = getPublicListUrl(list.public_slug);
    publicLink.textContent = "Visualizar";
    publicLink.target = "_blank";
    publicLink.rel = "noopener noreferrer";

    details.append(name, date);
    actions.append(manageLink, publicLink);
    item.append(details, actions);
    elements.listsList.append(item);
  }
}

async function loadGiftLists() {
  elements.emptyState.hidden = false;
  elements.emptyState.textContent = "Carregando listas…";

  try {
    renderGiftLists(await getGiftLists());
  } catch (error) {
    elements.emptyState.textContent = "Não foi possível carregar as listas.";
    setFeedback(error.message, "error");
  }
}

async function showDashboard(session) {
  elements.loginSection.hidden = true;
  elements.dashboard.hidden = false;
  elements.sellerEmail.textContent = `Conectada como ${session.user.email}.`;
  setFeedback("Administração liberada.", "success");
  await loadGiftLists();
}

function showLogin(message = "Entre para administrar as listas.") {
  elements.dashboard.hidden = true;
  elements.loginSection.hidden = false;
  setFeedback(message);
}

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(elements.loginForm);
  const email = formData.get("email");
  const password = formData.get("password");

  setButtonLoading(elements.loginSubmit, true, "Entrando…");
  setFeedback("Verificando acesso…");

  try {
    const session = await signInWithPassword(email, password);
    await showDashboard(session);
    elements.loginForm.reset();
  } catch (error) {
    setFeedback(
      `Não foi possível entrar: ${error.message || "erro de autenticação desconhecido"}.`,
      "error",
    );
  } finally {
    setButtonLoading(elements.loginSubmit, false);
  }
});

elements.newListForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(elements.newListForm);
  const childName = formData.get("childName");
  const eventDate = formData.get("eventDate");

  setButtonLoading(elements.newListSubmit, true, "Criando…");
  setFeedback("Criando a lista…");

  try {
    const list = await createGiftList({ childName, eventDate });
    elements.newListForm.reset();
    setFeedback(`Lista de ${list.child_name} criada com sucesso.`, "success");
    await loadGiftLists();
  } catch (error) {
    setFeedback(
      "Não foi possível criar a lista. Verifique se esta conta foi cadastrada como vendedora.",
      "error",
    );
  } finally {
    setButtonLoading(elements.newListSubmit, false);
  }
});

elements.signOutButton.addEventListener("click", async () => {
  setButtonLoading(elements.signOutButton, true, "Saindo…");

  try {
    await signOut();
    showLogin("Sessão encerrada.");
  } catch (error) {
    setFeedback("Não foi possível encerrar a sessão. Tente novamente.", "error");
  } finally {
    setButtonLoading(elements.signOutButton, false);
  }
});

async function initialize() {
  if (!isSupabaseConfigured()) {
    showLogin("Configure a URL e a chave pública do Supabase primeiro.");
    return;
  }

  try {
    const session = await getCurrentSession();
    if (session) {
      await showDashboard(session);
    } else {
      showLogin();
    }
  } catch (error) {
    showLogin("Não foi possível verificar sua sessão. Recarregue a página.");
  }
}

initialize();

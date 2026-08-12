const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_SIDE = 1600;
const OPTIMIZE_ABOVE_BYTES = 5 * 1024 * 1024;
const STORAGE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Não foi possível abrir esta imagem."));
    };
    image.src = objectUrl;
  });
}

function canvasToJpeg(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Não foi possível otimizar a imagem."));
        }
      },
      "image/jpeg",
      0.82,
    );
  });
}

async function optimizeImage(file) {
  const image = await loadImage(file);
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
  const needsOptimization =
    longestSide > MAX_IMAGE_SIDE ||
    file.size > OPTIMIZE_ABOVE_BYTES ||
    !STORAGE_IMAGE_TYPES.has(file.type);

  if (!needsOptimization) return { file, wasOptimized: false };

  const scale = Math.min(1, MAX_IMAGE_SIDE / longestSide);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });

  canvas.width = width;
  canvas.height = height;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToJpeg(canvas);
  const baseName = file.name.replace(/\.[^.]+$/, "") || "brinquedo";
  const optimizedFile = new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });

  if (optimizedFile.size > MAX_UPLOAD_BYTES) {
    throw new Error("A foto continua muito grande após a otimização. Escolha outra imagem.");
  }

  return { file: optimizedFile, wasOptimized: true };
}

export function createImagePicker({
  galleryInput,
  cameraInput,
  preview,
  previewImage,
  fileName,
  fileDetails,
  removeButton,
  onError,
  onReady,
}) {
  let selectedFile = null;
  let previewUrl = null;
  let selectionVersion = 0;

  function clearPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    previewImage.removeAttribute("src");
    previewImage.alt = "";
    fileName.textContent = "";
    fileDetails.textContent = "";
    removeButton.hidden = true;
    preview.hidden = true;
  }

  function clear() {
    selectionVersion += 1;
    selectedFile = null;
    galleryInput.value = "";
    cameraInput.value = "";
    clearPreview();
  }

  async function selectFile(file) {
    if (!file) return;

    const currentSelectionVersion = ++selectionVersion;
    selectedFile = null;
    clearPreview();

    if (!file.type.startsWith("image/")) {
      clear();
      onError("Escolha um arquivo de imagem válido.");
      return;
    }

    if (file.size > MAX_SOURCE_BYTES) {
      clear();
      onError("A foto deve ter no máximo 15 MB antes da otimização.");
      return;
    }

    try {
      const result = await optimizeImage(file);

      if (currentSelectionVersion !== selectionVersion) return;

      clearPreview();
      selectedFile = result.file;
      previewUrl = URL.createObjectURL(selectedFile);
      previewImage.src = previewUrl;
      previewImage.alt = `Prévia da foto selecionada: ${file.name}`;
      fileName.textContent = file.name;
      fileDetails.textContent = result.wasOptimized
        ? `Imagem otimizada para ${formatBytes(selectedFile.size)} antes do envio.`
        : `${formatBytes(selectedFile.size)} — pronta para envio.`;
      removeButton.hidden = false;
      preview.hidden = false;
      onReady();
    } catch (error) {
      if (currentSelectionVersion !== selectionVersion) return;

      clear();
      onError(
        `${error.message} Tente uma foto em JPEG, PNG ou WebP.`,
      );
    }
  }

  function handleInputChange(event) {
    selectFile(event.target.files?.[0]);
  }

  galleryInput.addEventListener("change", handleInputChange);
  cameraInput.addEventListener("change", handleInputChange);
  removeButton.addEventListener("click", clear);

  return {
    clear,
    getFile: () => selectedFile,
  };
}

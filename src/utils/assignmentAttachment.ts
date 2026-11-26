export const MAX_ASSIGNMENT_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_ASSIGNMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export interface PreparedAttachmentResult {
  file: File;
  wasCompressed: boolean;
  originalSizeBytes: number;
  finalSizeBytes: number;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function prepareAssignmentAttachment(
  rawFile: File
): Promise<PreparedAttachmentResult> {
  const isAllowedType = (ALLOWED_ASSIGNMENT_MIME_TYPES as readonly string[]).includes(
    rawFile.type
  );

  if (!isAllowedType) {
    throw new Error('Formato inválido. Envie apenas PDF, JPG, PNG ou WEBP.');
  }

  // PDFs não passam por compressão de imagem; valida diretamente o limite de 5 MB
  if (rawFile.type === 'application/pdf') {
    if (rawFile.size > MAX_ASSIGNMENT_FILE_SIZE_BYTES) {
      throw new Error('O arquivo PDF excede o limite máximo de 5 MB.');
    }
    return {
      file: rawFile,
      wasCompressed: false,
      originalSizeBytes: rawFile.size,
      finalSizeBytes: rawFile.size,
    };
  }

  // Tenta redimensionar/comprimir fotos para economizar espaço no disco
  try {
    const compressedFile = await compressImageFile(rawFile, 1600, 0.8);

    if (compressedFile.size > MAX_ASSIGNMENT_FILE_SIZE_BYTES) {
      throw new Error('A imagem ainda excede 5 MB mesmo após a compressão.');
    }

    const useCompressed = compressedFile.size < rawFile.size;
    const chosenFile = useCompressed ? compressedFile : rawFile;

    return {
      file: chosenFile,
      wasCompressed: useCompressed,
      originalSizeBytes: rawFile.size,
      finalSizeBytes: chosenFile.size,
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes('5 MB')) {
      throw err;
    }

    // Fallback seguro caso o ambiente não suporte canvas (ex: testes unitários)
    if (rawFile.size > MAX_ASSIGNMENT_FILE_SIZE_BYTES) {
      throw new Error('A imagem excede o limite máximo de 5 MB.');
    }

    return {
      file: rawFile,
      wasCompressed: false,
      originalSizeBytes: rawFile.size,
      finalSizeBytes: rawFile.size,
    };
  }
}

function compressImageFile(file: File, maxWidth: number, quality: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const targetWidth = Math.round(img.width * scale);
      const targetHeight = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D indisponível'));
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Falha ao gerar imagem comprimida'));
            return;
          }

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const compressed = new File([blob], `${baseName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Não foi possível ler a imagem selecionada.'));
    };

    img.src = objectUrl;
  });
}
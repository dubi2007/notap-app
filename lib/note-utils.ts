function collectText(value: unknown, parts: string[]): void {
  if (typeof value === 'string') {
    parts.push(value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectText(item, parts));
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  for (const nested of Object.values(value)) {
    collectText(nested, parts);
  }
}

export function getNotePreview(content: unknown, maxLength = 120): string {
  const parts: string[] = [];
  collectText(content, parts);

  const text = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (!text) {
    return 'Sin contenido aun';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

type RichNode = {
  type?: string;
  text?: string;
  content?: RichNode[];
};

function getNodeInlineText(node: RichNode | unknown): string {
  if (!node || typeof node !== 'object') {
    return '';
  }

  const typedNode = node as RichNode;

  if (typeof typedNode.text === 'string') {
    return typedNode.text;
  }

  if (!Array.isArray(typedNode.content)) {
    return '';
  }

  return typedNode.content.map((child) => getNodeInlineText(child)).join('');
}

function collectParagraphs(node: unknown, paragraphs: string[]): void {
  if (!node) {
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((child) => collectParagraphs(child, paragraphs));
    return;
  }

  if (typeof node !== 'object') {
    return;
  }

  const typedNode = node as RichNode;

  if (typedNode.type === 'paragraph' || typedNode.type === 'heading' || typedNode.type === 'blockquote') {
    const text = getNodeInlineText(typedNode).replace(/\s+/g, ' ').trim();

    if (text) {
      paragraphs.push(text);
    }
  }

  if (typedNode.type === 'codeBlock') {
    const text = getNodeInlineText(typedNode).trim();

    if (text) {
      paragraphs.push(text);
    }
  }

  if (Array.isArray(typedNode.content)) {
    typedNode.content.forEach((child) => collectParagraphs(child, paragraphs));
  }
}

export function getNoteParagraphs(content: unknown): string[] {
  const paragraphs: string[] = [];
  collectParagraphs(content, paragraphs);

  if (paragraphs.length > 0) {
    return paragraphs;
  }

  const plainText = getNotePreview(content, 4000);
  if (plainText && plainText !== 'Sin contenido aun') {
    return plainText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return 'Fecha desconocida';
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatLongDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return 'Fecha desconocida';
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

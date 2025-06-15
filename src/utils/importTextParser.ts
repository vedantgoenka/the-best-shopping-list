
export interface ParsedItem {
  text: string;
  quantity: number;
  completed: boolean;
  category?: string;
}

export const parseImportText = (text: string): ParsedItem[] => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const items: ParsedItem[] = [];
  let currentCategory: string | undefined;

  for (const line of lines) {
    // Check for completion status first (before any modifications)
    let completed = false;
    if (line.match(/\[x\]/i) || line.includes('[✓]') || line.includes('[X]')) {
      completed = true;
    }

    // Remove leading bullets, dashes, asterisks
    let cleanLine = line.replace(/^[-*•·]\s*/, '').trim();
    
    // Remove checkbox markers after checking completion status
    cleanLine = cleanLine.replace(/\[x\]/gi, '').replace(/\[X\]/g, '').replace(/\[✓\]/g, '').replace(/\[ \]/g, '').trim();
    
    // Check if line is a category heading (no checkbox, no quantity, ends with colon or is all caps)
    if (!line.includes('[') && !cleanLine.match(/^\d+x?\s/) && (cleanLine.endsWith(':') || cleanLine === cleanLine.toUpperCase())) {
      currentCategory = cleanLine.replace(':', '').trim();
      continue;
    }

    // Skip empty lines or lines that look like headers
    if (cleanLine.length === 0 || cleanLine.match(/^[-=]+$/)) {
      continue;
    }

    let parsedLine = cleanLine;

    // Parse quantity (formats like "2x apples", "3 apples", "2x ", etc.)
    let quantity = 1;
    let itemText = parsedLine;

    const quantityMatch = parsedLine.match(/^(\d+)x?\s+(.+)$/i);
    if (quantityMatch) {
      quantity = parseInt(quantityMatch[1]);
      itemText = quantityMatch[2].trim();
    }

    // Skip if no item text after parsing
    if (!itemText || itemText.length === 0) {
      continue;
    }

    items.push({
      text: itemText,
      quantity,
      completed,
      category: currentCategory,
    });
  }

  return items;
};

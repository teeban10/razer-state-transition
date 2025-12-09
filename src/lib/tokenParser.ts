export function parseTokens(line: string): { tokens: string[]; comment?: string } | null {
  const trimmed = line.trim();

  if (!trimmed) return null; // blank line

  const parts = trimmed.split(/\s+/);
  if (!parts[0]) {
    return null; // blank line
  }
  // If line starts with '#', treat whole thing as malformed
  if (parts[0].startsWith("#")) {
    throw new Error("Malformed command: '#' cannot start a command");
  }
    // Check for '#' token position
  const commentIndex = parts.findIndex(t => t === "#");

  // Case 1: No '#' token → normal line
  if (commentIndex === -1) {
    return { tokens: parts };
  }

  // Case 2: '#' token appears as argument (index < 4)
  if (commentIndex < 4) {
    // '#' is a normal argument, nothing stripped
    return { tokens: parts };
  }

  // Case 3: '#' is valid comment start
  const tokens = parts.slice(0, commentIndex);
  const comment = parts.slice(commentIndex + 1).join(" ");

  return { tokens, comment };
}

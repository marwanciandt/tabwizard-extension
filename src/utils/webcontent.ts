export function extractTextContent() {
  let text = "";
  const elements = document.querySelectorAll("article, p, h1, h2, h3"); // Customize selectors as needed
  elements.forEach((element) => {
    text += element.textContent + ",";
  });
  return text.trim();
}

export function preprocessText(text: string): string[] {
  const stopwords = [
    "and",
    "you",
    "your",
    "he",
    "she",
    "us",
    "can",
    "into",
    "the",
    "to",
    "of",
    "was",
    "with",
    "a",
    "an",
    "on",
    "in",
    "for",
    "that",
    "as",
    "it",
    "with",
    "is",
    "on",
    "or",
    "if",
    "at",
    "by",
    "which",
    "but",
    "its",
    "be",
  ]; // Add more stopwords
  let words: string[] = text
    .toLowerCase()
    .split(/\s+?/)
    .filter((word: string) => word.length > 1 && !stopwords.includes(word));
  return words;
}

export function extractKeywords(words: string[]): string[] {
  const wordFrequencies = {};
  words.forEach((word) => {
    if (!wordFrequencies[word]) wordFrequencies[word] = 0;
    wordFrequencies[word]++;
  });
  return Object.keys(wordFrequencies)
    .sort((a, b) => wordFrequencies[b] - wordFrequencies[a])
    .slice(0, 10); // Top 10 keywords
}

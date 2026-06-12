export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, "");
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 80);
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export function getExcerpt(content: string, length = 140): string {
  const text = stripHtml(content);
  return text.length > length ? text.substring(0, length) + "…" : text;
}

export const ALL_TAGS = [
  "JavaScript",
  "React",
  "TypeScript",
  "Python",
  "Machine Learning",
  "AI",
  "Design",
  "UX",
  "Frontend",
  "Backend",
  "Web Development",
  "CSS",
  "Node.js",
  "Programming",
  "Career",
  "Productivity",
  "Data Science",
  "DevOps",
];

// Seed data awal untuk database (mirip data dummy JSON sebelumnya).
// Jalankan dengan: npm run db:seed

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Hapus data lama (urutan penting karena foreign key)
  await prisma.clap.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();

  // === Users ===
  const john = await prisma.user.create({
    data: {
      username: "johndoe",
      email: "john@example.com",
      password: "password123", // NOTE: plain text hanya untuk demo
      name: "John Doe",
      bio: "Software engineer and tech writer. I write about JavaScript, React, and the future of the web.",
      avatar: "https://ui-avatars.com/api/?name=John+Doe&background=1a8917&color=fff&size=128",
    },
  });

  const jane = await prisma.user.create({
    data: {
      username: "janedoe",
      email: "jane@example.com",
      password: "password123",
      name: "Jane Doe",
      bio: "Product designer and UX enthusiast. Passionate about making technology accessible to everyone.",
      avatar: "https://ui-avatars.com/api/?name=Jane+Doe&background=6b46c1&color=fff&size=128",
    },
  });

  const alex = await prisma.user.create({
    data: {
      username: "alexsmith",
      email: "alex@example.com",
      password: "password123",
      name: "Alex Smith",
      bio: "Data scientist and machine learning engineer. I write about AI, Python, and data visualization.",
      avatar: "https://ui-avatars.com/api/?name=Alex+Smith&background=d97706&color=fff&size=128",
    },
  });

  // === Follows (John <-> Jane saling follow) ===
  await prisma.follow.create({ data: { followerId: john.id, followingId: jane.id } });
  await prisma.follow.create({ data: { followerId: jane.id, followingId: john.id } });

  // === Articles ===
  const article1 = await prisma.article.create({
    data: {
      slug: "the-future-of-javascript-2024",
      title: "The Future of JavaScript in 2024",
      subtitle: "A deep dive into what's coming next for the world's most popular programming language",
      content:
        "<h2>Introduction</h2><p>JavaScript has come a long way since its creation in 1995. From simple form validation to powering complex server-side applications, the language has evolved dramatically. In 2024, we're seeing some exciting new developments that will shape the future of web development.</p><h2>Top-Level Await</h2><p>One of the most anticipated features is top-level await in modules. This allows you to use the <code>await</code> keyword at the top level of a module, outside of any async function.</p><h2>Pattern Matching</h2><p>Pattern matching is coming to JavaScript through a proposal that's currently at Stage 2.</p><h2>Temporal API</h2><p>The Temporal API is a long-awaited replacement for the Date object.</p><h2>Conclusion</h2><p>The future of JavaScript looks bright, with many exciting proposals moving through the TC39 process.</p>",
      coverImage: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&q=80",
      tags: ["JavaScript", "Programming", "Web Development"],
      status: "published",
      readingTime: 5,
      authorId: john.id,
    },
  });

  const article2 = await prisma.article.create({
    data: {
      slug: "design-systems-that-scale",
      title: "Building Design Systems That Actually Scale",
      subtitle: "Lessons learned from building design systems for teams of all sizes",
      content:
        "<h2>Why Design Systems Matter</h2><p>A design system is more than just a component library. It's a shared language between designers and developers.</p><h2>The Foundation: Tokens</h2><p>Design tokens are the atomic building blocks of a design system.</p><h2>Component Architecture</h2><p>When building components, think about composability.</p><h2>Documentation is Key</h2><p>A design system without documentation is just a component library.</p><h2>Versioning and Evolution</h2><p>Design systems need to evolve, but changes must be managed carefully.</p>",
      coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
      tags: ["Design", "UX", "Frontend"],
      status: "published",
      readingTime: 6,
      authorId: jane.id,
    },
  });

  const article3 = await prisma.article.create({
    data: {
      slug: "machine-learning-for-beginners",
      title: "Machine Learning for Web Developers",
      subtitle: "You don't need a PhD to start using ML in your web applications",
      content:
        "<h2>Getting Started with ML</h2><p>Machine learning might seem intimidating at first, but web developers already have many of the skills needed to get started.</p><h2>TensorFlow.js</h2><p>TensorFlow.js brings machine learning to the browser and Node.js.</p><h2>Practical Use Cases</h2><p>Some practical ML applications for web developers include image classification, sentiment analysis, and recommendation systems.</p><h2>The Future of Web + ML</h2><p>As WebGPU becomes more widely available, running complex ML models in the browser will become increasingly feasible.</p>",
      coverImage: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
      tags: ["Machine Learning", "AI", "JavaScript"],
      status: "published",
      readingTime: 7,
      authorId: alex.id,
    },
  });

  const article4 = await prisma.article.create({
    data: {
      slug: "react-server-components-explained",
      title: "React Server Components: A Complete Guide",
      subtitle: "Everything you need to know about the biggest paradigm shift in React's history",
      content:
        "<h2>What Are Server Components?</h2><p>React Server Components represent a fundamental shift in how we think about rendering in React applications.</p><h2>Key Benefits</h2><p>The main benefits include reduced bundle size and direct access to server resources.</p><h2>When to Use Each</h2><p>Use Server Components for data fetching and heavy computation. Use Client Components for interactivity and state.</p><h2>The Future</h2><p>React Server Components represent the future of React development.</p>",
      coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
      tags: ["React", "JavaScript", "Web Development"],
      status: "published",
      readingTime: 8,
      authorId: john.id,
    },
  });

  await prisma.article.create({
    data: {
      slug: "draft-my-css-tips",
      title: "My CSS Tips and Tricks (Draft)",
      subtitle: "Collected wisdom from years of wrangling stylesheets",
      content: "<h2>Work in Progress</h2><p>This article is still being written. Come back soon!</p>",
      coverImage: "",
      tags: ["CSS", "Frontend"],
      status: "draft",
      readingTime: 1,
      authorId: jane.id,
    },
  });

  // === Claps ===
  await prisma.clap.createMany({
    data: [
      { userId: jane.id, articleId: article1.id },
      { userId: alex.id, articleId: article1.id },
      { userId: john.id, articleId: article2.id },
      { userId: john.id, articleId: article3.id },
      { userId: jane.id, articleId: article3.id },
      { userId: jane.id, articleId: article4.id },
      { userId: alex.id, articleId: article4.id },
    ],
  });

  // === Bookmarks ===
  await prisma.bookmark.createMany({
    data: [
      { userId: john.id, articleId: article2.id },
      { userId: jane.id, articleId: article1.id },
    ],
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

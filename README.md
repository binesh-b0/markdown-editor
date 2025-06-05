# MarkdownEditor

SvelteKit‑based web app for live Markdown editing and previewing.

[![Vercel Deployment](https://vercelbadge.vercel.app/api/binesh-b0/markdown-editor)](https://markdown-editor-iota-seven.vercel.app/)	[![SvelteKit](https://img.shields.io/badge/SvelteKit-%23f1413d.svg?logo=svelte&logoColor=white)](#)

[View Live Demo](https://markdown-editor-iota-seven.vercel.app/)

![Screenshot](docs/Screenshot.png)

---
## Installation & Setup

Clone the repository and install:
```bash
git clone <repo-url>
cd markdown-editor
npm install
```

Start the development server:
```bash
npm run dev
```

## Usage Tips

- Your work is automatically saved to `localStorage` on every change. Reloading
  the page will offer to restore the previous session.
- Use the **Download** button (⌘‑S) in the toolbar to save the current document
  as a `.md` file. When supported, the native File System API is used.
- A small *Unsaved* indicator appears in the toolbar whenever edits have not yet
  been downloaded.

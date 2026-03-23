import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = "/var/www/anoweb";

async function prerender() {
  // Import the server entry (built by vite build --ssr)
  const { render } = await import(path.join(__dirname, "dist-server", "entry-server.js"));

  // Read the client-built index.html as template
  const template = fs.readFileSync(path.join(outDir, "index.html"), "utf-8");

  const routes = ["/", "/community", "/blogs", "/projects"];

  for (const url of routes) {
    const { html: appHtml, meta } = render(url);

    let page = template.replace("<!--app-html-->", appHtml);

    // Inject route-specific meta tags
    if (meta) {
      page = page.replace(
        /<title>[^<]*<\/title>/,
        `<title>${meta.title}</title>`
      );
      page = page.replace(
        /<meta name="description" content="[^"]*" \/>/,
        `<meta name="description" content="${meta.description}" />`
      );
      page = page.replace(
        /<meta property="og:title" content="[^"]*" \/>/,
        `<meta property="og:title" content="${meta.title}" />`
      );
      page = page.replace(
        /<meta property="og:description" content="[^"]*" \/>/,
        `<meta property="og:description" content="${meta.description}" />`
      );
      page = page.replace(
        /<meta name="twitter:title" content="[^"]*" \/>/,
        `<meta name="twitter:title" content="${meta.title}" />`
      );
      page = page.replace(
        /<meta name="twitter:description" content="[^"]*" \/>/,
        `<meta name="twitter:description" content="${meta.description}" />`
      );
    }

    if (url === "/") {
      fs.writeFileSync(path.join(outDir, "index.html"), page);
      console.log(`  Pre-rendered: / -> index.html`);
    } else {
      const dir = path.join(outDir, url);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), page);
      console.log(`  Pre-rendered: ${url} -> ${url}/index.html`);
    }
  }

  // Clean up server build
  fs.rmSync(path.join(__dirname, "dist-server"), { recursive: true, force: true });

  console.log("\nPre-rendering complete!");
}

prerender().catch((err) => {
  console.error("Pre-rendering failed:", err);
  process.exit(1);
});

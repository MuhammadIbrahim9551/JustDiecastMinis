import { writeFile } from "node:fs/promises";

const sitemapUrl =
  "https://jdm-backend-fy16.onrender.com/sitemap.xml";

const response = await fetch(sitemapUrl);

if (!response.ok) {
  throw new Error(
    `Failed to fetch sitemap: ${response.status} ${response.statusText}`
  );
}

const xml = await response.text();

if (!xml.trim().startsWith("<?xml")) {
  throw new Error("Backend did not return valid sitemap XML.");
}

await writeFile("public/sitemap.xml", xml, "utf8");

console.log("Sitemap generated successfully.");

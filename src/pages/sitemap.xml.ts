import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('https://n3n.lol');
  const pages = ['/', '/writing/', '/agents-skills/', '/reading/', '/privacy/', '/terms/'].map(path => ({ path, modified: undefined as Date | undefined }));
  const posts = (await getCollection('blog')).filter(post => !post.data.draft);
  pages.push(...posts.map(post => ({ path: '/writing/' + post.slug + '/', modified: post.data.updatedDate ?? post.data.pubDate })));
  const entries = pages.map(page => '<url><loc>' + escapeXml(new URL(page.path, origin).href) + '</loc>' + (page.modified ? '<lastmod>' + page.modified.toISOString() + '</lastmod>' : '') + '</url>').join('');
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + entries + '</urlset>', { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

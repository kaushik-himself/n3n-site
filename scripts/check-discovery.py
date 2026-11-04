"""Check the built site's public discovery contract without running JavaScript."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import json
import xml.etree.ElementTree as ET

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.meta={}; self.links=[]; self.canonical=None; self.h1=0; self.refresh=False; self.schema=[]; self.json_buffer=None
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='meta':
            self.meta[a.get('name',a.get('property',''))]=a.get('content','')
            if a.get('http-equiv','').lower()=='refresh': self.refresh=True
        if tag=='link' and a.get('rel')=='canonical': self.canonical=a.get('href')
        if tag=='a': self.links.append(a.get('href',''))
        if tag=='h1': self.h1+=1
        if tag=='script' and a.get('type')=='application/ld+json': self.json_buffer=''
    def handle_data(self, data):
        if self.json_buffer is not None: self.json_buffer+=data
    def handle_endtag(self, tag):
        if tag=='script' and self.json_buffer is not None:
            self.schema.append(json.loads(self.json_buffer)); self.json_buffer=None

base='https://n3n.lol'
root=Path('dist')
urls=[node.text for node in ET.parse(root/'sitemap.xml').findall('{*}url/{*}loc')]
assert len(urls)==len(set(urls)), 'Duplicate sitemap URLs'
assert base+'/writing/' in urls
assert base+'/writing/build-with-an-ai-agent/' in urls
assert 'Sitemap: '+base+'/sitemap.xml' in (root/'robots.txt').read_text()
assert not (root/'_redirects').read_text().strip().startswith('/writing'), 'Writing still redirects'
for url in urls:
    assert url.startswith(base+'/'), url
    path=urlparse(url).path
    source=(root/path.lstrip('/')/'index.html').read_text()
    page=Page();page.feed(source)
    assert page.h1==1, (path,'Expected one H1')
    assert page.meta.get('description'), (path,'Missing description')
    assert page.canonical==url, (path,'Wrong canonical')
    assert 'noindex' not in page.meta.get('robots','').lower(), path
    assert not page.refresh, (path,'Unexpected browser redirect')
    graph=page.schema[0]['@graph']
    assert any(item['@type']=='Person' for item in graph), path
    if path.startswith('/writing/') and path!='/writing/':
        article=next(item for item in graph if item['@type']=='BlogPosting')
        assert article['headline'] and article['datePublished'] and article['author']['@id'], path
        assert page.meta.get('article:published_time'), path
    print('PASS',path)
index=Page();index.feed((root/'writing/index.html').read_text())
article_paths={urlparse(url).path for url in urls if urlparse(url).path.startswith('/writing/') and urlparse(url).path!='/writing/'}
assert article_paths.issubset(set(index.links)), 'Articles absent from writing index'
assert not (root/'writing/making-n3n/index.html').exists(), 'Old slug still generated'
print('PASS sitemap, robots, local index links, initial HTML, canonicals, and structured data')

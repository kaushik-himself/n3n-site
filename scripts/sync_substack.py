"""Keep a public metadata snapshot so Writing also works without JavaScript."""
from datetime import timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
FEED_URL = 'https://nupoorneha.substack.com/feed'
MAX_BYTES = 2 * 1024 * 1024


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def text(value):
    parser = PlainText()
    parser.feed(value or '')
    return ' '.join(' '.join(parser.parts).split())


def parse_feed(source):
    if len(source) > MAX_BYTES:
        raise ValueError('Feed exceeds size limit')
    if b'<!DOCTYPE' in source.upper() or b'<!ENTITY' in source.upper():
        raise ValueError('Feed declarations are not supported')
    items = []
    seen = set()
    for item in ET.fromstring(source).findall('./channel/item'):
        url = (item.findtext('link') or '').strip()
        parsed = urlparse(url)
        title = text(item.findtext('title'))[:300]
        if (parsed.scheme != 'https' or parsed.netloc != 'nupoorneha.substack.com'
                or not parsed.path.startswith('/p/') or not title or url in seen):
            continue
        try:
            date = parsedate_to_datetime(item.findtext('pubDate') or '')
            if date.tzinfo is None:
                continue
        except (ValueError, TypeError, OverflowError):
            continue
        seen.add(url)
        items.append(dict(title=title, url=url,
                          description=text(item.findtext('description'))[:600],
                          published=date.astimezone(timezone.utc).isoformat()))
    if not items:
        raise ValueError('Feed contains no valid posts')
    return sorted(items, key=lambda item: item['published'], reverse=True)[:100]


def main():
    destination = ROOT / 'src/generated/substack.json'
    try:
        request = Request(FEED_URL, headers={'User-Agent': 'n3n-site/1.0'})
        with urlopen(request, timeout=8) as response:
            posts = parse_feed(response.read(MAX_BYTES + 1))
        print(f'Substack: fetched {len(posts)} public posts')
    except Exception as error:
        # Prefer a previous successful local build, then the checked-in snapshot.
        fallback = destination if destination.exists() else ROOT / 'content/substack-fallback.json'
        posts = json.loads(fallback.read_text())
        print(f'Substack: using saved metadata ({type(error).__name__})')
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()

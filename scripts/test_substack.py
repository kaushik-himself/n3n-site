import unittest
from sync_substack import parse_feed


def item(url='https://nupoorneha.substack.com/p/example', date='Wed, 04 Nov 2026 06:56:01 GMT'):
    return f'<item><title>Art &amp; code</title><link>{url}</link><pubDate>{date}</pubDate><description><![CDATA[<p>A <b>new</b> post &amp; notes.</p>]]></description></item>'


class FeedTests(unittest.TestCase):
    def test_plain_metadata_deduplicated_newest_first(self):
        source = ('<rss><channel>' + item() + item() + item(
            'https://nupoorneha.substack.com/p/older', 'Sat, 31 Jan 2026 04:27:57 GMT') + '</channel></rss>').encode()
        posts = parse_feed(source)
        self.assertEqual(len(posts), 2)
        self.assertEqual(posts[0]['title'], 'Art & code')
        self.assertEqual(posts[0]['description'], 'A new post & notes.')
        self.assertEqual(posts[0]['published'], '2026-11-04T06:56:01+00:00')

    def test_untrusted_urls_and_invalid_dates_are_skipped(self):
        bad = [item('javascript:alert(1)'), item('https://example.com/p/post'),
               item('https://nupoorneha.substack.com@evil.test/p/post'),
               item(date='not a date')]
        source = ('<rss><channel>' + ''.join(bad) + item() + '</channel></rss>').encode()
        self.assertEqual(len(parse_feed(source)), 1)

    def test_invalid_empty_and_entity_feeds_fail(self):
        for source in [b'not XML', b'<rss><channel/></rss>',
                       b'<!DOCTYPE rss [<!ENTITY x "value">]><rss/>', b'x' * (2*1024*1024+1)]:
            with self.subTest(source=source[:40]), self.assertRaises(Exception):
                parse_feed(source)


if __name__ == '__main__':
    unittest.main()

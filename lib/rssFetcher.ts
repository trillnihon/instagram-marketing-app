import Parser from 'rss-parser';

const parser: any = new Parser();

const sources = [
  'https://blog.hootsuite.com/feed/',
  'https://buffer.com/resources/feed',
  'https://later.com/blog/rss'
];

export async function fetchLatestFeeds() {
  const items: any[] = [];
  for (const url of sources) {
    try {
      const feed = await parser.parseURL(url);
      items.push(
        ...feed.items.slice(0, 3).map((item: any) => ({
          source: feed.title,
          title: item.title,
          link: item.link,
          contentSnippet: item.contentSnippet,
          pubDate: item.pubDate,
        }))
      );
    } catch (e) {
      console.warn(`RSS取得失敗: ${url}`, e);
    }
  }
  return items;
} 
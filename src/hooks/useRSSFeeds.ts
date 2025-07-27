import { useState, useEffect } from 'react';
import { fetchLatestFeeds } from '../../lib/rssFetcher';
import { FeedItem } from '../components/RSSFeedPanel';

export function useRSSFeeds() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedLinks, setSavedLinks] = useState<string[]>([]);

  // 検索フィルタ済みフィード
  const filteredFeeds = feeds.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.contentSnippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 保存済みか判定
  const isSaved = (link: string) => savedLinks.includes(link);

  // 保存/解除トグル
  const toggleSave = (link: string) => {
    const updated = isSaved(link)
      ? savedLinks.filter(l => l !== link)
      : [...savedLinks, link];
    setSavedLinks(updated);
    localStorage.setItem('savedFeeds', JSON.stringify(updated));
  };

  // 保存済みフィード一覧
  const savedFeeds = feeds.filter(item => isSaved(item.link));

  // 初回取得と定期更新
  useEffect(() => {
    loadFeeds();
    const interval = setInterval(loadFeeds, 1000 * 60 * 30); // 30分ごと
    return () => clearInterval(interval);
  }, []);

  // 保存情報の復元
  useEffect(() => {
    const saved = localStorage.getItem('savedFeeds');
    if (saved) {
      setSavedLinks(JSON.parse(saved));
    }
  }, []);

  const loadFeeds = async () => {
    const latest = await fetchLatestFeeds();
    setFeeds(latest);
  };

  return {
    feeds,
    filteredFeeds,
    searchQuery,
    setSearchQuery,
    isSaved: (item: FeedItem) => isSaved(item.link),
    toggleSave: (item: FeedItem) => toggleSave(item.link),
    savedFeeds,
  };
} 
import React from "react";
import RSSFeedSaveButton from "./RSSFeedSaveButton";

export type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  contentSnippet: string;
};

type Props = {
  feeds: FeedItem[];
  isSaved: (item: FeedItem) => boolean;
  onToggleSave: (item: FeedItem) => void;
};

export const RSSFeedPanel: React.FC<Props> = ({ feeds, isSaved, onToggleSave }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📡 最新のInstagramアルゴリズム情報</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feeds.map((item) => (
          <div
            key={item.link}
            className="border rounded-xl p-4 shadow hover:shadow-lg transition bg-white dark:bg-gray-800"
          >
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 hover:underline">
                {item.title}
              </h3>
            </a>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.pubDate} — {item.source}
              </p>
              <RSSFeedSaveButton
                isSaved={isSaved(item)}
                onClick={() => onToggleSave(item)}
              />
            </div>
            <p className="text-gray-700 dark:text-gray-200 mt-2 text-sm">
              {item.contentSnippet}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}; 
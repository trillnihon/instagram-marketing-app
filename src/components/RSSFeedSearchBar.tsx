import React from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const RSSFeedSearchBar: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="キーワードで検索..."
        className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
      />
    </div>
  );
};

export default RSSFeedSearchBar; 
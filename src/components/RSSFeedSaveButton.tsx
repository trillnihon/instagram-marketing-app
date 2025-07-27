import React from 'react';

type Props = {
  isSaved: boolean;
  onClick: () => void;
};

const RSSFeedSaveButton: React.FC<Props> = ({ isSaved, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-3 py-1 rounded-full ${
        isSaved
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-green-100 text-green-600 hover:bg-green-200'
      } transition`}
    >
      {isSaved ? '保存解除' : '保存'}
    </button>
  );
};

export default RSSFeedSaveButton; 
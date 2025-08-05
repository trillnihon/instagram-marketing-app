// threadsServiceのモック
export interface ThreadsPostData {
  content: string;
  media?: Array<{
    url: string;
    type: 'image' | 'video';
    alt_text?: string;
  }>;
}

export interface ThreadsPostResponse {
  success: boolean;
  post_id?: string;
  message?: string;
  error?: string;
}

// モックされた投稿作成関数
export const createThreadsPost = jest.fn().mockImplementation(async (postData: ThreadsPostData): Promise<ThreadsPostResponse> => {
  console.log('📝 [MOCK] 投稿作成:', postData);
  
  // モックレスポンス
  return {
    success: true,
    post_id: 'mock-post-id-' + Date.now(),
    message: '投稿が正常に作成されました（モック）'
  };
});

// モックされた投稿一覧取得関数
export const getThreadsPosts = jest.fn().mockImplementation(async (limit: number = 10): Promise<any[]> => {
  console.log('📋 [MOCK] 投稿一覧取得:', { limit });
  
  // モックデータ
  return [
    {
      id: 'mock-post-1',
      content: 'これはモック投稿です #1',
      created_at: new Date().toISOString(),
      likes: 10,
      comments: 5
    },
    {
      id: 'mock-post-2',
      content: 'これはモック投稿です #2',
      created_at: new Date().toISOString(),
      likes: 15,
      comments: 8
    }
  ];
});

// モックされた投稿削除関数
export const deleteThreadsPost = jest.fn().mockImplementation(async (postId: string): Promise<boolean> => {
  console.log('🗑️ [MOCK] 投稿削除:', postId);
  return true;
});

// モックされた投稿分析関数
export const analyzeThreadsPost = jest.fn().mockImplementation(async (postId: string): Promise<any> => {
  console.log('📊 [MOCK] 投稿分析:', postId);
  
  return {
    post_id: postId,
    engagement_rate: 0.05,
    reach: 1000,
    impressions: 1500,
    likes: 50,
    comments: 10,
    shares: 5
  };
}); 
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThreadsPostCreator from '../ThreadsPostCreator';
import { createThreadsPost } from '../../services/threadsService';

// threadsServiceのモック
jest.mock('../../services/threadsService');
const mockCreateThreadsPost = createThreadsPost as jest.MockedFunction<typeof createThreadsPost>;

describe('ThreadsPostCreator', () => {
  const mockOnPostCreated = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('投稿内容を入力できる', async () => {
    const user = userEvent.setup();
    render(
      <ThreadsPostCreator
        onPostCreated={mockOnPostCreated}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText(/投稿内容/i);
    await user.type(textarea, 'テスト投稿内容');

    expect(textarea).toHaveValue('テスト投稿内容');
  });

  it('500文字以上の入力でエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    mockCreateThreadsPost.mockRejectedValue(new Error('投稿内容は500文字以内で入力してください'));
    
    render(
      <ThreadsPostCreator
        onPostCreated={mockOnPostCreated}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText(/投稿内容/i);
    const longContent = 'a'.repeat(501);
    await user.type(textarea, longContent);

    const submitButton = screen.getByRole('button', { name: /投稿する/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('投稿内容は500文字以内で入力してください');
    });
  });

  it('mediaが空でも投稿できる', async () => {
    const user = userEvent.setup();
    mockCreateThreadsPost.mockResolvedValue({
      success: true,
      post_id: 'test-post-id'
    });

    render(
      <ThreadsPostCreator
        onPostCreated={mockOnPostCreated}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText(/投稿内容/i);
    await user.type(textarea, 'テスト投稿内容');

    const submitButton = screen.getByRole('button', { name: /投稿する/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateThreadsPost).toHaveBeenCalledWith({
        content: 'テスト投稿内容',
        media: undefined
      });
    });

    expect(mockOnPostCreated).toHaveBeenCalledWith('test-post-id');
  });

  it('ローディング中は送信ボタンが無効になる', async () => {
    const user = userEvent.setup();
    // 非同期処理を遅延させる
    mockCreateThreadsPost.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        success: true,
        post_id: 'test-post-id'
      }), 100))
    );

    render(
      <ThreadsPostCreator
        onPostCreated={mockOnPostCreated}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText(/投稿内容/i);
    await user.type(textarea, 'テスト投稿内容');

    const submitButton = screen.getByRole('button', { name: /投稿する/i });
    await user.click(submitButton);

    // ローディング中はボタンが無効になる
    expect(submitButton).toBeDisabled();
  });

  it('投稿失敗時にエラーハンドラーが呼ばれる', async () => {
    const user = userEvent.setup();
    mockCreateThreadsPost.mockRejectedValue(new Error('投稿に失敗しました'));

    render(
      <ThreadsPostCreator
        onPostCreated={mockOnPostCreated}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText(/投稿内容/i);
    await user.type(textarea, 'テスト投稿内容');

    const submitButton = screen.getByRole('button', { name: /投稿する/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('投稿に失敗しました');
    });
  });

  it('空の投稿内容でボタンが無効になる', async () => {
    const user = userEvent.setup();
    render(
      <ThreadsPostCreator
        onPostCreated={mockOnPostCreated}
        onError={mockOnError}
      />
    );

    const submitButton = screen.getByRole('button', { name: /投稿する/i });
    expect(submitButton).toBeDisabled();
  });

  it('投稿成功時にフォームがリセットされる', async () => {
    const user = userEvent.setup();
    mockCreateThreadsPost.mockResolvedValue({
      success: true,
      post_id: 'test-post-id'
    });

    render(
      <ThreadsPostCreator
        onPostCreated={mockOnPostCreated}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText(/投稿内容/i);
    await user.type(textarea, 'テスト投稿内容');

    const submitButton = screen.getByRole('button', { name: /投稿する/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  it('ハッシュタグが正しく表示される', async () => {
    const user = userEvent.setup();
    render(
      <ThreadsPostCreator
        onPostCreated={mockOnPostCreated}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText(/投稿内容/i);
    await user.type(textarea, 'テスト投稿内容 #test #example');

    expect(textarea).toHaveValue('テスト投稿内容 #test #example');
  });

  it('文字数カウンターが正しく動作する', async () => {
    const user = userEvent.setup();
    render(
      <ThreadsPostCreator
        onPostCreated={mockOnPostCreated}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText(/投稿内容/i);
    await user.type(textarea, 'テスト投稿内容');

    // 文字数カウンターが表示されることを確認
    const characterCount = screen.getByText(/7\/500文字/i);
    expect(characterCount).toBeInTheDocument();
  });

  it('投稿ボタンのテキストが正しく表示される', () => {
    render(
      <ThreadsPostCreator
        onPostCreated={mockOnPostCreated}
        onError={mockOnError}
      />
    );

    const submitButton = screen.getByRole('button', { name: /投稿する/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('ラベルが正しく表示される', () => {
    render(
      <ThreadsPostCreator
        onPostCreated={mockOnPostCreated}
        onError={mockOnError}
      />
    );

    const label = screen.getByText(/投稿内容/i);
    expect(label).toBeInTheDocument();
  });
}); 
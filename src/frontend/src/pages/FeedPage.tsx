import { useGetPosts } from '../hooks/useQueries';
import PostCard from '../components/feed/PostCard';
import WeeklyPollPanel from '../components/polls/WeeklyPollPanel';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeedPage() {
  const { data: posts, isLoading, refetch, isFetching } = useGetPosts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Feed</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <WeeklyPollPanel compact />

      {posts && posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div>
          {posts?.map((post) => (
            <PostCard key={Number(post.id)} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

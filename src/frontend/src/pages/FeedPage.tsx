import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import PostCard from "../components/feed/PostCard";
import WeeklyPollPanel from "../components/polls/WeeklyPollPanel";
import { useGetPosts } from "../hooks/useQueries";

export default function FeedPage() {
  const { data: posts, isLoading, refetch, isFetching } = useGetPosts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sortedPosts = posts
    ? [...posts].sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    : [];

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
          <RefreshCw
            className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <WeeklyPollPanel compact />

      {sortedPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No posts yet. Be the first to share!
          </p>
        </div>
      ) : (
        <div>
          {sortedPosts.map((post) => (
            <PostCard key={Number(post.id)} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

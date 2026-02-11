import { useState } from 'react';
import type { Post } from '../../backend';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, MessageCircle, MoreVertical, Flag, Trash2 } from 'lucide-react';
import { formatTimestamp } from '../../utils/timeFormat';
import { useLikePost } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import CommentsThread from './CommentsThread';
import ReportPostDialog from '../reporting/ReportPostDialog';
import ReportAccountDialog from '../reporting/ReportAccountDialog';
import DeletePostDialog from './DeletePostDialog';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { identity } = useInternetIdentity();
  const [showComments, setShowComments] = useState(false);
  const [showReportPost, setShowReportPost] = useState(false);
  const [showReportAccount, setShowReportAccount] = useState(false);
  const [showDeletePost, setShowDeletePost] = useState(false);
  const likePostMutation = useLikePost();

  const isOwnPost = identity?.getPrincipal().toString() === post.authorId.toString();

  const handleLike = () => {
    likePostMutation.mutate(post.id);
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-foreground">{post.authorName}</p>
              <p className="text-sm text-muted-foreground">{formatTimestamp(post.timestamp)}</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwnPost ? (
                  <DropdownMenuItem onClick={() => setShowDeletePost(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Post
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => setShowReportPost(true)}>
                      <Flag className="mr-2 h-4 w-4" />
                      Report Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowReportAccount(true)}>
                      <Flag className="mr-2 h-4 w-4" />
                      Report Account
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Post Content */}
          <p className="text-foreground whitespace-pre-wrap">{post.content}</p>

          {/* Image */}
          {post.image && (
            <div className="rounded-lg overflow-hidden bg-muted">
              <img
                src={post.image.getDirectURL()}
                alt="Post image"
                className="w-full h-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="p-8 text-center text-muted-foreground">Image unavailable</div>';
                  }
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={handleLike}
              disabled={likePostMutation.isPending}
            >
              <Heart className="h-4 w-4" />
              <span>{Number(post.likes)}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments.length}</span>
            </Button>
          </div>

          {/* Comments Thread */}
          {showComments && <CommentsThread post={post} />}
        </CardContent>
      </Card>

      <DeletePostDialog
        open={showDeletePost}
        onOpenChange={setShowDeletePost}
        postId={post.id}
      />

      <ReportPostDialog
        open={showReportPost}
        onOpenChange={setShowReportPost}
        postId={post.id}
      />

      <ReportAccountDialog
        open={showReportAccount}
        onOpenChange={setShowReportAccount}
        reportedUser={post.authorId}
        reportedUsername={post.authorName}
      />
    </>
  );
}

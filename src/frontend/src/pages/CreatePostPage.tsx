import { useState } from 'react';
import { useCreatePost } from '../hooks/useQueries';
import { useSuspensionStatus } from '../hooks/useSuspensionStatus';
import { validateTextContent } from '../moderation/validateTextContent';
import { validateImageFile } from '../utils/imageFileValidation';
import { ExternalBlob } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Image, Loader2, X } from 'lucide-react';
import { formatSuspensionEnd } from '../utils/timeFormat';
import { toast } from 'sonner';

interface CreatePostPageProps {
  onSuccess: () => void;
}

export default function CreatePostPage({ onSuccess }: CreatePostPageProps) {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const createPostMutation = useCreatePost();
  const { isSuspended, suspensionEnd } = useSuspensionStatus();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSuspended) {
      setError(`Your account is suspended until ${formatSuspensionEnd(suspensionEnd!)}`);
      return;
    }

    const validation = validateTextContent(content);
    if (!validation.valid) {
      setError(validation.error || 'Invalid content');
      return;
    }

    try {
      let imageBlob: ExternalBlob | null = null;

      if (selectedFile) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      await createPostMutation.mutateAsync({ content, image: imageBlob });
      toast.success('Post created successfully!');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    }
  };

  if (isSuspended) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Create Post</h2>
        <Alert variant="destructive">
          <AlertDescription>
            Your account is suspended until {formatSuspensionEnd(suspensionEnd!)}. You cannot create posts during this time.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Create Post</h2>

      <Card>
        <CardHeader>
          <CardTitle>Share with the Hive</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">What's on your mind?</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share something with your fellow students..."
                rows={6}
                className="resize-none"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Add an image (optional)</Label>
              {!imagePreview ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                  >
                    <Image className="mr-2 h-4 w-4" />
                    Choose Image
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full rounded-lg max-h-64 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="absolute bottom-2 left-2 right-2 bg-background/80 rounded-full h-2">
                      <div
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={createPostMutation.isPending || !content.trim()}
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post to Hive'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

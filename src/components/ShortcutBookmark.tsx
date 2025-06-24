
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bookmark } from 'lucide-react';

interface ShortcutBookmarkProps {
  title?: string;
  description?: string;
  downloadLink?: string;
  shareLink?: string;
}

const ShortcutBookmark = ({ title = '', description = '', downloadLink = '', shareLink = '' }: ShortcutBookmarkProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title,
    description,
    downloadLink,
    shareLink,
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark shortcuts",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for this shortcut",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('bookmarked_shortcuts')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          download_link: formData.downloadLink,
          share_link: formData.shareLink,
          category: formData.category
        });

      if (error) throw error;

      toast({
        title: "Shortcut Bookmarked!",
        description: "Your shortcut has been saved successfully"
      });

      setOpen(false);
      setFormData({ title: '', description: '', downloadLink: '', shareLink: '', category: '' });
    } catch (error) {
      console.error('Error saving shortcut:', error);
      toast({
        title: "Error",
        description: "Failed to bookmark shortcut",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10">
          <Bookmark className="h-4 w-4 mr-2" />
          Bookmark
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Bookmark Shortcut</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-300">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Shortcut name"
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="What does this shortcut do?"
            />
          </div>
          
          <div>
            <Label htmlFor="downloadLink" className="text-gray-300">Download Link</Label>
            <Input
              id="downloadLink"
              value={formData.downloadLink}
              onChange={(e) => setFormData({ ...formData, downloadLink: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="https://..."
            />
          </div>
          
          <div>
            <Label htmlFor="shareLink" className="text-gray-300">Share Link</Label>
            <Input
              id="shareLink"
              value={formData.shareLink}
              onChange={(e) => setFormData({ ...formData, shareLink: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="https://..."
            />
          </div>
          
          <div>
            <Label htmlFor="category" className="text-gray-300">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="e.g., Productivity, AI, Utilities"
            />
          </div>
          
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black"
          >
            {loading ? 'Saving...' : 'Save Bookmark'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShortcutBookmark;


import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThiingsIcon from '@/components/ThiingsIcon';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

interface BookmarkedShortcut {
  id: string;
  title: string;
  description: string | null;
  download_link: string | null;
  share_link: string | null;
  category: string | null;
  created_at: string;
}

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkedShortcut[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    loadBookmarks();
  }, [user, navigate]);

  const loadBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookmarked_shortcuts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookmarked_shortcuts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <ThiingsIcon name="datacenter" size={48} className="animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title="Bookmarked Shortcuts" />
      
      <main className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-mono text-cyan-400 mb-8 flex items-center justify-center">
            <ThiingsIcon name="foldablePhone" size={32} className="mr-3" />
            Your Bookmarked Shortcuts
          </h1>
          <p className="text-lg text-gray-400">
            Your personal collection of automation tools and digital magic.
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <ThiingsIcon name="wifi" size={64} className="mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-mono text-gray-500 mb-4">No bookmarks yet</h2>
            <p className="text-gray-400 mb-8">Start exploring shortcuts and bookmark your favorites!</p>
            <Button
              onClick={() => navigate('/shortcuts')}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-mono"
            >
              Browse Shortcuts
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-cyan-400 font-mono text-lg">
                      {bookmark.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBookmark(bookmark.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {bookmark.category && (
                    <CardDescription className="text-orange-500 font-mono">
                      {bookmark.category}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {bookmark.description && (
                    <p className="text-gray-300 text-sm">{bookmark.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    {bookmark.download_link && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full text-cyan-400 border-cyan-400 hover:bg-cyan-400/10"
                      >
                        <a href={bookmark.download_link} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    )}
                    
                    {bookmark.share_link && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full text-orange-400 border-orange-400 hover:bg-orange-400/10"
                      >
                        <a href={bookmark.share_link} target="_blank" rel="noopener noreferrer">
                          Share Link
                        </a>
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Saved: {new Date(bookmark.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Bookmarks;

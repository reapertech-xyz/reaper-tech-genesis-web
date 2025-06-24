
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThiingsIcon from '@/components/ThiingsIcon';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, username);
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        if (isLogin) {
          navigate('/');
        } else {
          toast({
            title: "Success",
            description: "Check your email to verify your account!"
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title="Authentication" />
      
      <main className="px-6 py-16 max-w-md mx-auto">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-cyan-400 font-mono text-2xl flex items-center justify-center">
              <ThiingsIcon name="reaperHood" size={32} className="mr-3" />
              {isLogin ? 'Welcome Back' : 'Join the Collective'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isLogin ? 'Sign in to access your saved data' : 'Create an account to save your cart and shortcuts'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Your username"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Your password"
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-mono"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => setIsLogin(!isLogin)}
                className="text-gray-400 hover:text-cyan-400"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;

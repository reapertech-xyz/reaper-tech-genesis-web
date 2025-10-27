
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThiingsIcon from '@/components/ThiingsIcon';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { loginWithUnstoppableDomains } from '@/lib/unstoppable-domains';
import { supabase } from '@/integrations/supabase/client';

// Validation schemas
const emailSchema = z.string()
  .trim()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters');

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be less than 72 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const usernameSchema = z.string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores');

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDomainLogin, setIsDomainLogin] = useState(false);
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
      // Validate email
      const emailValidation = emailSchema.safeParse(email);
      if (!emailValidation.success) {
        toast({
          title: "Validation Error",
          description: emailValidation.error.errors[0].message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Validate password
      const passwordValidation = passwordSchema.safeParse(password);
      if (!passwordValidation.success) {
        toast({
          title: "Validation Error",
          description: passwordValidation.error.errors[0].message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Validate username for signup
      if (!isLogin) {
        const usernameValidation = usernameSchema.safeParse(username);
        if (!usernameValidation.success) {
          toast({
            title: "Validation Error",
            description: usernameValidation.error.errors[0].message,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }

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
      // Production-safe error handling without logging sensitive details
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDomainLogin = async () => {
    setIsDomainLogin(true);
    try {
      const { domain, wallet } = await loginWithUnstoppableDomains();
      
      // Check if profile exists with this domain
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .contains('linked_domains', [domain])
        .maybeSingle();

      if (existingProfile) {
        // User exists, need to authenticate
        toast({
          title: 'Domain recognized',
          description: 'Please sign in with your email to link this domain',
        });
      } else {
        // New domain, create wallet profile
        const { data } = await supabase.rpc('get_or_create_wallet_profile', {
          _wallet_address: wallet
        });

        if (data) {
          await supabase.rpc('add_domain_to_profile', {
            _user_id: data,
            _domain: domain
          });

          toast({
            title: 'Welcome!',
            description: 'Profile created with your domain',
          });
          navigate('/');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to login with domain',
        variant: 'destructive',
      });
    } finally {
      setIsDomainLogin(false);
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
              onClick={handleDomainLogin}
              disabled={isDomainLogin}
            >
              {isDomainLogin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Unstoppable Domains'
              )}
            </Button>
            
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

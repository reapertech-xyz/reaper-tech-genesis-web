import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Persona: any;
  }
}

interface PersonaVerificationFlowProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const PersonaVerificationFlow = ({ 
  onComplete, 
  onCancel 
}: PersonaVerificationFlowProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personaLoaded, setPersonaLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load Persona SDK script
    const script = document.createElement('script');
    script.src = 'https://cdn.withpersona.com/dist/persona-v4.9.0.js';
    script.async = true;
    script.onload = () => setPersonaLoaded(true);
    script.onerror = () => {
      setError('Failed to load verification service');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const startVerification = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create inquiry via edge function
      const { data, error: inquiryError } = await supabase.functions.invoke(
        'persona-verification',
        {
          body: { action: 'create-inquiry' },
        }
      );

      if (inquiryError) throw inquiryError;

      const { session_token, inquiry_id } = data;

      // Initialize Persona client
      const client = new window.Persona.Client({
        inquiryId: inquiry_id,
        sessionToken: session_token,
        environment: 'sandbox', // Change to 'production' when ready
        onReady: () => {
          console.log('Persona verification flow ready');
          client.open();
        },
        onComplete: () => {
          console.log('Verification completed');
          toast({
            title: "Verification Submitted",
            description: "Your identity verification has been submitted. We'll notify you once it's reviewed.",
          });
          onComplete?.();
        },
        onCancel: () => {
          console.log('Verification cancelled');
          setLoading(false);
          onCancel?.();
        },
        onError: (error: Error) => {
          console.error('Persona error:', error);
          setError(error.message || 'Verification failed');
          setLoading(false);
        },
      });
    } catch (err) {
      console.error('Error starting verification:', err);
      setError(err instanceof Error ? err.message : 'Failed to start verification');
      toast({
        title: "Verification Error",
        description: "Unable to start verification. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Identity Verification
        </CardTitle>
        <CardDescription>
          Complete the verification process to unlock higher transaction limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 text-sm">
          <p className="font-medium">What you'll need:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Government-issued photo ID (passport, driver's license, or national ID)</li>
            <li>A device with a camera (for selfie verification)</li>
            <li>About 5 minutes to complete the process</li>
          </ul>
        </div>

        <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
          <p className="font-medium">Privacy & Security</p>
          <p className="text-muted-foreground">
            Your personal information is encrypted and securely processed by Persona, 
            our trusted identity verification partner. We only receive verification status 
            and never store your ID documents.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={startVerification}
            disabled={loading || !personaLoaded}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              'Start Verification'
            )}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
        </div>

        {!personaLoaded && !error && (
          <p className="text-xs text-muted-foreground text-center">
            Loading verification service...
          </p>
        )}
      </CardContent>
    </Card>
  );
};

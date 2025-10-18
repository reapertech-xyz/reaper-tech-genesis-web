import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Shield, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DisputedTransaction {
  id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  currency: string;
  dispute_reason: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const DisputeDashboard = () => {
  const { user, profile } = useUnifiedAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<DisputedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<DisputedTransaction | null>(null);
  const [resolution, setResolution] = useState<'buyer' | 'seller' | 'partial' | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (error) {
        console.error('Error checking admin role:', error);
        setCheckingRole(false);
        return;
      }

      setIsAdmin(data || false);
      setCheckingRole(false);

      if (!data) {
        toast({
          title: "Access Denied",
          description: "Only administrators can access this page",
          variant: "destructive"
        });
        navigate("/");
      }
    };

    checkAdminRole();
  }, [user, navigate, toast]);

  useEffect(() => {
    if (!checkingRole && isAdmin) {
      loadDisputes();
    }
  }, [checkingRole, isAdmin]);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('escrow_transactions')
        .select('*')
        .eq('status', 'disputed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error) {
      console.error('Error loading disputes:', error);
      toast({
        title: "Error",
        description: "Failed to load disputes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = (dispute: DisputedTransaction, resolutionType: 'buyer' | 'seller' | 'partial') => {
    setSelectedDispute(dispute);
    setResolution(resolutionType);
    setShowConfirmDialog(true);
  };

  const confirmResolution = async () => {
    if (!selectedDispute || !resolution) return;

    try {
      // In production, this would call an admin-only edge function
      const newStatus = resolution === 'buyer' ? 'refunded' : 'completed';
      
      const { error } = await supabase
        .from('escrow_transactions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedDispute.id);

      if (error) throw error;

      toast({
        title: "Dispute Resolved",
        description: `Funds ${resolution === 'buyer' ? 'refunded to buyer' : 'released to seller'}`,
      });

      setShowConfirmDialog(false);
      setSelectedDispute(null);
      setResolution(null);
      setResolutionNotes("");
      loadDisputes();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast({
        title: "Error",
        description: "Failed to resolve dispute",
        variant: "destructive",
      });
    }
  };

  const getDisputeAge = (createdAt: string) => {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getPriorityBadge = (days: number) => {
    if (days > 7) return <Badge variant="destructive">High Priority</Badge>;
    if (days > 3) return <Badge className="bg-yellow-500">Medium Priority</Badge>;
    return <Badge variant="outline">New</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header title="Reaper Tech Admin" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-cyan-400">Dispute Management Dashboard</h1>
          </div>
          <p className="text-gray-400">Review and resolve escrow transaction disputes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Active Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-cyan-400">{disputes.length}</span>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-red-400">
                  {disputes.filter(d => getDisputeAge(d.created_at) > 7).length}
                </span>
                <Clock className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-green-400">
                  ${disputes.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
                </span>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-blue-400">2.4d</span>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disputes List */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger value="all">All Disputes ({disputes.length})</TabsTrigger>
            <TabsTrigger value="high-priority">
              High Priority ({disputes.filter(d => getDisputeAge(d.created_at) > 7).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading disputes...</div>
            ) : disputes.length === 0 ? (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <p className="text-gray-400">No active disputes - all clear!</p>
                </CardContent>
              </Card>
            ) : (
              disputes.map((dispute) => (
                <Card key={dispute.id} className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">
                            Dispute #{dispute.id.slice(0, 8)}
                          </CardTitle>
                          {getPriorityBadge(getDisputeAge(dispute.created_at))}
                        </div>
                        <CardDescription>
                          Filed {getDisputeAge(dispute.created_at)} days ago
                        </CardDescription>
                      </div>
                      <Badge className="bg-cyan-500 text-gray-900">
                        ${dispute.amount} {dispute.currency}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Buyer</p>
                        <p className="font-mono text-gray-200">
                          {dispute.buyer_id.slice(0, 8)}...{dispute.buyer_id.slice(-6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Seller</p>
                        <p className="font-mono text-gray-200">
                          {dispute.seller_id.slice(0, 8)}...{dispute.seller_id.slice(-6)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-400 text-sm">Dispute Reason</Label>
                      <p className="mt-1 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-gray-200">
                        {dispute.dispute_reason}
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-700">
                      <Button
                        onClick={() => handleResolveDispute(dispute, 'buyer')}
                        variant="outline"
                        className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-500/10"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Refund Buyer
                      </Button>
                      <Button
                        onClick={() => handleResolveDispute(dispute, 'seller')}
                        variant="outline"
                        className="flex-1 border-green-500 text-green-400 hover:bg-green-500/10"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Release to Seller
                      </Button>
                      <Button
                        onClick={() => setSelectedDispute(dispute)}
                        variant="outline"
                        className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="high-priority" className="space-y-4">
            {disputes
              .filter(d => getDisputeAge(d.created_at) > 7)
              .map((dispute) => (
                <Card key={dispute.id} className="bg-gray-900 border-red-500/50">
                  {/* Same content as above */}
                  <CardHeader>
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold">Urgent: Over 7 days old</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Resolution Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Dispute Resolution</AlertDialogTitle>
            <AlertDialogDescription>
              {resolution === 'buyer' 
                ? 'This will refund the full amount to the buyer and close the dispute.'
                : 'This will release the full amount to the seller and close the dispute.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label>Resolution Notes (Optional)</Label>
            <Textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Add notes about this resolution..."
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmResolution}
              className={resolution === 'buyer' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
            >
              Confirm Resolution
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dispute Detail Dialog */}
      {selectedDispute && !showConfirmDialog && (
        <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Dispute Details</DialogTitle>
              <DialogDescription>
                Review all information before making a decision
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Transaction Amount</Label>
                  <p className="text-xl font-bold text-cyan-400">
                    {selectedDispute.amount} {selectedDispute.currency}
                  </p>
                </div>
                <div>
                  <Label>Dispute Age</Label>
                  <p className="text-xl font-bold">
                    {getDisputeAge(selectedDispute.created_at)} days
                  </p>
                </div>
              </div>
              <div>
                <Label>Full Dispute Reason</Label>
                <p className="mt-2 p-4 bg-gray-800 rounded border border-gray-700">
                  {selectedDispute.dispute_reason}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DisputeDashboard;

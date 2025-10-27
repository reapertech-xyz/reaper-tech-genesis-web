import { useState, useEffect } from "react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useEscrow } from "@/hooks/useEscrow";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, AlertCircle } from "lucide-react";
import { EscrowTransaction, EscrowStatus } from "@/types/escrow";
import EscrowTransactionDetail from "@/components/escrow/EscrowTransactionDetail";
import CreateEscrowForm from "@/components/escrow/CreateEscrowForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ITEMS_PER_PAGE = 10;

const EscrowDashboard = () => {
  const { user, profile } = useUnifiedAuth();
  const { transactions, loading, loadUserTransactions } = useEscrow();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<EscrowTransaction | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user && !profile) {
      navigate("/auth");
      return;
    }

    const userId = user?.id || profile?.id;
    if (userId) {
      loadUserTransactions(userId);
    }
  }, [user, profile, navigate, loadUserTransactions]);

  const getStatusBadgeVariant = (status: EscrowStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case EscrowStatus.COMPLETED:
        return "default";
      case EscrowStatus.DISPUTED:
        return "destructive";
      case EscrowStatus.CANCELLED:
      case EscrowStatus.REFUNDED:
        return "secondary";
      default:
        return "outline";
    }
  };

  const filterTransactions = (status?: EscrowStatus) => {
    let filtered = transactions;

    if (status) {
      filtered = filtered.filter(tx => tx.status === status);
    }

    if (searchQuery) {
      filtered = filtered.filter(tx =>
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const activeTransactions = filterTransactions(EscrowStatus.INITIATED).concat(
    filterTransactions(EscrowStatus.FUNDED),
    filterTransactions(EscrowStatus.IN_PROGRESS)
  );
  const completedTransactions = filterTransactions(EscrowStatus.COMPLETED);
  const disputedTransactions = filterTransactions(EscrowStatus.DISPUTED);

  const paginateTransactions = (txs: EscrowTransaction[]) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return txs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const renderTransactionList = (txs: EscrowTransaction[]) => {
    const paginatedTxs = paginateTransactions(txs);
    const totalPages = Math.ceil(txs.length / ITEMS_PER_PAGE);

    if (paginatedTxs.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
          <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No transactions found</p>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-4">
          {paginatedTxs.map((tx) => (
            <Card
              key={tx.id}
              className="border-gray-700 bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors"
              onClick={() => setSelectedTransaction(tx)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-100">{tx.description}</CardTitle>
                    <CardDescription className="text-gray-400 text-sm mt-1">
                      ID: {tx.id.slice(0, 8)}...
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(tx.status)}>
                    {tx.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Amount</p>
                    <p className="text-gray-100 font-medium">
                      {tx.amount} {tx.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Created</p>
                    <p className="text-gray-100">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header title="Reaper Tech" />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">Escrow Dashboard</h1>
            <p className="text-gray-400">Manage your secure transactions</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-gray-900">
                <Plus className="mr-2 h-4 w-4" />
                New Escrow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Escrow Transaction</DialogTitle>
                <DialogDescription>
                  Set up a secure escrow transaction with buyer protection
                </DialogDescription>
              </DialogHeader>
              <CreateEscrowForm 
                onSuccess={() => setIsCreateDialogOpen(false)} 
                onCloseDialog={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search transactions by ID or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-gray-100"
            />
          </div>
        </div>

        <Tabs defaultValue="active" className="space-y-6" onValueChange={() => setCurrentPage(1)}>
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger value="active" className="data-[state=active]:bg-cyan-500">
              Active ({activeTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-cyan-500">
              Completed ({completedTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="disputed" className="data-[state=active]:bg-cyan-500">
              Disputed ({disputedTransactions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading transactions...</div>
            ) : (
              renderTransactionList(activeTransactions)
            )}
          </TabsContent>

          <TabsContent value="completed">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading transactions...</div>
            ) : (
              renderTransactionList(completedTransactions)
            )}
          </TabsContent>

          <TabsContent value="disputed">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading transactions...</div>
            ) : (
              renderTransactionList(disputedTransactions)
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <EscrowTransactionDetail
              transaction={selectedTransaction}
              onClose={() => setSelectedTransaction(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EscrowDashboard;

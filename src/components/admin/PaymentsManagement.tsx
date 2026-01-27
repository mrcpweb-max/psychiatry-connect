import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAllPayments, useProcessRefund, useUpdatePaymentStatus, type Payment } from "@/hooks/usePayments";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, Eye, RefreshCw, Loader2 } from "lucide-react";

export function PaymentsManagement() {
  const { toast } = useToast();
  const { data: payments, isLoading, refetch } = useAllPayments();
  const processRefund = useProcessRefund();
  const updateStatus = useUpdatePaymentStatus();

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundPercentage, setRefundPercentage] = useState<"50" | "100">("100");
  const [refundReason, setRefundReason] = useState("");

  const openViewDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setViewDialogOpen(true);
  };

  const openRefundDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundPercentage("100");
    setRefundReason("");
    setRefundDialogOpen(true);
  };

  const handleRefund = async () => {
    if (!selectedPayment) return;
    try {
      await processRefund.mutateAsync({
        paymentId: selectedPayment.id,
        refundPercentage: parseInt(refundPercentage) as 50 | 100,
        reason: refundReason,
      });
      toast({ title: "Refund processed", description: `${refundPercentage}% refund issued successfully.` });
      setRefundDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleStatusUpdate = async (paymentId: string, status: Payment["status"]) => {
    try {
      await updateStatus.mutateAsync({ paymentId, status });
      toast({ title: "Status updated" });
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "refunded":
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Refunded</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalRevenue = payments?.filter(p => p.status === "completed").reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const totalRefunds = payments?.filter(p => p.status === "refunded").reduce((sum, p) => sum + Number(p.refund_amount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Payments</p>
            <p className="text-2xl font-bold">{payments?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">£{totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Refunds</p>
            <p className="text-2xl font-bold text-orange-600">£{totalRefunds.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              All Payments
            </CardTitle>
            <CardDescription>View and manage all payment records</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : payments?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Refund</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(new Date(payment.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.candidate?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{payment.candidate?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {payment.session_mode === "one_on_one" ? "1:1" : "Group"} {payment.session_type}
                      </p>
                      <p className="text-xs text-muted-foreground">{payment.stations} stations</p>
                    </TableCell>
                    <TableCell className="font-medium">£{Number(payment.amount).toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.refund_amount ? (
                        <span className="text-orange-600">£{Number(payment.refund_amount).toFixed(2)}</span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openViewDialog(payment)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payment.status === "completed" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openRefundDialog(payment)}
                          >
                            Refund
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No payments yet</p>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Payment ID</Label>
                  <p className="font-mono text-sm break-all">{selectedPayment.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p>{format(new Date(selectedPayment.created_at), "MMM d, yyyy h:mm a")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Candidate</Label>
                  <p className="font-medium">{selectedPayment.candidate?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPayment.candidate?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="text-lg font-bold">£{Number(selectedPayment.amount).toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Session Type</Label>
                  <p>{selectedPayment.session_mode === "one_on_one" ? "1:1" : "Group"} {selectedPayment.session_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stations</Label>
                  <p>{selectedPayment.stations}</p>
                </div>
                {selectedPayment.group_size && (
                  <div>
                    <Label className="text-muted-foreground">Group Size</Label>
                    <p>{selectedPayment.group_size}</p>
                  </div>
                )}
              </div>
              
              {selectedPayment.refund_amount && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Refund Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Refund Amount</Label>
                      <p className="text-orange-600 font-bold">£{Number(selectedPayment.refund_amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Refunded At</Label>
                      <p>{selectedPayment.refunded_at ? format(new Date(selectedPayment.refunded_at), "MMM d, yyyy") : "—"}</p>
                    </div>
                    {selectedPayment.refund_reason && (
                      <div className="col-span-2">
                        <Label className="text-muted-foreground">Reason</Label>
                        <p>{selectedPayment.refund_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedPayment.status !== "refunded" && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">Update Status</Label>
                  <Select
                    value={selectedPayment.status}
                    onValueChange={(value) => handleStatusUpdate(selectedPayment.id, value as Payment["status"])}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Original Amount</Label>
                <p className="text-lg font-bold">£{Number(selectedPayment.amount).toFixed(2)}</p>
              </div>
              <div>
                <Label>Refund Percentage</Label>
                <Select value={refundPercentage} onValueChange={(v) => setRefundPercentage(v as "50" | "100")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100% - Full Refund (£{Number(selectedPayment.amount).toFixed(2)})</SelectItem>
                    <SelectItem value="50">50% - Partial Refund (£{(Number(selectedPayment.amount) / 2).toFixed(2)})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Refund Reason</Label>
                <Textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter reason for refund..."
                />
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>Refund Amount:</strong> £{(Number(selectedPayment.amount) * parseInt(refundPercentage) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleRefund} 
              disabled={!refundReason || processRefund.isPending}
              variant="destructive"
            >
              {processRefund.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Process Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { AlertTriangle, Check, CreditCard, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface TransactionDetailsDialogProps {
  transaction: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDetailsDialog({ transaction, open, onOpenChange }: TransactionDetailsDialogProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'completed'
      case 'approved':
        return 'completed'
      case 'rejected':
        return 'pending'
      case 'pending':
        return 'flagged'
      default:
        return ''
    }
  }

  const getActionIcon = (type: string, status: string) => {
    if (type === 'alert') {
      if (status === 'approved') {
        return <Check className="h-4 w-4" />
      } else if (status === 'rejected') {
        return <X className="h-4 w-4" />
      } else {
        return <AlertTriangle className="h-4 w-4" />
      }
    } else {
      return <CreditCard className="h-4 w-4" />
    }
  }

  const getActionColor = (type: string, status: string) => {
    if (type === 'alert') {
      if (status === 'approved') {
        return 'bg-green-100 text-green-700'
      } else if (status === 'rejected') {
        return 'bg-red-100 text-red-700'
      } else {
        return 'bg-yellow-100 text-yellow-700'
      }
    } else {
      return 'bg-blue-100 text-blue-700'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`rounded-full p-2 ${getActionColor(transaction.type, transaction.status)}`}>
              {getActionIcon(transaction.type, transaction.status)}
            </div>
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this transaction
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Transaction Name</h4>
              <p className="mt-1">{transaction.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Amount</h4>
              <p className="mt-1">${transaction.amount.toFixed(2)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
              <p className="mt-1">{new Date(transaction.date).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Time</h4>
              <p className="mt-1">{new Date(transaction.date).toLocaleTimeString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Account</h4>
              <p className="mt-1">{transaction.account}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
              <Badge className={`mt-1 ${getStatusBadge(transaction.status)}`}>
                {transaction.status}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
              <p className="mt-1 capitalize">{transaction.type}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
              <p className="mt-1">{transaction.category}</p>
            </div>
          </div>
          {transaction.type === 'alert' && transaction.violatedRule && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Violated Rule</h4>
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-sm">{transaction.violatedRule.description}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 
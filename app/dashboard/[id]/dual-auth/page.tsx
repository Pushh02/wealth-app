"use client"

import { useState } from "react"
import { Check, MoreHorizontal, Pencil, Plus, Shield, Trash, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation";
import { Rules } from "@prisma/client"
import { EditRuleDialog } from "@/components/edit-rule-dialog"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Rule = Rules & {
  account: {
    approvers: {
      id: string
      name: string
      email: string
    }[]
  }
  severity: "low" | "medium" | "high"
}

interface RuleFormData {
  name: string
  description: string
  threshold: number
  isActive: boolean
}

interface ApproverFormData {
  name: string
  email: string
}

export default function DualAuthPage() {
  const [showAddRule, setShowAddRule] = useState(false)
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null)
  const [isAddApproverOpen, setIsAddApproverOpen] = useState(false)
  const [approverFormData, setApproverFormData] = useState<ApproverFormData>({
    name: "",
    email: "",
  })
  const [formData, setFormData] = useState<RuleFormData>({
    name: "",
    description: "",
    threshold: 0,
    isActive: true
  })
  const params = useParams();
  const accountId = params.id as string;
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const rules = useQuery({
    queryKey: ["rules"],
    queryFn: () => axios.get(`/api/accounts/rules?accountId=${accountId}`).then((res) => res.data),
  })

  const approvers = useQuery({
    queryKey: ["approvers"],
    queryFn: () => axios.get(`/api/accounts/approver?accountId=${accountId}`).then((res) => res.data),
  })

  const createRuleMutation = useMutation({
    mutationFn: async (data: RuleFormData) => {
      const response = await axios.post(`/api/accounts/rules?accountId=${accountId}`, {
        ...data,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] })
      toast({
        title: "Rule created",
        description: "The dual authorization rule has been created successfully.",
      })
      setShowAddRule(false)
      setFormData({
        name: "",
        description: "",
        threshold: 0,
        isActive: true
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create the rule. Please try again.",
        variant: "destructive",
      })
    }
  })

  const updateRuleMutation = useMutation({
    mutationFn: async (data: { id: string, isActive: boolean }) => {
      const response = await axios.put(`/api/accounts/rules/make-active?ruleId=${data.id}&accountId=${accountId}`, { isActive: data.isActive })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update the rule. Please try again.",
        variant: "destructive",
      })
    }
  })

  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const response = await axios.delete(`/api/accounts/rules?ruleId=${ruleId}&accountId=${accountId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] })
      toast({
        title: "Rule deleted",
        description: "The dual authorization rule has been deleted successfully.",
      })
      setRuleToDelete(null)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the rule. Please try again.",
        variant: "destructive",
      })
    }
  })

  const addApproverMutation = useMutation({
    mutationFn: async (data: ApproverFormData) => {
      const response = await axios.post(`/api/accounts/approver?accountId=${accountId}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvers"] })
      toast({
        title: "Approver added",
        description: "The approver has been added successfully.",
      })
      setIsAddApproverOpen(false)
      setApproverFormData({
        name: "",
        email: "",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add the approver. Please try again.",
        variant: "destructive",
      })
    }
  })

  const removeApproverMutation = useMutation({
    mutationFn: async (approverId: string) => {
      const response = await axios.delete(`/api/accounts/approver?accountId=${accountId}&approverId=${approverId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvers"] })
      toast({
        title: "Approver removed",
        description: "The approver has been removed successfully.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove the approver. Please try again.",
        variant: "destructive",
      })
    }
  })

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createRuleMutation.mutate(formData)
  }

  const handleEditRule = (rule: Rule) => {
    setSelectedRule(rule)
    setIsRuleDialogOpen(true)
  }

  const handleToggleRule = (ruleId: string, isActive: boolean) => {
    updateRuleMutation.mutate({ id: ruleId, isActive })
  }

  const handleDeleteRule = (rule: Rule) => {
    setRuleToDelete(rule)
  }

  const confirmDelete = () => {
    if (ruleToDelete) {
      deleteRuleMutation.mutate(ruleToDelete.id)
    }
  }

  const handleApproverFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setApproverFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleApproverSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addApproverMutation.mutate(approverFormData)
  }

  const handleRemoveApprover = (approverId: string) => {
    removeApproverMutation.mutate(approverId)
  }

  if (rules.isLoading) {
    return (
      <div className="flex flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-6 sticky top-0 z-10">
          <div className="flex-1">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </header>
        <div className="flex-1 space-y-6 p-6">
          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="grid gap-4">
            {[1,2,3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-6 sticky top-0 z-10">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Dual Authorization</h1>
        </div>
      </header>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight gradient-text">Dual Authorization Settings</h2>
            <p className="text-muted-foreground mt-1">
              Configure rules for transactions that require additional approval
            </p>
          </div>
          <Button onClick={() => setShowAddRule(!showAddRule)} className="gradient-bg text-white shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Add New Rule
          </Button>
        </div>

        {showAddRule && (
          <Card className="overflow-hidden border-0 shadow-lg mb-8">
            <CardHeader className="border-b bg-muted/30 px-6">
              <CardTitle>Create New Rule</CardTitle>
              <CardDescription>Define when transactions require dual authorization</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Rule Name</Label>
                    <Input 
                      id="name" 
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g., High-Value Transfers" 
                      className="h-10" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Amount Threshold ($)</Label>
                    <Input 
                      id="threshold" 
                      name="threshold"
                      type="number"
                      value={formData.threshold}
                      onChange={handleFormChange}
                      placeholder="1000" 
                      className="h-10" 
                      required
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Rule Description</Label>
                    <Input 
                      id="description" 
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="describe the rule" 
                      className="h-10" 
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-muted/30 p-4 rounded-xl">
                  <Switch 
                    id="isActive" 
                    name="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive" className="font-medium">
                    Rule Active
                  </Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-muted/30 px-6 py-4">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => {
                    setShowAddRule(false)
                    setFormData({
                      name: "",
                      description: "",
                      threshold: 0,
                      isActive: true
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="gradient-bg text-white shadow-sm"
                  disabled={createRuleMutation.isPending}
                >
                  {createRuleMutation.isPending ? (
                    "Creating..."
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" /> Create Rule
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        <Card className="overflow-hidden border-0 shadow-lg mb-8">
          <CardHeader className="border-b bg-muted/30 px-6">
            <CardTitle>Current Rules</CardTitle>
            <CardDescription>Manage your existing dual authorization rules</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Transaction Types</TableHead>
                  <TableHead>Approvers</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.data?.map((rule: Rule) => (
                  <TableRow key={rule.id} className="transaction-row">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{rule.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${rule.threshold.toLocaleString()}</TableCell>
                    <TableCell>{rule.transactionType}</TableCell>
                    <TableCell>{rule.account.approvers.map((approver: { name: string }) => approver.name).join(", ") || "No approvers"}</TableCell>
                    <TableCell className="flex items-center justify-center gap-3">
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Switch 
                        id="isActive" 
                        name="isActive"
                        checked={rule.isActive}
                        onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditRule(rule)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteRule(rule)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30 px-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Approvers</CardTitle>
              <CardDescription>Manage users who can approve transactions</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 rounded-full"
              onClick={() => setIsAddApproverOpen(true)}
            >
              <Users className="mr-2 h-4 w-4" /> Add Approver
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvers.data?.map((approver: { id: string, name: string, email: string, role: string }) => (
                  <TableRow key={approver.id} className="transaction-row">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{approver.name.charAt(0)}</span>
                        </div>
                        <div className="font-medium">{approver.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{approver.email}</TableCell>
                    <TableCell>Approver</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        className="h-8 rounded-full bg-red-600 hover:bg-red-700"
                        onClick={() => handleRemoveApprover(approver.id)}
                        disabled={removeApproverMutation.isPending}
                      >
                        {removeApproverMutation.isPending ? "Removing..." : "Remove"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isAddApproverOpen} onOpenChange={setIsAddApproverOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Approver</DialogTitle>
              <DialogDescription>
                Add a new user who can approve transactions requiring dual authorization.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleApproverSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={approverFormData.name}
                    onChange={handleApproverFormChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={approverFormData.email}
                    onChange={handleApproverFormChange}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit"
                  disabled={addApproverMutation.isPending}
                >
                  {addApproverMutation.isPending ? "Adding..." : "Add Approver"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {selectedRule && (
          <EditRuleDialog 
            open={isRuleDialogOpen}
            onOpenChange={setIsRuleDialogOpen}
            rule={{
              id: selectedRule.id,
              name: selectedRule.name,
              description: selectedRule.description || "",
              threshold: selectedRule.threshold
            }}
          />
        )}

        <AlertDialog open={!!ruleToDelete} onOpenChange={() => setRuleToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the rule "{ruleToDelete?.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteRuleMutation.isPending}
              >
                {deleteRuleMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}


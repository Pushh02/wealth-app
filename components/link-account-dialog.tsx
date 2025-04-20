"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface LinkAccountDialogProps {
  trigger?: React.ReactNode
}

interface Approver {
  id: string
  email: string
}

interface CreateAccountInput {
  name: string
  institution: string
  approverEmails: string[]
}

export function LinkAccountDialog({ trigger }: LinkAccountDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    institution: "",
    approverEmail: "",
  })
  const [approvers, setApprovers] = useState<Approver[]>([])

  const createAccountMutation = useMutation({
    mutationFn: async (data: CreateAccountInput) => {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create account")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createAccountMutation.mutateAsync({
        name: formData.name,
        institution: formData.institution,
        approverEmails: approvers.map(a => a.email)
      })
      
      toast({
        title: "Account created successfully",
        description: "Your account has been linked and is ready to use.",
      })
      
      // Reset form
      setFormData({ name: "", institution: "", approverEmail: "" })
      setApprovers([])
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error creating account",
        description: "There was a problem creating your account. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addApprover = () => {
    if (!formData.approverEmail) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.approverEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    if (approvers.some(a => a.email === formData.approverEmail)) {
      toast({
        title: "Duplicate email",
        description: "This email is already added as an approver",
        variant: "destructive",
      })
      return
    }

    setApprovers(prev => [...prev, { id: crypto.randomUUID(), email: formData.approverEmail }])
    setFormData(prev => ({ ...prev, approverEmail: "" }))
  }

  const removeApprover = (id: string) => {
    setApprovers(prev => prev.filter(a => a.id !== id))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gradient-bg text-white shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Link New Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link New Account</DialogTitle>
          <DialogDescription>
            Enter your account details to link it to your profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Account Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Main Checking"
                className="col-span-3"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="institution" className="text-right">
                Institution
              </Label>
              <Input
                id="institution"
                name="institution"
                placeholder="e.g., Chase Bank"
                className="col-span-3"
                value={formData.institution}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="approverEmail" className="text-right">
                  Add Approver
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="approverEmail"
                    name="approverEmail"
                    type="email"
                    placeholder="approver@example.com"
                    value={formData.approverEmail}
                    onChange={handleChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addApprover}
                    disabled={!formData.approverEmail}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {approvers.length > 0 && (
                <div className="space-y-2 mt-2">
                  <Label className="text-sm text-muted-foreground">Approvers</Label>
                  <div className="space-y-2">
                    {approvers.map((approver) => (
                      <div
                        key={approver.id}
                        className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2"
                      >
                        <span className="text-sm">{approver.email}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeApprover(approver.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="gradient-bg text-white"
              disabled={createAccountMutation.isPending}
            >
              {createAccountMutation.isPending ? "Creating..." : "Link Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
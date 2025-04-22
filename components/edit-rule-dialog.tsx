"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle } from "lucide-react"
import axios from "axios"

interface Rule {
  id: string
  name: string
  description: string
  threshold: number
}

interface EditRuleDialogProps {
  rule: Rule
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditRuleDialog({ rule, open, onOpenChange }: EditRuleDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: rule.name,
    description: rule.description,
    threshold: rule.threshold.toString()
  })
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateRuleMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axios.put(`/api/accounts/rules?ruleId=${rule.id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] })
      toast({
        title: "Rule updated",
        description: "The fraud detection rule has been updated successfully.",
      })
      setIsOpen(false)
      onOpenChange?.(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update the rule. Please try again.",
        variant: "destructive",
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateRuleMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open={open ?? isOpen} onOpenChange={onOpenChange ?? setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <AlertTriangle className="mr-2 h-4 w-4" /> Configure Alert Rules
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Fraud Detection Rule</DialogTitle>
          <DialogDescription>
            Modify the rule parameters to adjust fraud detection sensitivity.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="threshold" className="text-right">
                Threshold
              </Label>
              <Input
                id="threshold"
                name="threshold"
                type="number"
                min="0"
                max="100"
                value={formData.threshold}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit"
              disabled={updateRuleMutation.isPending}
            >
              {updateRuleMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
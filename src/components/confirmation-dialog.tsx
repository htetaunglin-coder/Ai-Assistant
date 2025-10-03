"use client"

// This file is not being used right now. It was created to make confirmation dialogs reusable.
// Please uncomment it when it is needed, or we might remove it in the future if there is no use case.
import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  cn,
} from "@mijn-ui/react"
import { create } from "zustand"

type ConfirmationState = {
  open: boolean
  title: string | null
  description: string | React.ReactNode | null
  cancelLabel: string | null
  actionLabel: string | null
  actionState: "normal" | "danger"
  onAction: () => void
  onCancel: () => void
}

type ConfirmationActions = {
  openConfirmation: (data: {
    title: string
    description: string | React.ReactNode
    cancelLabel: string
    actionLabel: string
    actionState?: "normal" | "danger"
    waitForAction?: boolean
    onAction: () => void
    onCancel?: () => void
  }) => void
  closeConfirmation: () => void
}

const useConfirmationStore = create<ConfirmationState & ConfirmationActions>((set) => ({
  open: false,
  title: null,
  description: null,
  cancelLabel: null,
  actionLabel: null,
  actionState: "normal",
  onAction: () => {},
  onCancel: () => {},
  openConfirmation: (data) =>
    set(() => ({
      open: true,
      title: data.title,
      description: data.description,
      cancelLabel: data.cancelLabel,
      actionLabel: data.actionLabel,
      actionState: data.actionState ?? "normal",
      waitForAction: data.waitForAction ?? false,
      onAction: data.onAction,
      onCancel: data.onCancel,
    })),
  closeConfirmation: () =>
    set(() => ({
      open: false,
      title: null,
      description: null,
      cancelLabel: null,
      actionLabel: null,
      actionState: "normal",
      onAction: () => {},
      onCancel: () => {},
    })),
}))

const ConfirmationDialog = () => {
  const { open, title, description, cancelLabel, actionLabel, actionState, onAction, onCancel, closeConfirmation } =
    useConfirmationStore()

  return (
    <AlertDialog open={open} onOpenChange={closeConfirmation}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild onClick={onCancel}>
            <Button variant="ghost">{cancelLabel}</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild onClick={onAction}>
            <Button
              variant="primary"
              className={cn(
                actionState === "danger" &&
                  "bg-danger text-danger-foreground !ring-danger hover:bg-danger/80 hover:text-danger-foreground active:bg-danger/70",
              )}>
              {actionLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ConfirmationDialog, useConfirmationStore }

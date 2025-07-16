"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizeable";
import { Button } from "@mijn-ui/react-button";
import { useControlledState } from "@mijn-ui/react-hooks";
import { cn } from "@mijn-ui/react-theme";
import { createContext } from "@mijn-ui/react-utilities";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import React from "react";

type ResizableLayoutContextType = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const [ResizableLayoutContextProvider, useResizableLayoutContext] =
  createContext<ResizableLayoutContextType>({
    name: "ResizableLayoutContext",
    strict: true,
    errorMessage:
      "useResizableLayoutContext: `context` is undefined. Ensure the component is wrapped within <ResizableLayoutProvider />",
  });

/* -------------------------------------------------------------------------- */
/*                           ResizableLayoutProvider                          */
/* -------------------------------------------------------------------------- */

type ResizableLayoutProviderProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

const ResizableLayoutProvider = ({
  open: panelOpen,
  onOpenChange: onPanelOpenChange,
  defaultOpen = false,
  children,
}: ResizableLayoutProviderProps) => {
  const [open, setOpen] = useControlledState(
    panelOpen,
    defaultOpen,
    onPanelOpenChange
  );

  return (
    <ResizableLayoutContextProvider
      value={{ open: open, onOpenChange: setOpen }}>
      {children}
    </ResizableLayoutContextProvider>
  );
};

/* -------------------------------------------------------------------------- */
/*                            ResizableLayoutGroup                            */
/* -------------------------------------------------------------------------- */

type ResizableLayoutGroupProps = Omit<
  React.ComponentPropsWithRef<typeof ResizablePanelGroup>,
  "direction"
> & {
  direction?: "horizontal" | "vertical";
};

const ResizableLayoutGroup = ({ ...props }: ResizableLayoutGroupProps) => {
  return (
    <ResizablePanelGroup
      autoSaveId="conditional"
      direction="horizontal"
      {...props}
    />
  );
};

/* -------------------------------------------------------------------------- */
/*                         ResizableLayoutPanelTrigger                        */
/* -------------------------------------------------------------------------- */

const ResizableLayoutPanelTrigger = ({
  children,
  onClick,
  ...props
}: React.ComponentPropsWithRef<typeof Button>) => {
  const { open: panelOpen, onOpenChange: onPanelOpenChange } =
    useResizableLayoutContext();

  return (
    <Button
      iconOnly
      variant="ghost"
      onClick={(e) => {
        onClick?.(e);
        onPanelOpenChange(!panelOpen);
      }}
      {...props}>
      {children ? (
        children
      ) : (
        <>
          {panelOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
          <span className="sr-only">Toggle Panel</span>
        </>
      )}
    </Button>
  );
};

const ResizableLayoutPanelClose = ({
  children,
  onClick,
  ...props
}: React.ComponentPropsWithRef<typeof Button>) => {
  const { onOpenChange: onPanelOpenChange } = useResizableLayoutContext();

  return (
    <Button
      iconOnly
      variant="ghost"
      onClick={(e) => {
        onClick?.(e);
        onPanelOpenChange(false);
      }}
      {...props}>
      {children ? (
        children
      ) : (
        <>
          <X />
          <span className="sr-only">Close Panel</span>
        </>
      )}
    </Button>
  );
};

/* -------------------------------------------------------------------------- */
/*                            ResizableLayoutPanel                            */
/* -------------------------------------------------------------------------- */

const ResizableLayoutPanel = ({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ResizablePanel>) => {
  const { open: panelOpen } = useResizableLayoutContext();

  if (!panelOpen) return null;

  return (
    <>
      <ResizablePanel
        id="left"
        order={1}
        className={cn("relative border-r", className)}
        minSize={20}
        defaultSize={25}
        maxSize={30}
        {...props}
      />
      <ResizableHandle
        className={cn(
          "pointer-events-none relative hidden w-3 bg-transparent p-0 after:absolute after:right-0 after:top-1/2 after:h-8 after:w-[6px] after:-translate-x-px after:-translate-y-1/2 after:rounded-full after:bg-border after:transition-all after:hover:h-10 lg:block"
        )}
      />
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                           ResizableLayoutContent                           */
/* -------------------------------------------------------------------------- */

const ResizableLayoutContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ResizablePanel
      defaultSize={75}
      minSize={75}
      maxSize={100}
      id="main"
      order={2}>
      {children}
    </ResizablePanel>
  );
};

export {
  ResizableLayoutContent,
  ResizableLayoutGroup,
  ResizableLayoutPanel,
  ResizableLayoutPanelClose,
  ResizableLayoutPanelTrigger,
  ResizableLayoutProvider,
  useResizableLayoutContext,
};

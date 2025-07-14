"use client";

import React from "react";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Button } from "@mijn-ui/react-button";
import { useControlledState } from "@mijn-ui/react-hooks";
import { ScrollArea } from "@mijn-ui/react-scroll-area";
import { cn } from "@mijn-ui/react-theme";
import { createContext } from "@mijn-ui/react-utilities";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizeable";

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
  ...props
}: React.ComponentPropsWithRef<typeof Button>) => {
  const { open: panelOpen, onOpenChange: onPanelOpenChange } =
    useResizableLayoutContext();

  return (
    <Button
      iconOnly
      variant="ghost"
      onClick={(e) => {
        props?.onClick?.(e);
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
  ...props
}: React.ComponentPropsWithRef<typeof Button>) => {
  const { onOpenChange: onPanelOpenChange } = useResizableLayoutContext();

  return (
    <Button
      iconOnly
      variant="ghost"
      onClick={(e) => {
        props?.onClick?.(e);
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
        minSize={19}
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
    <ResizablePanel id="main" order={2}>
      <ScrollArea className="relative flex size-full flex-col items-center justify-center gap-2">
        {children}
      </ScrollArea>
    </ResizablePanel>
  );
};

export {
  ResizableLayoutProvider,
  ResizableLayoutGroup,
  ResizableLayoutPanel,
  ResizableLayoutPanelTrigger,
  ResizableLayoutPanelClose,
  ResizableLayoutContent,
  useResizableLayoutContext,
};

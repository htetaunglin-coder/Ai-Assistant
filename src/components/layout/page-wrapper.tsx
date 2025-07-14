import React from "react";
import { ScrollArea } from "@mijn-ui/react-scroll-area";
import { cn } from "@mijn-ui/react-theme";

type PageWrapperProps = {
  scrollable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

const PageWrapper = ({
  className,
  style,
  children,
  scrollable = true,
}: PageWrapperProps) => {
  return (
    <>
      {scrollable ? (
        <ScrollArea
          className={cn(
            "lg:rounded-llgarge relative h-svh border bg-background-alt lg:h-[calc(100svh-32px)]",
            className
          )}
          style={style}>
          {children}
        </ScrollArea>
      ) : (
        <div
          className={cn(
            "relative h-svh overflow-hidden border bg-background-alt lg:h-[calc(100svh-32px)] lg:rounded-lg",
            className
          )}>
          {children}
        </div>
      )}
    </>
  );
};

export default PageWrapper;

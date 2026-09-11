import type { ReactNode } from "react";

export interface ViewField {
  icon: React.ElementType;
  label: string;
  value: ReactNode;
}

export interface ContextMenuItem {
    label: string;
  icon: string;
  action: string;
  isDanger?: boolean;
  isDivider?: boolean;
  isSectionHeader?: boolean;     // New
  color?: string;                // For priority flags
  children?: ContextMenuItem[];  // For sections like Date & Priority
  hasSubmenu?: boolean
  renderType?:any
//   command?: 
}

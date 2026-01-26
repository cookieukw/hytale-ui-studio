// Hytale UI Component Types

export type LayoutMode = "Top" | "Left" | "Middle" | "Bottom" | "Right";
export type Direction = "Vertical" | "Horizontal";
export type TextAlignment = "Left" | "Center" | "Right";
export type ImageFit = "Fill" | "Fit" | "Stretch";

export interface Anchor {
  width?: number | string;
  height?: number | string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  centerX?: number;
  centerY?: number;
  full?: boolean;
}

export interface Padding {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface Margin {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface TextStyle {
  fontSize?: number;
  renderBold?: boolean;
  renderUppercase?: boolean;
  textColor?: string;
  alignment?: TextAlignment;
}

export interface BackgroundStyle {
  color?: string;
  border?: string;
  opacity?: number;
}

export interface ComponentState {
  hovered?: Partial<HytaleComponent>;
  pressed?: Partial<HytaleComponent>;
  disabled?: Partial<HytaleComponent>;
  focus?: Partial<HytaleComponent>;
  error?: Partial<HytaleComponent>;
}

export type ComponentType =
  | "Group"
  | "ScrollArea"
  | "TextField"
  | "NumberField"
  | "Button"
  | "TextButton"
  | "Label"
  | "Image"
  | "ProgressBar";

export interface HytaleComponent {
  id: string;
  type: ComponentType;
  name: string;
  // Layout
  anchor?: Anchor;
  layoutMode?: LayoutMode;
  padding?: Padding;
  margin?: Margin;
  flexWeight?: number;
  // Style
  background?: BackgroundStyle;
  textStyle?: TextStyle;
  // Component specific
  text?: string;
  placeholderText?: string;
  value?: number | string;
  source?: string;
  fit?: ImageFit;
  direction?: Direction;
  maxWidth?: number;
  maxHeight?: number;
  showScrollbar?: boolean;
  max?: number;
  showLabel?: boolean;
  // States
  states?: ComponentState;
  // Hierarchy
  children?: HytaleComponent[];
  // Editor state
  isVisible?: boolean;
  isLocked?: boolean;
  isExpanded?: boolean;
}

export type PresetType =
  | "BasicHUD"
  | "DialogBox"
  | "InputForm"
  | "ProgressDisplay"
  | "ScrollableList"
  | "PanelCard"
  | "ToolbarRow"
  | "IconLabel"
  | "StatTile"
  | "ListItem"
  | "TwoColumnForm"
  | "SearchBar"
  | "NotificationBanner"
  | "ProfileCard"
  | "StatusPill"
  | "FooterActions"
  | "StatRow"
  | "ButtonRow"
  | "EmptyState";

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  icon: string;
  category: "Layout" | "Input" | "Display";
  defaultProps: Partial<HytaleComponent>;
}

export interface PresetDefinition {
  type: PresetType;
  label: string;
  icon: string;
  description: string;
  create: () => HytaleComponent;
}

export type ViewMode = "Design" | "Blueprint" | "Split";
export type DevicePreview = "Desktop" | "Tablet" | "Mobile";

export interface EditorState {
  components: HytaleComponent[];
  selectedId: string | null;
  viewMode: ViewMode;
  devicePreview: DevicePreview;
  showGrid: boolean;
  snapToGrid: boolean;
  zoom: number;
  code: string;
  history: HytaleComponent[][];
  historyIndex: number;
}

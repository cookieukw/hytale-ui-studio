// Hytale UI Component Types

export type LayoutMode =
  | "Top"
  | "Left"
  | "Middle"
  | "Bottom"
  | "Right"
  | "Center"
  | "Full"
  | "TopScrolling"
  | "CenterMiddle"
  | "MiddleCenter"
  | "LeftCenterWrap";
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
  horizontalAlignment?: string;
  verticalAlignment?: string;
}

export interface BackgroundStyle {
  color?: string;
  texture?: string;
  border?: number | string;
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
  | "Panel"
  | "ContentSeparator"
  | "VerticalSeparator"
  | "PanelSeparatorFancy"
  | "Group"
  | "TextField"
  | "NumberField"
  | "Button"
  | "SecondaryButton"
  | "SecondaryTextButton"
  | "TertiaryButton"
  | "TertiaryTextButton"
  | "CancelButton"
  | "CancelTextButton"
  | "Label"
  | "TimerLabel"
  | "Image"
  | "CheckBox"
  | "Dropdown"
  | "Slider"
  | "ScrollArea"
  | "Sprite"
  | "Spinner"
  | "ProgressBar";

export interface SpriteFrame {
  width: number;
  height: number;
  perRow: number;
  count: number;
}

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
  zIndex?: number;
  // Style
  background?: BackgroundStyle;
  textStyle?: TextStyle;
  // Component specific
  text?: string;
  placeholderText?: string;
  value?: number | string;
  seconds?: number;
  source?: string;
  fit?: ImageFit;
  direction?: Direction;
  maxWidth?: number;
  maxHeight?: number;
  showScrollbar?: boolean;
  scrollbarStyle?: string;
  max?: number;
  min?: number;
  step?: number;
  checked?: boolean;
  options?: string[]; // For Dropdown
  showLabel?: boolean;
  // Sprite specific
  texturePath?: string;
  frame?: SpriteFrame;
  framesPerSecond?: number;
  // States
  states?: ComponentState;
  // Hierarchy
  children?: HytaleComponent[];
  // Editor state
  isVisible?: boolean;
  isLocked?: boolean;
  isExpanded?: boolean;
  isDeletable?: boolean;
  inheritance?: string;
  alias?: string;
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
  imports: string[];
}

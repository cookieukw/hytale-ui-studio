// Hytale UI Component Types

export type LayoutMode =
  | "Top"
  | "Bottom"
  | "Left"
  | "Right"
  | "Center"
  | "Middle"
  | "MiddleCenter"
  | "TopScrolling"
  | "LeftScrolling"
  | "LeftCenterWrap"
  | "CenterMiddle"
  | "Full";
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
  | "ProgressBar"
  | "DropdownBox"
  | "DropdownEntry";

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
  maxDecimalPlaces?: number;
  checked?: boolean;
  options?: string[]; // For Dropdown
  showLabel?: boolean;
  // Sprite specific
  texturePath?: string;
  frame?: SpriteFrame;
  framesPerSecond?: number;
  // ProgressBar specific
  barTexturePath?: string;
  effectTexturePath?: string;
  effectWidth?: number;
  effectHeight?: number;

  effectOffset?: number;
  // DropdownBox specific
  entries?: string[];
  selectedValues?: string[];
  hitTestVisible?: boolean;
  tooltipText?: string;
  tooltipTextSpans?: any[]; // Revisit type later if needed
  textTooltipStyle?: TextStyle;
  textTooltipShowDelay?: number;
  disabled?: boolean;
  dropdownStyle?: any; // Avoiding collision with react style
  panelTitleText?: string;
  isReadOnly?: boolean;
  maxSelection?: number;
  showSearchInput?: boolean;
  forcedLabel?: string;
  noItemsText?: string;
  displayNonExistingValue?: boolean;
  contentWidth?: number;
  contentHeight?: number;
  autoScrollDown?: boolean;
  keepScrollPosition?: boolean;
  mouseWheelScrollBehaviour?: string;
  maskTexturePath?: string;
  outlineColor?: string;

  outlineSize?: number;
  overscroll?: boolean;
  // Events
  valueChanged?: string;
  dropdownToggled?: string;
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
  | "ProgressDisplay" // Deprecated/Legacy
  | "ProgressBar" // New standard preset
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
  defaultProps?: Partial<HytaleComponent>;
  create?: () => HytaleComponent;
}

export interface PresetDefinition {
  type: PresetType;
  label: string;
  icon: string;
  description: string;
  create: () => HytaleComponent;
}

export type ViewMode = "Design" | "Blueprint" | "Split";
export type DevicePreview = "Desktop" | "Tablet" | "Mobile" | "Hytale";

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

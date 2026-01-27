import type {
  ComponentDefinition,
  PresetDefinition,
  HytaleComponent,
} from "./hytale-types";

function generateId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  // Layout
  {
    type: "Group",
    label: "Group",
    icon: "Square",
    category: "Layout",
    defaultProps: {
      name: "Group",
      anchor: { width: 200, height: 100 },
      layoutMode: "Top",
      background: { color: "#2a2a3a", opacity: 1 },
    },
  },
  {
    type: "ScrollArea",
    label: "Scroll Area",
    icon: "ScrollText",
    category: "Layout",
    defaultProps: {
      name: "ScrollArea",
      anchor: { width: 200, height: 300 },
      layoutMode: "Top",
      showScrollbar: true,
      background: { color: "#1a1a2a", opacity: 1 },
    },
  },

  // Input
  {
    type: "TextField",
    label: "Text Field",
    icon: "TextCursor",
    category: "Input",
    defaultProps: {
      name: "TextField",
      placeholderText: "Enter text...",
      anchor: { width: 200, height: 40 },
      padding: { left: 12, right: 12, top: 8, bottom: 8 },
      background: { color: "#1a1a2a", border: "#3a3a4a" },
    },
  },
  {
    type: "NumberField",
    label: "Number Field",
    icon: "Hash",
    category: "Input",
    defaultProps: {
      name: "NumberField",
      value: 0,
      anchor: { width: 120, height: 40 },
      padding: { left: 12, right: 12, top: 8, bottom: 8 },
      background: { color: "#1a1a2a", border: "#3a3a4a" },
    },
  },
  {
    type: "Button",
    label: "Button",
    icon: "MousePointerClick",
    category: "Input",
    defaultProps: {
      name: "Button",
      anchor: { width: 120, height: 40 },
      background: { color: "#4a9eff", opacity: 1 },
      layoutMode: "Middle",
      states: {
        hovered: { background: { color: "#5aafff" } },
        pressed: { background: { color: "#3a8eef" } },
        disabled: { background: { opacity: 0.5 } },
      },
      children: [
        {
          id: generateId(),
          type: "Label",
          name: "ButtonLabel",
          text: "Button",
          textStyle: {
            fontSize: 14,
            textColor: "#ffffff",
            alignment: "Center",
          },
        },
      ],
    },
  },
  {
    type: "TextButton",
    label: "Text Button",
    icon: "Type",
    category: "Input",
    defaultProps: {
      name: "TextButton",
      text: "Click me",
      textStyle: {
        fontSize: 14,
        textColor: "#4a9eff",
      },
      states: {
        hovered: { textStyle: { textColor: "#5aafff" } },
        pressed: { textStyle: { textColor: "#3a8eef" } },
      },
    },
  },

  {
    type: "CheckBox",
    label: "Check Box",
    icon: "Square",
    category: "Input",
    defaultProps: {
      name: "CheckBox",
      checked: false,
      anchor: { width: 22, height: 22 },
      background: { color: "#000000", opacity: 0, border: "7" },
      padding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
  },
  {
    type: "Slider",
    label: "Slider",
    icon: "SlidersHorizontal",
    category: "Input",
    defaultProps: {
      name: "Slider",
      value: 50,
      min: 0,
      max: 100,
      step: 1,
      anchor: { width: 200, height: 20 },
      background: { color: "#1a1a2a", border: "2" },
    },
  },
  {
    type: "Dropdown",
    label: "Dropdown",
    icon: "ChevronDown",
    category: "Input",
    defaultProps: {
      name: "Dropdown",
      text: "Select Option", // Used as current selection label
      options: ["Option 1", "Option 2", "Option 3"],
      anchor: { width: 220, height: 32 },
      background: { color: "#1a1a2a", border: "16" },
      padding: { left: 8, right: 8 },
    },
  },

  // Display
  {
    type: "Label",
    label: "Label",
    icon: "Text",
    category: "Display",
    defaultProps: {
      name: "Label",
      text: "Label Text",
      textStyle: {
        fontSize: 14,
        textColor: "#ffffff",
        alignment: "Left",
      },
    },
  },
  {
    type: "Spinner",
    label: "Spinner",
    icon: "Loader",
    category: "Display",
    defaultProps: {
      name: "Spinner",
      anchor: { width: 32, height: 32 },
    },
  },
  {
    type: "TimerLabel",
    label: "Timer Label",
    icon: "Timer",
    category: "Display",
    defaultProps: {
      name: "TimerLabel",
      seconds: 60,
      textStyle: {
        fontSize: 32,
        textColor: "#ffffff",
        alignment: "Center",
      },
      anchor: { width: 200, height: 40 },
    },
  },
  {
    type: "Image",
    label: "Image",
    icon: "Image",
    category: "Display",
    defaultProps: {
      name: "Image",
      source: "",
      fit: "Fit",
      anchor: { width: 100, height: 100 },
    },
  },
  {
    type: "ProgressBar",
    label: "Progress Bar",
    icon: "Gauge",
    category: "Display",
    defaultProps: {
      name: "ProgressBar",
      value: 50,
      max: 100,
      showLabel: true,
      anchor: { width: 200, height: 24 },
      background: { color: "#1a1a2a" },
    },
  },
];

export const PRESET_DEFINITIONS: PresetDefinition[] = [
  {
    type: "BasicHUD",
    label: "Basic HUD",
    icon: "Layout",
    description: "Simple centered HUD with title",
    create: () => ({
      id: generateId(),
      type: "Group",
      name: "BasicHUD",
      anchor: { width: 300, height: 80 },
      layoutMode: "Middle",
      padding: { top: 16, bottom: 16, left: 16, right: 16 },
      background: { color: "#1a1a2a", opacity: 0.9 },
      children: [
        {
          id: generateId(),
          type: "Label",
          name: "HUDTitle",
          text: "HUD Title",
          textStyle: {
            fontSize: 18,
            renderBold: true,
            textColor: "#ffffff",
            alignment: "Center",
          },
        },
      ],
    }),
  },
  {
    type: "DialogBox",
    label: "Dialog Box",
    icon: "MessageSquare",
    description: "Dialog with header, body, and footer",
    create: () => ({
      id: generateId(),
      type: "Group",
      name: "DialogBox",
      anchor: { width: 400, height: 300 },
      layoutMode: "Top",
      background: { color: "#2a2a3a", border: "#3a3a4a" },
      children: [
        {
          id: generateId(),
          type: "Group",
          name: "DialogHeader",
          anchor: { width: "100%", height: 50 },
          layoutMode: "Middle",
          padding: { left: 16, right: 16 },
          background: { color: "#1a1a2a" },
          children: [
            {
              id: generateId(),
              type: "Label",
              name: "DialogTitle",
              text: "Dialog Title",
              textStyle: {
                fontSize: 16,
                renderBold: true,
                textColor: "#ffffff",
              },
            },
          ],
        },
        {
          id: generateId(),
          type: "Group",
          name: "DialogBody",
          anchor: { width: "100%" },
          flexWeight: 1,
          padding: { top: 16, bottom: 16, left: 16, right: 16 },
          children: [
            {
              id: generateId(),
              type: "Label",
              name: "DialogContent",
              text: "Dialog content goes here...",
              textStyle: {
                fontSize: 14,
                textColor: "#aaaaaa",
              },
            },
          ],
        },
        {
          id: generateId(),
          type: "Group",
          name: "DialogFooter",
          anchor: { width: "100%", height: 60 },
          layoutMode: "Right",
          padding: { left: 16, right: 16 },
          background: { color: "#1a1a2a" },
          children: [
            {
              id: generateId(),
              type: "Button",
              name: "CancelButton",
              anchor: { width: 80, height: 36 },
              background: { color: "#3a3a4a" },
              children: [
                {
                  id: generateId(),
                  type: "Label",
                  name: "CancelLabel",
                  text: "Cancel",
                  textStyle: { fontSize: 14, textColor: "#ffffff" },
                },
              ],
            },
            {
              id: generateId(),
              type: "Button",
              name: "ConfirmButton",
              anchor: { width: 80, height: 36 },
              margin: { left: 8 },
              background: { color: "#4a9eff" },
              children: [
                {
                  id: generateId(),
                  type: "Label",
                  name: "ConfirmLabel",
                  text: "Confirm",
                  textStyle: { fontSize: 14, textColor: "#ffffff" },
                },
              ],
            },
          ],
        },
      ],
    }),
  },
  {
    type: "InputForm",
    label: "Input Form",
    icon: "FormInput",
    description: "Label with text field",
    create: () => ({
      id: generateId(),
      type: "Group",
      name: "InputForm",
      anchor: { width: 280, height: 70 },
      layoutMode: "Top",
      children: [
        {
          id: generateId(),
          type: "Label",
          name: "InputLabel",
          text: "Field Label",
          textStyle: {
            fontSize: 12,
            textColor: "#888888",
          },
        },
        {
          id: generateId(),
          type: "TextField",
          name: "InputField",
          placeholderText: "Enter value...",
          anchor: { width: "100%", height: 40 },
          margin: { top: 8 },
          padding: { left: 12, right: 12 },
          background: { color: "#1a1a2a", border: "#3a3a4a" },
        },
      ],
    }),
  },
  {
    type: "ProgressDisplay",
    label: "Progress Display",
    icon: "Loader",
    description: "Label with progress bar",
    create: () => ({
      id: generateId(),
      type: "Group",
      name: "ProgressDisplay",
      anchor: { width: 250, height: 50 },
      layoutMode: "Top",
      children: [
        {
          id: generateId(),
          type: "Label",
          name: "ProgressLabel",
          text: "Progress",
          textStyle: {
            fontSize: 12,
            textColor: "#888888",
          },
        },
        {
          id: generateId(),
          type: "ProgressBar",
          name: "ProgressValue",
          value: 65,
          max: 100,
          showLabel: true,
          anchor: { width: "100%", height: 20 },
          margin: { top: 8 },
        },
      ],
    }),
  },
  {
    type: "ButtonRow",
    label: "Button Row",
    icon: "LayoutList",
    description: "Primary and secondary buttons",
    create: () => ({
      id: generateId(),
      type: "Group",
      name: "ButtonRow",
      anchor: { width: 220, height: 40 },
      layoutMode: "Right",
      direction: "Horizontal",
      children: [
        {
          id: generateId(),
          type: "Button",
          name: "SecondaryButton",
          anchor: { width: 100, height: 40 },
          background: { color: "#3a3a4a" },
          children: [
            {
              id: generateId(),
              type: "Label",
              name: "SecondaryLabel",
              text: "Secondary",
              textStyle: { fontSize: 14, textColor: "#ffffff" },
            },
          ],
        },
        {
          id: generateId(),
          type: "Button",
          name: "PrimaryButton",
          anchor: { width: 100, height: 40 },
          margin: { left: 12 },
          background: { color: "#4a9eff" },
          children: [
            {
              id: generateId(),
              type: "Label",
              name: "PrimaryLabel",
              text: "Primary",
              textStyle: { fontSize: 14, textColor: "#ffffff" },
            },
          ],
        },
      ],
    }),
  },
  {
    type: "SearchBar",
    label: "Search Bar",
    icon: "Search",
    description: "Text field with search button",
    create: () => ({
      id: generateId(),
      type: "Group",
      name: "SearchBar",
      anchor: { width: 300, height: 40 },
      layoutMode: "Left",
      direction: "Horizontal",
      children: [
        {
          id: generateId(),
          type: "TextField",
          name: "SearchField",
          placeholderText: "Search...",
          flexWeight: 1,
          anchor: { height: 40 },
          padding: { left: 12, right: 12 },
          background: { color: "#1a1a2a", border: "#3a3a4a" },
        },
        {
          id: generateId(),
          type: "Button",
          name: "SearchButton",
          anchor: { width: 40, height: 40 },
          margin: { left: 8 },
          background: { color: "#4a9eff" },
          children: [
            {
              id: generateId(),
              type: "Label",
              name: "SearchIcon",
              text: "Go",
              textStyle: { fontSize: 12, textColor: "#ffffff" },
            },
          ],
        },
      ],
    }),
  },
  {
    type: "StatTile",
    label: "Stat Tile",
    icon: "BarChart3",
    description: "Small label with big value",
    create: () => ({
      id: generateId(),
      type: "Group",
      name: "StatTile",
      anchor: { width: 120, height: 70 },
      layoutMode: "Top",
      padding: { top: 12, bottom: 12, left: 12, right: 12 },
      background: { color: "#2a2a3a" },
      children: [
        {
          id: generateId(),
          type: "Label",
          name: "StatLabel",
          text: "STAT",
          textStyle: {
            fontSize: 10,
            renderUppercase: true,
            textColor: "#666666",
          },
        },
        {
          id: generateId(),
          type: "Label",
          name: "StatValue",
          text: "1,234",
          margin: { top: 4 },
          textStyle: {
            fontSize: 24,
            renderBold: true,
            textColor: "#ffffff",
          },
        },
      ],
    }),
  },
  {
    type: "NotificationBanner",
    label: "Notification",
    icon: "Bell",
    description: "Banner with dismiss button",
    create: () => ({
      id: generateId(),
      type: "Group",
      name: "NotificationBanner",
      anchor: { width: 350, height: 50 },
      layoutMode: "Left",
      padding: { left: 16, right: 8 },
      background: { color: "#2a4a3a", border: "#3a5a4a" },
      children: [
        {
          id: generateId(),
          type: "Label",
          name: "NotificationText",
          text: "This is a notification message",
          flexWeight: 1,
          textStyle: {
            fontSize: 14,
            textColor: "#ffffff",
          },
        },
        {
          id: generateId(),
          type: "TextButton",
          name: "DismissButton",
          text: "Dismiss",
          textStyle: {
            fontSize: 12,
            textColor: "#6aff9a",
          },
        },
      ],
    }),
  },
];

export function getComponentsByCategory(
  category: "Layout" | "Input" | "Display",
): ComponentDefinition[] {
  return COMPONENT_DEFINITIONS.filter((def) => def.category === category);
}

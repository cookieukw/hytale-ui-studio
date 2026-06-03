export interface TemplateData {
  id: string;
  name: string;
  description: string;
  image: string;
  xml: string;
}

export const TEMPLATES: TemplateData[] = [
  {
    id: "rpg-inventory",
    name: "RPG Inventory",
    description: "A complete multi-slot RPG inventory system with equipment slots and stats panel.",
    image: "/screenshots/inventory-exported.png",
    xml: `
Group #InventoryOverlay {
  LayoutMode: CenterMiddle;
  Anchor: (Full: 0);

  Group #InventoryWindow {
    LayoutMode: Left;
    Anchor: (Width: 1000, Height: 600);
    
    // ─── LEFT PANEL ──────────────────────────────────────────────────────────
    Group #LeftPanel {
      FlexWeight: 1;
      LayoutMode: Top;
      Background: #D2AD8E;
      Anchor: (Right: 10);
      Padding: 10;
      
      // Top Tabs
      Group #LeftTabs {
        LayoutMode: Left;
        Anchor: (Height: 40, Bottom: 10);
        
        Button #TabMochila {
          FlexWeight: 1;
          Background: #68482E;
          Anchor: (Right: 5);
          Label { Text: "Mochila"; Style: (TextColor: #FFFFFF, HorizontalAlignment: Center, VerticalAlignment: Center, FontSize: 18, RenderBold: true); }
        }
        Button #TabStatus {
          FlexWeight: 1;
          Background: #8F694B;
          Anchor: (Right: 5);
          Label { Text: "Status"; Style: (TextColor: #FFFFFF, HorizontalAlignment: Center, VerticalAlignment: Center, FontSize: 18, RenderBold: true); }
        }
        Button #TabConfigs {
          FlexWeight: 1;
          Background: #8F694B;
          Label { Text: "Configs"; Style: (TextColor: #FFFFFF, HorizontalAlignment: Center, VerticalAlignment: Center, FontSize: 18, RenderBold: true); }
        }
      }
      
      // Middle Scroll Area
      Group #LeftMiddle {
        FlexWeight: 1;
        LayoutMode: Left;
        Background: #A57C5F;
        Anchor: (Bottom: 10);
        Padding: 15;
        
        Group #ScrollContent {
          FlexWeight: 1;
          LayoutMode: Top;
          
          Label #AljavaTitle {
            Text: "aljava";
            Style: (TextColor: #FFFFFF, HorizontalAlignment: Center, FontSize: 36, RenderBold: true);
            Anchor: (Bottom: 10);
          }
          
          Group #AljavaSlots {
            LayoutMode: CenterMiddle;
            Anchor: (Height: 70, Bottom: 40);
            
            Group #AnonSlot1 { LayoutMode: Left; Anchor: (Height: 65);
              Group #AnonSlot2 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
              Group #AnonSlot3 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
              Group #AnonSlot4 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
              Group #AnonSlot5 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
              Group #AnonSlot6 { Anchor: (Width: 65); Background: #B78D6E; }
            }
          }
          
          Label #MochilaTitle {
            Text: "mochila";
            Style: (TextColor: #FFFFFF, HorizontalAlignment: Center, FontSize: 36, RenderBold: true);
            Anchor: (Bottom: 10);
          }
          
          Group #MochilaSlotsRow1 {
            LayoutMode: CenterMiddle;
            Anchor: (Height: 70, Bottom: 6);
            Group #AnonSlot7 { LayoutMode: Left; Anchor: (Height: 65);
              Group #AnonSlot8 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
              Group #AnonSlot9 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
              Group #AnonSlot10 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
              Group #AnonSlot11 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
              Group #AnonSlot12 { Anchor: (Width: 65); Background: #B78D6E; }
            }
          }
          
          Group #MochilaSlotsRow2 {
            LayoutMode: CenterMiddle;
            Anchor: (Height: 70);
            Group #AnonSlot13 { LayoutMode: Left; Anchor: (Height: 65);
              Group #AnonSlot14 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
              Group #AnonSlot15 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
              Group #AnonSlot16 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
              Group #AnonSlot17 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
              Group #AnonSlot18 { Anchor: (Width: 65); Background: #B78D6E; }
            }
          }
        }
        
        Group #ScrollBar {
          Anchor: (Width: 14, Left: 10); Background: #8F694B;
          LayoutMode: Top;
          
          Group #ScrollThumb {
            Anchor: (Height: 250, Top: 2, Left: 2, Right: 2); Background: #D2AD8E;
          }
        }
      }
      
      // Bottom Area
      Group #LeftBottom {
        Anchor: (Height: 100);
        Background: #A57C5F;
      }
    }
    
    // ─── RIGHT PANEL ─────────────────────────────────────────────────────────
    Group #RightPanel {
      FlexWeight: 1;
      LayoutMode: Top;
      Background: #D2AD8E;
      Padding: 10;
      
      // Top Tabs
      Group #RightTabs {
        LayoutMode: Left;
        Anchor: (Height: 40, Bottom: 10);
        
        Button #TabEquip {
          FlexWeight: 1;
          Background: #8F694B;
          Anchor: (Right: 5);
          Label { Text: "Equipaveis"; Style: (TextColor: #FFFFFF, HorizontalAlignment: Center, VerticalAlignment: Center, FontSize: 18, RenderBold: true); }
        }
        Button #TabCriar {
          FlexWeight: 1;
          Background: #8F694B;
          Label { Text: "criar"; Style: (TextColor: #FFFFFF, HorizontalAlignment: Center, VerticalAlignment: Center, FontSize: 18, RenderBold: true); }
        }
      }
      
      // Middle Area (Split)
      Group #RightMiddle {
        FlexWeight: 1;
        LayoutMode: Left;
        Anchor: (Bottom: 10);
        
        // Equip Slots
        Group #EquipArea {
          FlexWeight: 1;
          Background: #A57C5F;
          Anchor: (Right: 10);
          LayoutMode: CenterMiddle;
          Padding: 15;
          
          Group #EquipGrid {
            LayoutMode: Top;
            Anchor: (Width: 207, Height: 278); // 3x65 + 2x6 gaps = 207, 4x65 + 3x6 = 278
            
            Group #EquipRow1 { LayoutMode: Left; Anchor: (Height: 65, Bottom: 6); Group #AnonSlot19 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; } Group #AnonSlot20 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; } Group #AnonSlot21 { Anchor: (Width: 65); Background: #B78D6E; } }
            Group #EquipRow2 { LayoutMode: Left; Anchor: (Height: 65, Bottom: 6); Group #AnonSlot22 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; } Group #AnonSlot23 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; } Group #AnonSlot24 { Anchor: (Width: 65); Background: #B78D6E; } }
            Group #EquipRow3 { LayoutMode: Left; Anchor: (Height: 65, Bottom: 6); Group #AnonSlot25 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; } Group #AnonSlot26 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; } Group #AnonSlot27 { Anchor: (Width: 65); Background: #B78D6E; } }
            Group #EquipRow4 { LayoutMode: Left; Anchor: (Height: 65); Group #AnonSlot28 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; } Group #AnonSlot29 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; } Group #AnonSlot30 { Anchor: (Width: 65); Background: #B78D6E; } }
          }
        }
        
        // Craft Area
        Group #CraftArea {
          FlexWeight: 1;
          Background: #3D2616;
          LayoutMode: Bottom;
          Padding: 15;
          
          Group #CraftSlotsContainer {
            Anchor: (Height: 65);
            LayoutMode: CenterMiddle;
            
            Group #CraftSlots {
              LayoutMode: Left;
              Anchor: (Height: 65);
              Group #AnonSlot31 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
              Group #AnonSlot32 { Anchor: (Width: 65); Background: #B78D6E; }
            }
          }
        }
      }
      
      // Bottom Area (Hotbar)
      Group #RightBottom {
        Anchor: (Height: 100);
        Background: #A57C5F;
        LayoutMode: CenterMiddle;
        
        Group #HotbarSlots {
          LayoutMode: Left;
          Anchor: (Height: 65);
          
          Group #AnonSlot33 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
          Group #AnonSlot34 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
          Group #AnonSlot35 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
          Group #AnonSlot36 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
          Group #AnonSlot37 { Anchor: (Width: 65, Right: 6); Background: #B78D6E; }
          Group #AnonSlot38 { Anchor: (Width: 65); Background: #B78D6E; }
        }
      }
    }
  }
}
`
  },
  {
    id: "skill-tree",
    name: "Skill Tree",
    description: "A complex progression tree layout using MiddleCenter nodes and absolute positioning.",
    image: "/screenshots/skills-exported.png",
    xml: `
Group #Overlay {
  LayoutMode: CenterMiddle;
  Background: #0A0A0A99;
  Group #MainContainer {
    Anchor: (Width: 1300, Height: 800);
    LayoutMode: Left;
    Group #LeftColumn {
      Anchor: (Right: 30);
      LayoutMode: Top;
      FlexWeight: 1;
      Group #SkillPanelBorder {
        Anchor: (Height: 380, Bottom: 20);
        Padding: (Full: 6);
        LayoutMode: Top;
        Background: #513e22;
        Group #SkillPanelInner {
          Padding: (Full: 15);
          LayoutMode: Top;
          FlexWeight: 1;
          Background: #101c2a;
          Group #SkillHeader {
            Anchor: (Height: 30, Top: -25);
            LayoutMode: CenterMiddle;
            Background: #c19a5b;
            Group {
              Anchor: (Full: 1);
              LayoutMode: CenterMiddle;
              Background: #101c2a;
              Label {
                Text: "SKILL";
                Background: #c19a5b;
                Style: (FontSize: 16, TextColor: #000000, RenderBold: true);
              }
            }
          }
          Group #IconNameRow {
            Anchor: (Height: 80, Bottom: 20);
            LayoutMode: Left;
            Group #SkillIconBorder {
              Anchor: (Width: 80, Right: 15);
              Padding: (Full: 3);
              LayoutMode: CenterMiddle;
              Background: #658db4;
              Group {
                Anchor: (Full: 1);
                LayoutMode: CenterMiddle;
                Background: #080c12;
                Label {
                  Text: "✨";
                  Style: (FontSize: 32);
                }
              }
            }
            Group #SkillName {
              LayoutMode: CenterMiddle;
              FlexWeight: 1;
              Label {
                Text: "THAT WAS FOR ME?";
                Style: (FontSize: 18, TextColor: #FFFFFF, RenderBold: true, HorizontalAlignment: Center);
              }
            }
          }
          Group #SkillDesc {
            LayoutMode: Top;
            FlexWeight: 1;
            Label {
              Text: "Get a small bonus when finding clickables. The bonus received varies depending on your current level.";
              Style: (FontSize: 14, TextColor: #a8bacc);
            }
          }
          Group #SkillFooter {
            Anchor: (Height: 30);
            LayoutMode: Left;
            Label {
              Text: "Max Points: 5";
              FlexWeight: 1;
              Style: (FontSize: 14, TextColor: #FFFFFF, VerticalAlignment: Center);
            }
            Button #InfoBtn {
              Anchor: (Width: 70);
              Background: #c19a5b;
              Group {
                Anchor: (Full: 1);
                LayoutMode: CenterMiddle;
                Background: #101c2a;
                Label {
                  Text: "INFO";
                  Style: (FontSize: 14, TextColor: #c19a5b, RenderBold: true);
                }
              }
            }
          }
        }
      }
      Group #EquippedPanelBorder {
        Padding: (Full: 6);
        LayoutMode: Top;
        FlexWeight: 1;
        Background: #513e22;
        Group #EquippedPanelInner {
          Padding: (Full: 15);
          LayoutMode: Top;
          FlexWeight: 1;
          Background: #101c2a;
          Group #EquippedHeader {
            Anchor: (Height: 30, Top: -25);
            LayoutMode: CenterMiddle;
            Background: #c19a5b;
            Group {
              Anchor: (Full: 1);
              LayoutMode: CenterMiddle;
              Background: #101c2a;
              Label {
                Text: "EQUIPPED SKILLS";
                Background: #c19a5b(0);
                Style: (FontSize: 14, TextColor: #000000, RenderBold: true);
              }
            }
          }
          Group #EquippedGrid {
            LayoutMode: CenterMiddle;
            FlexWeight: 1;
            Group {
              Anchor: (Width: 200, Height: 260);
              LayoutMode: Top;
              Group {
                Anchor: (Height: 80, Bottom: 10);
                LayoutMode: Left;
                Group {
                  LayoutMode: Center;
                  FlexWeight: 1;
                  Group {
                    Anchor: (Width: 75, Height: 75);
                    Padding: (Full: 3);
                    Background: #658db4;
                    Group {
                      Anchor: (Full: 1);
                      Background: #080c12;
                    }
                  }
                }
                Group {
                  LayoutMode: Center;
                  FlexWeight: 1;
                  Group {
                    Anchor: (Width: 75, Height: 75);
                    Padding: (Full: 3);
                    Background: #658db4;
                    Group {
                      Anchor: (Full: 1);
                      Background: #080c12;
                    }
                  }
                }
              }
              Group {
                Anchor: (Height: 80, Bottom: 10);
                LayoutMode: Left;
                Group {
                  LayoutMode: Center;
                  FlexWeight: 1;
                  Group {
                    Anchor: (Width: 75, Height: 75);
                    Padding: (Full: 3);
                    Background: #658db4;
                    Group {
                      Anchor: (Full: 1);
                      Background: #080c12;
                    }
                  }
                }
                Group {
                  LayoutMode: Center;
                  FlexWeight: 1;
                  Group {
                    Anchor: (Width: 75, Height: 75);
                    Padding: (Full: 3);
                    Background: #658db4;
                    Group {
                      Anchor: (Full: 1);
                      Background: #080c12;
                    }
                  }
                }
              }
              Group {
                Anchor: (Height: 80);
                LayoutMode: Left;
                Group {
                  LayoutMode: Center;
                  FlexWeight: 1;
                  Group {
                    Anchor: (Width: 75, Height: 75);
                    Padding: (Full: 3);
                    Background: #658db4;
                    Group {
                      Anchor: (Full: 1);
                      Background: #080c12;
                    }
                  }
                }
                Group {
                  LayoutMode: Center;
                  FlexWeight: 1;
                  Group {
                    Anchor: (Width: 75, Height: 75);
                    Padding: (Full: 3);
                    Background: #658db4;
                    Group {
                      Anchor: (Full: 1);
                      Background: #080c12;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    Group #TreePanelBorder {
      Padding: (Full: 10);
      LayoutMode: Top;
      FlexWeight: 2.5;
      Background: #513e22;
      Group #TreePanelInner {
        LayoutMode: Top;
        FlexWeight: 1;
        Background: #1a2a3a;
        Group #TitleBanner {
          Anchor: (Height: 60, Top: -10);
          Padding: (Full: 4);
          LayoutMode: CenterMiddle;
          Background: #2a4c6a;
          Group {
            Anchor: (Full: 1);
            LayoutMode: CenterMiddle;
            Background: #4578a1;
            Label {
              Text: "TRADER";
              Background: #2a4c6a;
              Style: (FontSize: 36, TextColor: #ffffff, RenderBold: true);
            }
          }
        }
        Group #TreeCanvas {
          LayoutMode: CenterMiddle;
          FlexWeight: 1;
          Group #TreeStructure {
            Anchor: (Width: 700, Height: 330);
            LayoutMode: Top;
            Group {
              Anchor: (Height: 80);
              LayoutMode: Center;
              Group {
                Anchor: (Width: 80, Height: 80);
                Padding: (Full: 4);
                Background: #888888;
                Group {
                  Anchor: (Full: 1);
                  Background: #080c12;
                }
              }
            }
            Group {
              Anchor: (Height: 30);
              LayoutMode: Center;
              Group {
                Anchor: (Full: 1);
                LayoutMode: Left;
                Group {
                  LayoutMode: Center;
                  FlexWeight: 1;
                  Group {
                    Anchor: (Full: 1);
                    Background: #a8bacc;
                  }
                }
                Group {
                  LayoutMode: Center;
                  FlexWeight: 1;
                  Group {
                    Anchor: (Full: 1);
                    Background: #a8bacc;
                  }
                }
              }
            }
            Group {
              Anchor: (Height: 80);
              LayoutMode: Left;
              Group {
                LayoutMode: Center;
                FlexWeight: 1;
                Group {
                  Anchor: (Width: 80, Height: 80);
                  Padding: (Full: 4);
                  Background: #528fc4;
                  Group {
                    Anchor: (Full: 1);
                    Background: #080c12;
                  }
                  Group {
                    Anchor: (Width: 25, Height: 25, Bottom: -10, Right: -10);
                    LayoutMode: CenterMiddle;
                    Background: #3a4b5c;
                    Label {
                      Text: "2";
                      Style: (FontSize: 14, TextColor: #FFFFFF);
                    }
                  }
                }
              }
              Group {
                LayoutMode: Center;
                FlexWeight: 1;
                Group {
                  Anchor: (Width: 80, Height: 80);
                  Padding: (Full: 4);
                  Background: #528fc4;
                  Group {
                    Anchor: (Full: 1);
                    Background: #080c12;
                  }
                }
              }
              Group {
                LayoutMode: Center;
                FlexWeight: 1;
                Group {
                  Anchor: (Width: 80, Height: 80);
                  Padding: (Full: 4);
                  Background: #888888;
                  Group {
                    Anchor: (Full: 1);
                    Background: #080c12;
                  }
                }
              }
            }
            Group {
              Anchor: (Height: 50);
              LayoutMode: Left;
              Group {
                LayoutMode: Center;
                FlexWeight: 1;
                Group {
                  Anchor: (Full: 1);
                  Background: #528fc4;
                }
              }
              Group {
                LayoutMode: Center;
                FlexWeight: 1;
                Group {
                  Anchor: (Full: 1);
                  LayoutMode: Left;
                  Group {
                    LayoutMode: Center;
                    FlexWeight: 1;
                    Group {
                      Anchor: (Full: 1);
                      Background: #528fc4;
                    }
                  }
                  Group {
                    LayoutMode: Center;
                    FlexWeight: 1;
                    Group {
                      Anchor: (Full: 1);
                      Background: #a8bacc;
                    }
                  }
                }
              }
              Group {
                LayoutMode: Center;
                FlexWeight: 1;
                Group {
                  Anchor: (Full: 1);
                  Background: #528fc4;
                }
              }
            }
            Group {
              Anchor: (Height: 80);
              LayoutMode: Left;
              Group {
                LayoutMode: Center;
                FlexWeight: 1;
                Group {
                  Anchor: (Width: 80, Height: 80);
                  Padding: (Full: 4);
                  Background: #528fc4;
                  Group {
                    Anchor: (Full: 1);
                    Background: #080c12;
                  }
                  Group {
                    Anchor: (Width: 25, Height: 25, Bottom: -10, Right: -10);
                    LayoutMode: CenterMiddle;
                    Background: #3a4b5c;
                    Label {
                      Text: "4";
                      Style: (FontSize: 14, TextColor: #FFFFFF);
                    }
                  }
                }
              }
              Group {
                Anchor: (Right: 20);
                LayoutMode: Right;
                FlexWeight: 0.5;
                Group {
                  Anchor: (Width: 80, Height: 80);
                  Padding: (Full: 4);
                  Background: #528fc4;
                  Group {
                    Anchor: (Full: 1);
                    Background: #080c12;
                  }
                  Group {
                    Anchor: (Width: 25, Height: 25, Bottom: -10, Right: -10);
                    LayoutMode: CenterMiddle;
                    Background: #3a4b5c;
                    Label {
                      Text: "5";
                      Style: (FontSize: 14, TextColor: #FFFFFF);
                    }
                  }
                }
              }
              Group {
                Anchor: (Left: 20);
                LayoutMode: Left;
                FlexWeight: 0.5;
                Group {
                  Anchor: (Width: 80, Height: 80);
                  Padding: (Full: 4);
                  Background: #528fc4;
                  Group {
                    Anchor: (Full: 1);
                    Background: #080c12;
                  }
                  Group {
                    Anchor: (Width: 25, Height: 25, Bottom: -10, Right: -10);
                    LayoutMode: CenterMiddle;
                    Background: #3a4b5c;
                    Label {
                      Text: "2";
                      Style: (FontSize: 14, TextColor: #FFFFFF);
                    }
                  }
                }
              }
              Group {
                LayoutMode: Center;
                FlexWeight: 1;
                Group {
                  Anchor: (Width: 80, Height: 80);
                  Padding: (Full: 4);
                  Background: #528fc4;
                  Group {
                    Anchor: (Full: 1);
                    Background: #080c12;
                  }
                }
              }
            }
          }
        }
        Group #BottomBarBorder {
          Anchor: (Height: 120);
          Padding: (Full: 4);
          LayoutMode: Top;
          Background: #c19a5b;
          Group #BottomBarInner {
            Padding: (Full: 20);
            LayoutMode: Left;
            FlexWeight: 1;
            Background: #101c2a;
            Group {
              LayoutMode: CenterMiddle;
              FlexWeight: 1;
              Label {
                Text: "TALENT POINTS LEFT: 15";
                Style: (FontSize: 20, TextColor: #FFFFFF, RenderBold: true, HorizontalAlignment: Center);
              }
            }
            Group {
              LayoutMode: Top;
              FlexWeight: 1;
              Button {
                Anchor: (Width: 180, Height: 35, Bottom: 10);
                Background: #000000;
                Group {
                  Anchor: (Full: 1);
                  LayoutMode: CenterMiddle;
                  Background: #378a00(0.3);
                  Label {
                    Text: "+ ADD POINTS";
                    Style: (TextColor: #ffffff, RenderBold: true);
                  }
                }
              }
              Button {
                Anchor: (Width: 180, Height: 35);
                Background: #c19a5b;
                Group {
                  Anchor: (Full: 1);
                  LayoutMode: CenterMiddle;
                  Background: #750000;
                  Label {
                    Text: "- TAKE POINTS";
                    Style: (TextColor: #ffffff, RenderBold: true);
                  }
                }
              }
            }
            Group {
              LayoutMode: CenterMiddle;
              FlexWeight: 1;
              Button {
                Anchor: (Width: 160, Height: 45);
                Background: #c19a5b;
                Group {
                  Anchor: (Full: 1);
                  LayoutMode: CenterMiddle;
                  Background: #000000;
                  Label {
                    Text: "DONE";
                    Style: (FontSize: 20, TextColor: #FFFFFF, RenderBold: true);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`
  },
  {
    id: "guild-manager",
    name: "Guild Manager",
    description: "A social panel for guild management with lists, headers, and contextual actions.",
    image: "/screenshots/guild-manager-exported.png",
    xml: `
Group #GuildManagerScreen {
  LayoutMode: CenterMiddle;
  Group #Window {
    Anchor: (Width: 900, Height: 650);
    LayoutMode: Top;
    Background: #141414;
    Group #Header {
      Anchor: (Height: 60);
      Padding: (Left: 20, Right: 20);
      LayoutMode: Left;
      Background: #0D0D0D;
      Label #Logo {
        Text: "🛡";
        Anchor: (Width: 40);
        Style: (FontSize: 24, TextColor: #FFB000, VerticalAlignment: Center);
      }
      Label #Title {
        Text: "Guild System";
        FlexWeight: 1;
        Style: (FontSize: 20, TextColor: #FFFFFF, RenderBold: true, VerticalAlignment: Center);
      }
    }
    Group #Body {
      LayoutMode: Left;
      FlexWeight: 1;
      Group #Sidebar {
        Anchor: (Width: 200);
        Padding: (Top: 20, Bottom: 20, Left: 10, Right: 10);
        LayoutMode: Top;
        Background: #1A1A1A;
        Button #BtnDashboard {
          Anchor: (Height: 40, Bottom: 5);
          Background: #2A2A2A;
          Label {
            Text: "Dashboard";
            Style: (TextColor: #FFB000, HorizontalAlignment: Center);
          }
        }
        Button #BtnGuilds {
          Anchor: (Height: 40, Bottom: 5);
          Background: #1F1F1F;
          Label {
            Text: "Guilds";
            Style: (TextColor: #DDDDDD, HorizontalAlignment: Center, VerticalAlignment: Center);
          }
        }
        Button #BtnMembers {
          Anchor: (Height: 40, Bottom: 5);
          Background: #1F1F1F;
          Label {
            Text: "Members";
            Style: (TextColor: #DDDDDD, HorizontalAlignment: Center, VerticalAlignment: Center);
          }
        }
        Button #BtnEvents {
          Anchor: (Height: 40, Bottom: 5);
          Background: #1F1F1F;
          Label {
            Text: "Events";
            Style: (TextColor: #DDDDDD, HorizontalAlignment: Center, VerticalAlignment: Center);
          }
        }
        Button #BtnCalendar {
          Anchor: (Height: 40, Bottom: 5);
          Background: #1F1F1F;
          Label {
            Text: "Calendar";
            Style: (TextColor: #DDDDDD, HorizontalAlignment: Center, VerticalAlignment: Center);
          }
        }
        Button #BtnReports {
          Anchor: (Height: 40, Bottom: 5);
          Background: #1F1F1F;
          Label {
            Text: "Reports";
            Style: (TextColor: #DDDDDD, HorizontalAlignment: Center, VerticalAlignment: Center);
          }
        }
        Button #BtnConfig {
          Anchor: (Height: 40);
          Background: #1F1F1F;
          Label {
            Text: "Settings";
            Style: (TextColor: #DDDDDD, HorizontalAlignment: Center, VerticalAlignment: Center);
          }
        }
      }
      Group #MainContent {
        Padding: (Full: 20);
        LayoutMode: Top;
        FlexWeight: 1;
        Background: #111111;
        Label #SectionTitle {
          Text: "General Stats";
          Anchor: (Bottom: 15);
          Style: (FontSize: 22, TextColor: #FFFFFF, RenderBold: true);
        }
        Group #StatsRow {
          Anchor: (Height: 80, Bottom: 25);
          LayoutMode: Left;
          Group #StatGuilds {
            Anchor: (Right: 15);
            LayoutMode: MiddleCenter;
            FlexWeight: 1;
            Background: #1A1A1A;
            Label #StatGuildsTitle {
              Text: "Total Guilds";
              Style: (FontSize: 14, TextColor: #AAAAAA, HorizontalAlignment: Center);
            }
            Label #StatGuildsValue {
              Text: "142";
              Style: (FontSize: 24, TextColor: #FFB000, RenderBold: true, HorizontalAlignment: Center);
            }
          }
          Group #StatMembers {
            Anchor: (Right: 15);
            LayoutMode: MiddleCenter;
            FlexWeight: 1;
            Background: #1A1A1A;
            Label #StatMembersTitle {
              Text: "Total Members";
              Style: (FontSize: 14, TextColor: #AAAAAA, HorizontalAlignment: Center);
            }
            Label #StatMembersValue {
              Text: "3,845";
              Style: (FontSize: 24, TextColor: #44AAFF, RenderBold: true, HorizontalAlignment: Center);
            }
          }
          Group #StatEvents {
            LayoutMode: MiddleCenter;
            FlexWeight: 1;
            Background: #1A1A1A;
            Label #StatEventsTitle {
              Text: "Active Events";
              Style: (FontSize: 14, TextColor: #AAAAAA, HorizontalAlignment: Center);
            }
            Label #StatEventsValue {
              Text: "7";
              Style: (FontSize: 24, TextColor: #55FF55, RenderBold: true, HorizontalAlignment: Center);
            }
          }
        }
        Label #EventsTitle {
          Text: "Upcoming Events";
          Anchor: (Bottom: 10);
          Style: (FontSize: 18, TextColor: #FFFFFF, RenderBold: true);
        }
        Group #EventsList {
          Anchor: (Height: 90, Bottom: 25);
          Padding: (Full: 15);
          LayoutMode: Top;
          Background: #1A1A1A;
          Group #Event1 {
            Anchor: (Height: 30, Bottom: 5);
            LayoutMode: Left;
            Label #E1Name {
              Text: "⚔ Territorial War";
              FlexWeight: 1;
              Style: (FontSize: 14, TextColor: #FFAA00, VerticalAlignment: Center);
            }
            Label #E1Date {
              Text: "15/06 - 20:00";
              Anchor: (Width: 150);
              Style: (FontSize: 14, TextColor: #AAAAAA, HorizontalAlignment: End, VerticalAlignment: Center);
            }
          }
          Group #Event2 {
            Anchor: (Height: 30);
            LayoutMode: Left;
            Label #E2Name {
              Text: "🐉 Dragon Raid";
              FlexWeight: 1;
              Style: (FontSize: 14, TextColor: #FF5555, VerticalAlignment: Center);
            }
            Label #E2Date {
              Text: "17/06 - 21:00";
              Anchor: (Width: 150);
              Style: (FontSize: 14, TextColor: #AAAAAA, HorizontalAlignment: End, VerticalAlignment: Center);
            }
          }
        }
        Label #GuildsTitle {
          Text: "Featured Guilds";
          Anchor: (Bottom: 10);
          Style: (FontSize: 18, TextColor: #FFFFFF, RenderBold: true);
        }
        Group #GuildsTable {
          LayoutMode: Top;
          FlexWeight: 1;
          Background: #1A1A1A;
          Group #TableHeader {
            Anchor: (Height: 35);
            Padding: (Left: 15, Right: 15);
            LayoutMode: Left;
            Background: #222222;
            Label #ThName {
              Text: "Name";
              FlexWeight: 4;
              Style: (FontSize: 14, TextColor: #AAAAAA, VerticalAlignment: Center);
            }
            Label #ThLeader {
              Text: "Leader";
              FlexWeight: 3;
              Style: (FontSize: 14, TextColor: #AAAAAA, VerticalAlignment: Center);
            }
            Label #ThMembers {
              Text: "Members";
              FlexWeight: 2;
              Style: (FontSize: 14, TextColor: #AAAAAA, VerticalAlignment: Center);
            }
            Label #ThStatus {
              Text: "Status";
              FlexWeight: 2;
              Style: (FontSize: 14, TextColor: #AAAAAA, VerticalAlignment: Center);
            }
          }
          Group #TableRow1 {
            Anchor: (Height: 45);
            Padding: (Left: 15, Right: 15);
            LayoutMode: Left;
            Background: #1D1D1D;
            Label #Td1Name {
              Text: "🛡 Valhalla";
              FlexWeight: 4;
              Style: (FontSize: 14, TextColor: #FFFFFF, VerticalAlignment: Center);
            }
            Label #Td1Leader {
              Text: "Ragnar";
              FlexWeight: 3;
              Style: (FontSize: 14, TextColor: #DDDDDD, VerticalAlignment: Center);
            }
            Label #Td1Members {
              Text: "45";
              FlexWeight: 2;
              Style: (FontSize: 14, TextColor: #DDDDDD, VerticalAlignment: Center);
            }
            Label #Td1Status {
              Text: "Active";
              FlexWeight: 2;
              Style: (FontSize: 14, TextColor: #55FF55, VerticalAlignment: Center);
            }
          }
          Group #TableRow2 {
            Anchor: (Height: 45);
            Padding: (Left: 15, Right: 15);
            LayoutMode: Left;
            Background: #1A1A1A;
            Label #Td2Name {
              Text: "🌙 Eclipse";
              FlexWeight: 4;
              Style: (FontSize: 14, TextColor: #FFFFFF, VerticalAlignment: Center);
            }
            Label #Td2Leader {
              Text: "Luna";
              FlexWeight: 3;
              Style: (FontSize: 14, TextColor: #DDDDDD, VerticalAlignment: Center);
            }
            Label #Td2Members {
              Text: "32";
              FlexWeight: 2;
              Style: (FontSize: 14, TextColor: #DDDDDD, VerticalAlignment: Center);
            }
            Label #Td2Status {
              Text: "Active";
              FlexWeight: 2;
              Style: (FontSize: 14, TextColor: #55FF55, VerticalAlignment: Center);
            }
          }
        }
      }
    }
  }
}
`
  },
  {
    id: "npc-interaction",
    name: "NPC Interaction",
    description: "A dynamic dialogue window with character portrait, mood indicators, and dialogue choices.",
    image: "/screenshots/npc-interaction-exported.png",
    xml: `
Group {
  LayoutMode: MiddleCenter;
  Background: #00000099;
  Group #MainPanel {
    Anchor: (Width: 560, Height: 720);
    LayoutMode: Full;
    Background: #222222FF;
    Label #NpcName {
      Text: "Cookie";
      Anchor: (Width: 240, Height: 50, Top: 42);
      Style: (FontSize: 34, TextColor: #FFFFFFFF, RenderUppercase: true, HorizontalAlignment: Center, VerticalAlignment: Center);
    }
    Label #NpcMood {
      Text: "Mood: Happy";
      Anchor: (Width: 220, Height: 28, Top: 92);
      Style: (FontSize: 18, TextColor: #AAAAAAFF, RenderBold: true, RenderUppercase: true, HorizontalAlignment: Center, VerticalAlignment: Center);
    }
    Group #NpcPortrait {
      Anchor: (Width: 180, Height: 180, Top: 140);
      Background: #6f0101;
    }
    Label #NpcDialogue {
      Text: "Hey, Cookie.";
      Anchor: (Width: 420, Height: 70, Top: 340);
      Background: #1f1fd6;
      Style: (FontSize: 22, TextColor: #FFFFFFFF, HorizontalAlignment: Center, VerticalAlignment: Center);
    }
    Button #ChatButton {
      Anchor: (Width: 360, Height: 54, Top: 440);
      Background: #444444FF;
      Label {
        Text: "Chat";
        Anchor: (Top: 0, Bottom: 0, Left: 0, Right: 0);
        Style: (FontSize: 22, TextColor: #FFFFFFFF, HorizontalAlignment: Center, VerticalAlignment: Center);
      }
    }
    Button #JokeButton {
      Anchor: (Width: 360, Height: 54, Top: 504);
      Background: #444444FF;
      Label {
        Text: "Tell a Joke";
        Anchor: (Top: 0, Bottom: 0, Left: 0, Right: 0);
        Style: (FontSize: 22, TextColor: #FFFFFFFF, HorizontalAlignment: Center, VerticalAlignment: Center);
      }
    }
    Button #FlirtButton {
      Anchor: (Width: 360, Height: 54, Top: 568);
      Background: #444444FF;
      Label {
        Text: "Flirt";
        Anchor: (Top: 0, Bottom: 0, Left: 0, Right: 0);
        Style: (FontSize: 22, TextColor: #FFFFFFFF, HorizontalAlignment: Center, VerticalAlignment: Center);
      }
    }
    Button #InsultButton {
      Anchor: (Width: 170, Height: 50, Top: 632, Left: 100);
      Background: #662222FF;
      Label {
        Text: "Insult";
        Anchor: (Top: 0, Bottom: 0, Left: 0, Right: 0);
        Style: (FontSize: 18, TextColor: #FFFFFFFF, HorizontalAlignment: Center, VerticalAlignment: Center);
      }
    }
    Button #GiftButton {
      Anchor: (Width: 170, Height: 50, Top: 632, Right: 100);
      Background: #226622FF;
      Label {
        Text: "Give Gift";
        Anchor: (Top: 0, Bottom: 0, Left: 0, Right: 0);
        Style: (FontSize: 18, TextColor: #FFFFFFFF, HorizontalAlignment: Center, VerticalAlignment: Center);
      }
    }
  }
}
`
  }
];

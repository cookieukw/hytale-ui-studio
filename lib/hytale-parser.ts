import { HytaleComponent, ComponentType } from "./hytale-types";

// --- Types ---

interface ASTNode {
  type: string;
  id: string | null;
  props: Record<string, any>;
  children: ASTNode[];
  alias?: string;
}

export class ParserError extends Error {
  constructor(
    public code: string,
    public args: string[],
    public line: number,
  ) {
    super(`Error at line ${line}: ${code} ${args.join(" ")}`);
    this.name = "ParserError";
  }
}

// --- Lexer ---

export class HytaleLexer {
  input: string;
  tokens: any[];
  pos: number;
  line: number;

  constructor(input: string) {
    this.input = input;
    this.tokens = [];
    this.pos = 0;
    this.line = 1;
  }

  tokenize() {
    while (this.pos < this.input.length) {
      let char = this.input[this.pos];

      if (char === "\n") {
        this.line++;
        this.pos++;
        continue;
      }

      if (/\s/.test(char)) {
        this.pos++;
        continue;
      }

      if (char === "/" && this.input[this.pos + 1] === "/") {
        while (this.pos < this.input.length && this.input[this.pos] !== "\n") {
          this.pos++;
        }
        continue;
      }

      if (
        /[0-9]/.test(char) ||
        (char === "-" && /[0-9]/.test(this.input[this.pos + 1]))
      ) {
        let val = "";
        if (char === "-") {
          val += "-";
          this.pos++;
        }
        while (
          this.pos < this.input.length &&
          /[0-9.\-a-fA-Fx]/.test(this.input[this.pos])
        ) {
          val += this.input[this.pos];
          this.pos++;
        }
        this.tokens.push({ type: "VALUE", value: val, line: this.line });
        continue;
      }

      if (char === '"') {
        let val = "";
        this.pos++;
        while (this.pos < this.input.length && this.input[this.pos] !== '"') {
          if (this.input[this.pos] === "\n") this.line++;
          val += this.input[this.pos];
          this.pos++;
        }
        this.pos++;
        this.tokens.push({ type: "STRING", value: val, line: this.line });
        continue;
      }

      if (/[a-zA-Z0-9_@#.$%]/.test(char)) {
        let val = "";
        while (
          this.pos < this.input.length &&
          /[a-zA-Z0-9_@#.$%\-]/.test(this.input[this.pos])
        ) {
          // Check if we hit a punctuation that isn't part of the identifier
          // But wait, the regex allows some chars.
          // The user's regex was /[a-zA-Z0-9_@#.$%\-]/
          val += this.input[this.pos];
          this.pos++;
        }
        this.tokens.push({ type: "IDENT", value: val, line: this.line });
        continue;
      }

      if (
        /[{}();:,=+\/*\-]/.test(char) ||
        char === "[" ||
        char === "]" ||
        char === "%"
      ) {
        this.tokens.push({ type: "PUNCT", value: char, line: this.line });
        this.pos++;
        continue;
      }

      this.pos++;
    }
    return this.tokens;
  }
}

// --- Parser ---

export class HytaleParser {
  tokens: any[];
  pos: number;
  variables: any;

  imports: string[] = [];

  constructor(tokens: any[], globalScope = {}) {
    this.tokens = tokens;
    this.pos = 0;
    this.variables = {
      ...globalScope,
      $C: {
        props: {
          "@DefaultLabelStyle": {
            props: { FontSize: 14, TextColor: "#ffffff" },
          },
          "@Title": {
            props: { FontSize: 20, RenderBold: true, TextColor: "#f0f0f0" },
          },
          "@PageOverlay": {
            props: {
              LayoutMode: "Middle",
              Anchor: { Top: 0, Bottom: 0, Left: 0, Right: 0 },
            },
          },
        },
      },
    };
  }

  peek() {
    return this.tokens[this.pos];
  }

  resolveVariable(name: string) {
    if (name.includes(".")) {
      const parts = name.split(".");
      let current = this.variables[parts[0]];
      for (let i = 1; i < parts.length; i++) {
        if (!current) return null;
        current = current.props ? current.props[parts[i]] : null;
      }
      return current;
    }
    return this.variables[name];
  }

  consume(expectedValue: string | null = null) {
    if (this.pos >= this.tokens.length) {
      const lastLine =
        this.tokens.length > 0 ? this.tokens[this.tokens.length - 1].line : 1;
      throw new ParserError("errorUnexpectedEnd", [], lastLine);
    }

    const token = this.tokens[this.pos++];

    if (expectedValue && token.value !== expectedValue) {
      throw new ParserError(
        "errorExpected",
        [expectedValue, token.value],
        token.line,
      );
    }

    return token;
  }

  isAtEnd() {
    return this.pos >= this.tokens.length;
  }

  parse(): { nodes: ASTNode[]; imports: string[] } {
    const nodes: ASTNode[] = [];
    while (!this.isAtEnd()) {
      const node = this.parseStatement();
      if (node) nodes.push(node as ASTNode);
    }
    return { nodes, imports: this.imports };
  }

  parseStatement() {
    const token = this.peek();

    if (
      token.type === "IDENT" &&
      token.value.startsWith("@") &&
      this.tokens[this.pos + 1]?.value === "="
    ) {
      const name = this.consume().value;
      this.consume("=");

      const nextToken = this.peek();
      const afterNext = this.tokens[this.pos + 1];

      let isElementDef = false;

      if (nextToken.type === "IDENT" && afterNext && afterNext.value === "{") {
        isElementDef = true;
      } else if (
        nextToken.type === "IDENT" &&
        afterNext &&
        afterNext.value.startsWith("#")
      ) {
        isElementDef = true;
      } else if (
        nextToken.type === "IDENT" &&
        nextToken.value.startsWith("@") &&
        afterNext &&
        (afterNext.value.startsWith("#") || afterNext.value === "{")
      ) {
        // Handle Template Instantiation inside Variable Assignment? @MyVar = @Template #ID ...
        // Or just alias assignment: @MyAlias = @Template ...
        isElementDef = true;
      }

      if (isElementDef) {
        const element = this.parseElement();
        if (!this.isAtEnd() && this.peek().value === ";") this.consume();
        this.variables[name] = element;
        return null;
      } else {
        const val = this.parseExpression();
        if (!this.isAtEnd() && this.peek().value === ";") this.consume();
        this.variables[name] = val;
        return null;
      }
    }

    if (token.value.startsWith("$")) {
      // Check for assignment: $Var = "..."
      if (this.tokens[this.pos + 1]?.value === "=") {
        const varNameToken = this.consume();
        this.consume("=");
        const valToken = this.consume(); // Assuming string or value

        // Capture the full import line roughly for regeneration
        // Or store structured data. For simplicity, we reconstruct the string or just store the line.
        // The requirement is mostly to preserve it.
        // Let's store: `$C = "path/to/file"`
        let val = valToken.value;
        if (valToken.type === "STRING") {
          val = `"${val}"`;
        }

        this.imports.push(`${varNameToken.value} = ${val};`);

        if (!this.isAtEnd() && this.peek().value === ";") this.consume();
        return null;
      }

      // If it's not an assignment, it might be a component usage like $C.@Title { ... }
      // Fall through to parseElement if it looks like start of element?
      // Actually, parseElement starts with consume(), so we can just let it handle it
      // providing we don't consume it here.
    }

    return this.parseElement();
  }

  parseElement(): ASTNode {
    const typeToken = this.consume();
    const rawType = typeToken.value;

    // Check if it's an alias/variable usage
    let alias: string | null = null;
    let type = rawType.split(".").pop()!.replace("@", "");

    if (
      rawType.includes(".") ||
      rawType.startsWith("$") ||
      rawType.startsWith("@")
    ) {
      alias = rawType;
      // Logic to determine fallback type?
      // If the alias resolves to a known type (e.g. via internal defaults), we could use that.
      // For now, default unknown aliases to "Group" or "Label" based on name?
      // Safest is "Group" if unknown, but we want to display it properly.
      // If the alias ends in "Title", maybe it's a Label?
      // But for editor safety, "Group" is the most flexible container.
    }

    let id = null;

    if (!this.isAtEnd() && this.peek().value.startsWith("#"))
      id = this.consume().value.substring(1);

    if (this.isAtEnd() || this.peek().value !== "{") {
      return { type, id, props: {}, children: [], alias: alias || undefined };
    }

    this.consume("{");

    let baseNode: any = null;
    if (alias) {
      const resolved = this.resolveVariable(alias);
      if (resolved && resolved.type) {
        baseNode = JSON.parse(JSON.stringify(resolved));
        type = baseNode.type;
      }
    }

    const props: Record<string, any> = baseNode ? baseNode.props : {};
    const children: ASTNode[] = baseNode ? baseNode.children : [];

    let childrenStarted = false;

    while (!this.isAtEnd() && this.peek().value !== "}") {
      const lookahead = this.peek();
      const nextToken = this.tokens[this.pos + 1];

      if (lookahead.value.startsWith("...")) {
        if (childrenStarted) {
          throw new ParserError(
            "errorOrder",
            ["Mixin", "Children"],
            lookahead.line,
          );
        }

        const token = this.consume();
        let varName = token.value;

        if (varName === "...") {
          const next = this.consume();
          varName = next.value;
        } else {
          varName = varName.substring(3);
        }

        if (varName.endsWith(",") || varName.endsWith(";")) {
          varName = varName.slice(0, -1);
        }

        const sourceObj = this.resolveVariable(varName);
        if (sourceObj) {
          if (sourceObj.props) deepMerge(props, sourceObj.props);
          else deepMerge(props, sourceObj);
        }

        if (
          !this.isAtEnd() &&
          (this.peek().value === "," || this.peek().value === ";")
        ) {
          this.consume();
        }
      } else if (lookahead.type === "IDENT" && nextToken?.value === ":") {
        if (childrenStarted) {
          throw new ParserError(
            "errorOrder",
            [lookahead.value, "Children"],
            lookahead.line,
          );
        }

        const key = this.consume().value;
        this.consume(":");
        const val = this.parseExpression();
        props[key] = val;

        if (
          !this.isAtEnd() &&
          (this.peek().value === ";" || this.peek().value === ",")
        )
          this.consume();
      } else {
        const child = this.parseStatement();
        if (child) {
          childrenStarted = true;
          children.push(child as ASTNode);
        }
      }
    }

    this.consume("}");
    return { type, id, props, children, alias: alias || undefined };
  }

  parseExpression() {
    let left = this.parseValue();

    while (!this.isAtEnd()) {
      const peek = this.peek();

      if (["+", "-", "*", "/"].includes(peek.value)) {
        const op = this.consume().value;
        const right = this.parseValue();
        left = this.evaluateMath(left, op, right);
      } else {
        break;
      }
    }
    return left;
  }

  evaluateMath(left: any, op: string, right: any) {
    const l = parseFloat(left);
    const r = parseFloat(right);

    if (isNaN(l) || isNaN(r)) return left;

    switch (op) {
      case "+":
        return l + r;
      case "-":
        return l - r;
      case "*":
        return l * r;
      case "/":
        return l / r;
      default:
        return left;
    }
  }

  parseValue() {
    if (this.isAtEnd()) throw new ParserError("errorValue", [], 0);
    const token = this.peek();

    if (token.value.startsWith("@")) {
      this.consume();
      return this.variables[token.value] !== undefined
        ? this.variables[token.value]
        : token.value;
    }

    // Translation keys
    if (token.value === "%") {
      this.consume("%");
      const key = this.consume().value;
      // Check for continued parts (dot notation)
      // Since lexer currently breaks on `.`, we might need to consume subsequent parts if they exist?
      // But lexer treats . in identifiers: /[a-zA-Z0-9_@#.$%]/.test(char)
      // Wait, line 94 regex: /[a-zA-Z0-9_@#.$%]/
      // So `%ui.general.test` might be tokenized as `%` then `ui.general.test`.
      // Let's verify lexer behavior for `%`.
      // If `%` is PUNCT, then `%ui` -> `%` and `ui`.
      // If lexer regex includes `%` or `.`, it might be one token?
      // Ah, line 94 includes `%`. So `%ui.general.test` is parsed as IDENT "%ui.general.test".
      // But in `parseValue`, `if (/[{}();:,=+\/*\-]/.test(char) || char === "[" || char === "]" || char === "%")` makes it split?
      // No, I added `%` to the PUNCT list in the new code above.
      // So `%ui.general.test` becomes `%` (PUNCT) and `ui.general.test` (IDENT).
      return `%${key}`;
    }

    if (token.value.startsWith("%")) {
      // If lexer didn't split it (e.g. if code was parsed before my change, or if regex catches it first?)
      // The regex at line 94 checks /[a-zA-Z0-9_@#.$%]/.
      // If `%` is handled as PUNCT BEFORE IDENT, then it works.
      // Lexer order: lines 110 check PUNCT. line 94 checks IDENT.
      // So if `%` is in PUNCT check, it wins if it appears first.
      // Wait, lexer iterates char by char.
      // If char is `%`, it hits PUNCT check first IF I place it before IDENT check?
      // In original code, PUNCT check is AFTER IDENT check.
      // So `%` in IDENT regex means `%foo` is one IDENT token.
      // I need to REMOVE `%` from IDENT regex if I want to treat it as separate operator, OR just handle `%...` as IDENT.
      // Given existing regex, `%ui.general` is likely one IDENT token.
      // So checking `startsWith("%")` handles the combined case.
      // checking `token.value === "%"` handles the split case (e.g. `% ui.general` with space).
      // Let's keep `startsWith("%")` logic first if needed.
      this.consume();
      return token.value;
    }

    if (token.value.startsWith("#")) {
      const hexBase = token.value.split("(")[0];
      if (hexBase.length === 7) {
        // Check for extended alpha syntax: #RRGGBB(0.5)
        if (this.tokens[this.pos + 1]?.value === "(") {
          this.consume(); // consume hex
          this.consume("(");
          const alpha = this.consume().value;
          this.consume(")");
          // Combine or return object? Assuming string for now or special color obj.
          // Hytale format: #RRGGBB(A.A) - we can just preserve it as string.
          return `${hexBase}(${alpha})`;
        }
      }

      this.consume();
      // Handle #rrggbbaa (9 chars)
      if (hexBase.length !== 7 && hexBase.length !== 9) {
        // # + 6 or # + 8
        // throw new ParserError("errorShortHex", [hexBase], token.line);
        // Relaxing error
      }
      return token.value;
    }

    if (token.type === "IDENT" && this.tokens[this.pos + 1]?.value === "(") {
      const typeName = this.consume().value;
      this.consume("(");
      const obj: any = this.parseTupleBody();
      obj._type = typeName;
      return obj;
    }

    if (token.value === "(") {
      this.consume("(");
      return this.parseTupleBody();
    }

    if (token.value === "[") {
      this.consume("[");
      const arr = [];
      while (!this.isAtEnd() && this.peek().value !== "]") {
        arr.push(this.parseValue());
        if (this.peek().value === "," || this.peek().value === ";") {
          this.consume();
        }
      }
      this.consume("]");
      return arr;
    }

    this.consume();
    // Normalize Numbers
    if (!isNaN(Number(token.value)) && token.type === "VALUE") {
      return Number(token.value);
    }
    return token.value;
  }

  parseTupleBody() {
    let obj: Record<string, any> = {};

    while (!this.isAtEnd() && this.peek().value !== ")") {
      if (this.peek().value === "," || this.peek().value === ";") {
        this.consume();
        continue;
      }

      if (this.peek().value.startsWith("...")) {
        const token = this.consume();
        let varName = token.value;

        if (varName === "...") {
          const next = this.consume();
          varName = next.value;
        } else {
          varName = varName.substring(3);
        }

        if (varName.endsWith(",") || varName.endsWith(";"))
          varName = varName.slice(0, -1);

        const source = this.resolveVariable(varName);
        if (source) {
          const content = source.props ? source.props : source;
          deepMerge(obj, content);
        }

        if (!this.isAtEnd() && this.peek().value === ",") this.consume();
        continue;
      }

      const keyOrValToken = this.consume();
      const keyOrVal = keyOrValToken.value;

      if (!this.isAtEnd() && this.peek().value === ":") {
        this.consume(":");
        const val = this.parseExpression();
        obj[keyOrVal] = val;
      } else {
        obj["_default_" + Object.keys(obj).length] = keyOrVal;
      }
    }

    this.consume(")");
    return obj;
  }
}

function deepMerge(target: any, source: any) {
  if (!source) return target;

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      deepMerge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
  return target;
}

// --- Adapter to HytaleComponent ---

function generateId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function parseAndMapCode(code: string): {
  components: HytaleComponent[];
  imports: string[];
} {
  try {
    const lexer = new HytaleLexer(code);
    const tokens = lexer.tokenize();
    const parser = new HytaleParser(tokens);
    const result = parser.parse();

    return {
      components: result.nodes.map((node) => mapNodeToComponent(node)),
      imports: result.imports,
    };
  } catch (e) {
    console.error("Parser Error:", e);
    throw e;
  }
}

function mapNodeToComponent(node: ASTNode): HytaleComponent {
  const { type, id, props, children } = node;

  const component: any = {
    id: generateId(),
    name: id || type,
    type: type as ComponentType,
    children: children ? children.map(mapNodeToComponent) : [],
    isVisible: true,
    isLocked: false,
    isExpanded: true,
    alias: node.alias,
  };

  // Helper to safely set nested properties
  const setNested = (obj: any, path: string[], value: any) => {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
  };

  for (const [key, value] of Object.entries(props)) {
    // 1. Direct Object Properties (from Tuples like Anchor: (Top: 10))
    if (key === "Anchor" && typeof value === "object") {
      if (!component.anchor) component.anchor = {};
      if (value.Top !== undefined) component.anchor.top = Number(value.Top);
      if (value.Bottom !== undefined)
        component.anchor.bottom = Number(value.Bottom);
      if (value.Left !== undefined) component.anchor.left = Number(value.Left);
      if (value.Right !== undefined)
        component.anchor.right = Number(value.Right);
      if (value.Width !== undefined) component.anchor.width = value.Width;
      if (value.Height !== undefined) component.anchor.height = value.Height;
      if (value.CenterX !== undefined)
        component.anchor.centerX = Number(value.CenterX);
      if (value.CenterY !== undefined)
        component.anchor.centerY = Number(value.CenterY);
      if (value.Full !== undefined) component.anchor.full = true;
      continue;
    }

    if (key === "Padding" && typeof value === "object") {
      if (!component.padding) component.padding = {};
      if (value.Full !== undefined) {
        const val = Number(value.Full);
        component.padding = { top: val, bottom: val, left: val, right: val };
      }
      if (value.Horizontal !== undefined) {
        const val = Number(value.Horizontal);
        component.padding.left = val;
        component.padding.right = val;
      }
      if (value.Vertical !== undefined) {
        const val = Number(value.Vertical);
        component.padding.top = val;
        component.padding.bottom = val;
      }
      if (value.Top !== undefined) component.padding.top = Number(value.Top);
      if (value.Bottom !== undefined)
        component.padding.bottom = Number(value.Bottom);
      if (value.Left !== undefined) component.padding.left = Number(value.Left);
      if (value.Right !== undefined)
        component.padding.right = Number(value.Right);
      continue;
    }

    // 2. Standard Properties
    if (key === "Format" && typeof value === "object") {
      if (value.MaxDecimalPlaces !== undefined)
        component.maxDecimalPlaces = Number(value.MaxDecimalPlaces);
      if (value.Step !== undefined) component.step = Number(value.Step);
      if (value.MinValue !== undefined) component.min = Number(value.MinValue);
      if (value.MaxValue !== undefined) component.max = Number(value.MaxValue);
      continue;
    }

    if (key === "Visible") {
      component.isVisible = value !== "false" && value !== false;
      continue;
    }
    if (key === "Text") {
      component.text = String(value);
      continue;
    }
    if (key === "Value") {
      component.value = value;
      continue;
    }
    if (key === "Source") {
      component.source = String(value);
      continue;
    }
    if (key === "LayoutMode") {
      component.layoutMode = value;
      continue;
    }
    if (key === "Direction") {
      component.direction = value;
      continue;
    }
    if (key === "FlexWeight") {
      component.flexWeight = Number(value);
      continue;
    }
    if (key === "TextColor") {
      if (!component.textStyle) component.textStyle = {};
      component.textStyle.textColor = String(value);
      continue;
    }
    if (key === "FontSize") {
      if (!component.textStyle) component.textStyle = {};
      component.textStyle.fontSize = Number(value);
      continue;
    }
    if (key === "RenderBold") {
      if (!component.textStyle) component.textStyle = {};
      component.textStyle.renderBold = value === true || value === "true";
      continue;
    }

    if (key === "Style" && typeof value === "object") {
      if (!component.textStyle) component.textStyle = {};
      if (value.FontSize) component.textStyle.fontSize = Number(value.FontSize);
      if (value.Color) component.textStyle.textColor = String(value.Color);
      if (value.RenderBold)
        component.textStyle.renderBold =
          value.RenderBold === true || value.RenderBold === "true";
      if (value.RenderUppercase)
        component.textStyle.renderUppercase =
          value.RenderUppercase === true || value.RenderUppercase === "true";
      if (value.Alignment)
        component.textStyle.alignment = String(value.Alignment) as any;
      if (value.HorizontalAlignment)
        component.textStyle.horizontalAlignment = String(
          value.HorizontalAlignment,
        );
      if (value.VerticalAlignment)
        component.textStyle.verticalAlignment = String(value.VerticalAlignment);
      continue;
    }

    // 3. Dot Notation Keys (Anchor.Top, Background.Color)
    if (key.includes(".")) {
      const parts = key.split(".");
      if (parts[0] === "Anchor") {
        if (!component.anchor) component.anchor = {};
        const sub = parts[1];
        if (sub === "Top") component.anchor.top = Number(value);
        if (sub === "Bottom") component.anchor.bottom = Number(value);
        if (sub === "Left") component.anchor.left = Number(value);
        if (sub === "Right") component.anchor.right = Number(value);
        if (sub === "Width") component.anchor.width = value;
        if (sub === "Height") component.anchor.height = value;
        if (sub === "CenterX") component.anchor.centerX = Number(value);
        if (sub === "CenterY") component.anchor.centerY = Number(value);
        continue;
      }

      if (parts[0] === "Padding") {
        if (!component.padding) component.padding = {};
        const sub = parts[1];
        if (sub === "Top") component.padding.top = Number(value);
        if (sub === "Bottom") component.padding.bottom = Number(value);
        if (sub === "Left") component.padding.left = Number(value);
        if (sub === "Right") component.padding.right = Number(value);
        continue;
      }

      if (parts[0] === "Background") {
        if (!component.background) component.background = {};
        if (parts[1] === "Color") component.background.color = String(value);
        if (parts[1] === "Opacity")
          component.background.opacity = Number(value);
        if (parts[1] === "Border") component.background.border = String(value);
        continue;
      }
    }
  }

  return component;
}

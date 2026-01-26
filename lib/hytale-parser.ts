import { HytaleComponent, ComponentType } from "./hytale-types";

// --- Types ---

interface ASTNode {
  type: string;
  id: string | null;
  props: Record<string, any>;
  children: ASTNode[];
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

      if (/[{}();:,=+\/*\-]/.test(char)) {
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
              Anchor: { Width: "100%", Height: "100%" },
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

  parse(): ASTNode[] {
    const nodes: ASTNode[] = [];
    while (!this.isAtEnd()) {
      const node = this.parseStatement();
      if (node) nodes.push(node as ASTNode);
    }
    return nodes;
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
      while (!this.isAtEnd() && this.peek().value !== ";") this.consume();
      this.consume(";");
      return null;
    }

    return this.parseElement();
  }

  parseElement(): ASTNode {
    const typeToken = this.consume();
    let type = typeToken.value.split(".").pop()!.replace("@", "");
    let id = null;

    if (!this.isAtEnd() && this.peek().value.startsWith("#"))
      id = this.consume().value.substring(1);

    if (this.isAtEnd() || this.peek().value !== "{") {
      return { type, id, props: {}, children: [] };
    }

    this.consume("{");

    const props: Record<string, any> = {};
    const children: ASTNode[] = [];

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
        childrenStarted = true;
        children.push(this.parseElement());
      }
    }

    this.consume("}");
    return { type, id, props, children };
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

    if (token.value.startsWith("#")) {
      const hexBase = token.value.split("(")[0];
      if (hexBase.length === 6) {
        // Warning: short hex? User code throws error, keeping consistency
        // throw new ParserError("errorShortHex", [hexBase], token.line);
        // Relaxing this to match common UX if needed, but following prompt exactly:
        throw new ParserError("errorShortHex", [hexBase], token.line);
      }
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

export function parseAndMapCode(code: string): HytaleComponent[] {
  try {
    const lexer = new HytaleLexer(code);
    const tokens = lexer.tokenize();
    const parser = new HytaleParser(tokens);
    const nodes = parser.parse();

    return nodes.map((node) => mapNodeToComponent(node));
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
      if (value.Top !== undefined) component.padding.top = Number(value.Top);
      if (value.Bottom !== undefined)
        component.padding.bottom = Number(value.Bottom);
      if (value.Left !== undefined) component.padding.left = Number(value.Left);
      if (value.Right !== undefined)
        component.padding.right = Number(value.Right);
      continue;
    }

    // 2. Standard Properties
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

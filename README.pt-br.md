# Hytale UI Studio

[![English](https://img.shields.io/badge/🇺🇸_English-blue.svg)](README.md)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

O Hytale UI Studio é um poderoso editor visual projetado especificamente para criar e gerenciar interfaces de usuário para o **Hytale**. Construído com tecnologias web modernas e empacotado como um aplicativo desktop nativo via **Tauri 2**, ele oferece uma experiência intuitiva de arrastar e soltar, combinada com um editor de código em tempo real e visualização ao vivo.

![Hytale UI Studio Preview](/public/hytale-studio_foreground.png)

---

## 📸 Capturas de Tela

| Lista de Projetos | Editor (Canvas Vazio) | Exemplo de Layout de Login |
|:---:|:---:|:---:|
| ![Projetos](/public/screenshot-projects.png) | ![Editor](/public/screenshot-editor.png) | ![Layout de Login](/public/screenshot-login-layout.png) |

---

## 🚀 Funcionalidades

| Categoria | Funcionalidade | Descrição |
|---|---|---|
| 🎨 **Editor** | Canvas Visual | Arraste e solte componentes para construir sua interface visualmente |
| 🎨 **Editor** | Visualização em Tempo Real | Veja suas alterações instantaneamente com uma visualização renderizada ao vivo |
| 🎨 **Editor** | Modos Design / Blueprint / Split | Alterne entre os modos de design visual, blueprint e dividido |
| 🧩 **Componentes** | Paleta de Componentes | Biblioteca de componentes prontos no estilo Hytale (Group, Panel, Scroll Area, etc.) |
| 🧩 **Componentes** | Componentes de Entrada | Text Field, Number Field e mais |
| 🧩 **Componentes** | UI Importada | Importe e reutilize arquivos de UI dentro dos seus layouts |
| 🌳 **Hierarquia** | Árvore de Componentes | Gerencie estruturas de UI complexas com uma visualização de árvore aninhada |
| 🌳 **Hierarquia** | Workspace Multi-arquivo | Trabalhe com múltiplos arquivos `.ui` em um único projeto |
| 🔍 **Inspetor** | Editor de Propriedades | Ajuste Anchor, Padding, Margin, Layout e mais |
| 🔍 **Inspetor** | Editor de Estilos | Ajuste estilos, herança e propriedades visuais dos componentes |
| 💻 **Código** | Visualização de Código | Acesso direto ao markup `.ui` para usuários avançados |
| 💻 **Código** | Sincronização ao Vivo | Código e canvas visual ficam sincronizados em tempo real |
| 📂 **Projeto** | Gerenciamento de Projetos | Crie, abra, busque e gerencie múltiplos projetos de UI |
| 📂 **Projeto** | Exportação/Importação | Salve e carregue seus designs usando o formato `.ui` |
| ⏪ **Histórico** | Desfazer/Refazer | Suporte completo ao histórico da sessão de edição |
| 📱 **Plataforma** | App Desktop | Aplicativo desktop nativo para Linux e Windows via Tauri 2 |

---

## 📐 Paridade 1:1 com a Engine do Hytale

O Hytale UI Studio não é apenas uma ferramenta básica de desenho — ele implementa uma **emulação 1:1 pixel-perfect da engine proprietária de layout do Hytale** dentro do navegador, usando React e matemática CSS. O canvas visual não é uma aproximação; é uma réplica exata de como o Hytale calcula dimensões, posições e empilhamento.

Aqui está o "suco" técnico por trás dessa emulação:

### 1. O Motor de LayoutMode
No Hytale, o `LayoutMode` dita como os componentes filhos são empilhados. Mapeamos essas regras customizadas nativamente usando Flexbox:
- **Pilhas Direcionais:** `Top` e `Bottom` viram colunas flex verticais. `Left` e `Right` viram linhas flex horizontais.
- **Variantes de Centralização:** O `CenterMiddle` do Hytale (pilha horizontal, centralizada) e o `MiddleCenter` (pilha vertical, centralizada) são traduzidos explicitamente em propriedades de `alignItems` e `justifyContent` específicas para seus eixos.
- **Quebra de Linha (Wrap):** O `LeftCenterWrap` quebra o conteúdo horizontal de forma perfeita usando `flexWrap: "wrap"` enquanto mantém as linhas centralizadas através de `alignContent: "flex-start"`.
- **Sobrescrita Absoluta:** O layout `Full` desativa o flex completamente, ativando um sistema `position: absolute` onde os filhos são posicionados livremente.

### 2. A Mágica do Anchor-para-Margem (Contexto de Stack)
O sistema de `Anchor` do Hytale se comporta de maneira completamente diferente dependendo do `LayoutMode` do pai. Nós fizemos engenharia reversa desse comportamento:
- **No layout `Full`:** As âncoras (`Top`, `Bottom`, `Left`, `Right`) agem como coordenadas absolutas em pixels que definem os limites do componente.
- **Nos layouts de Pilha (Stacks):** *Aqui acontece a mágica.* Se um pai tem `LayoutMode: Top` (uma pilha vertical), `Anchor.Top` e `Anchor.Bottom` deixam de ser coordenadas e se tornam **margens direcionais** (espaço entre os itens). Nossa engine intercepta as definições do Anchor em tempo real e as converte para `marginTop`/`marginBottom` ou `marginLeft`/`marginRight` dependendo do eixo da pilha pai.

### 3. FlexWeight Proporcional
Quando múltiplos elementos competem pelo espaço restante na tela, o Hytale usa o `FlexWeight`. Nós emulamos isso diretamente mapeando o `FlexWeight` para a propriedade CSS `flexGrow`, forçando um `flexBasis: "0%"`. Isso garante que o navegador distribua matematicamente a largura do contêiner exatamente como o processador de UI do Hytale faz.

### 4. Matemática de Box-Sizing e Padding
O Hytale calcula o Padding como uma expansão *aditiva* ao contêiner, e não como um esmagamento interno (squish). Para replicar isso sem quebrar as leis do Flexbox do HTML, nossa engine impõe um modelo estrito de `border-box`, somando manualmente os vetores de `Padding` à largura e altura (`Anchor.Width` e `Anchor.Height`) previamente definidas.

Quando você arrasta e solta um componente no Hytale UI Studio, o que você vê é matematicamente garantido de ser exatamente o que aparecerá no cliente real do jogo através dos comandos de UI.

---

## 🖼️ Do Studio para o Jogo

Como o Hytale UI Studio simula com precisão a engine de layout do jogo, tudo o que você construir no editor aparecerá exatamente igual dentro do Hytale. Abaixo está uma comparação lado a lado dos templates construídos no Studio e como eles se parecem quando renderizados nativamente no cliente do jogo através de mods:

| Hytale UI Studio (Editor) | Hytale Client (No Jogo) |
|:---:|:---:|
| **Sistema de Interação com NPC** <br> ![NPC Editor](/public/screenshots/npc-editor.png) | <br> ![NPC In-Game](/public/screenshots/npc-ingame.png) |
| **Inventário RPG** <br> ![Inventory Editor](/public/screenshots/inventory-editor.png) | <br> ![Inventory In-Game](/public/screenshots/inventory-ingame.png) |
| **Gerenciador de Guildas** <br> ![Guild Editor](/public/screenshots/guild-editor.png) | <br> ![Guild In-Game](/public/screenshots/guild-ingame.png) |
| **Árvore de Habilidades** <br> ![Skills Editor](/public/screenshots/skills-editor.png) | <br> ![Skills In-Game](/public/screenshots/skills-ingame.png) |

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| [Vite](https://vitejs.dev/) | Build tool rápida para frontend |
| [React](https://react.dev/) | Biblioteca de UI |
| [Tauri 2](https://v2.tauri.app/) | Framework de app desktop nativo |
| [Tailwind CSS](https://tailwindcss.com/) | Framework CSS utilitário |
| [Radix UI](https://www.radix-ui.com/) | Componentes de UI acessíveis e sem estilo |
| [Zustand](https://github.com/pmndrs/zustand) | Gerenciamento de estado |
| [Lucide React](https://lucide.dev/) | Ícones bonitos e consistentes |
| [TypeScript](https://www.typescriptlang.org/) | Segurança de tipos e melhor DX |

---

## 📥 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) (Recomendado o mais recente LTS)
- [pnpm](https://pnpm.io/) (ou npm/yarn)
- [Rust](https://rustup.rs/) (para builds do Tauri)

### Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/cookieukw/hytale-ui-studio.git
   ```

2. Instale as dependências:

   ```bash
   pnpm install
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   pnpm tauri:dev
   ```

---

## 📦 Compilação (Build)

Você pode compilar o Hytale UI Studio para Linux e Windows.

### 🐧 Build para Linux (Local)

Para compilar o aplicativo na sua máquina Linux, execute o script fornecido:

```bash
./scripts/build.sh
```

A saída estará em `src-tauri/target/release/bundle/`.

### 🪟 Build para Windows & Linux (CI/CD)

O projeto está configurado com **GitHub Actions**. Toda vez que você fizer push para a branch `main`:
1. Ele compila automaticamente para Windows e Linux.
2. Você pode baixar os binários na aba **Actions** no GitHub.

Para criar um **Release** oficial:
1. Faça push de uma tag começando com `v` (ex: `git tag v3.0.0 && git push --tags`).
2. O GitHub criará automaticamente um rascunho de release com todos os instaladores anexados.

---

## 📄 Licença

Este projeto está licenciado sob a Licença GPL-3.0 - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

_Feito com ❤️ para a comunidade Hytale._

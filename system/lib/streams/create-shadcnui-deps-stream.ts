import type { OpenAIProvider } from "@ai-sdk/openai"
import { type CoreMessage, generateObject } from "ai"
import { z } from "zod"
import { chatPrompt } from "~/system/lib/prompts/chat-prompt"

const allFiles = [
  {
    name: "src/components/ui/accordion.tsx",
    description:
      "A vertically stacked set of interactive headings that each reveal a section of content.",
  },
  {
    name: "src/components/ui/alert.tsx",
    description: "Displays a callout for user attention.",
  },
  {
    name: "src/components/ui/alert-dialog.tsx",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    name: "src/components/ui/aspect-ratio.tsx",
    description: "Displays content within a desired ratio.",
  },
  {
    name: "src/components/ui/avatar.tsx",
    description: "An image element with a fallback for representing the user.",
  },
  {
    name: "src/components/ui/badge.tsx",
    description: "Displays a badge or a component that looks like a badge.",
  },
  {
    name: "src/components/ui/breadcrumb.tsx",
    description:
      "Displays the path to the current resource using a hierarchy of links.",
  },
  {
    name: "src/components/ui/button.tsx",
    description: "Displays a button or a component that looks like a button.",
  },
  {
    name: "src/components/ui/calendar.tsx",
    description:
      "A date field component that allows users to enter and edit date.",
  },
  {
    name: "src/components/ui/card.tsx",
    description: "Displays a card with header, content, and footer.",
  },
  {
    name: "src/components/ui/carousel.tsx",
    description: "A carousel with motion and swipe built using Embla.",
  },
  {
    name: "src/components/ui/chart.tsx",
    description:
      "Beautiful charts. Built using Recharts. Copy and paste into your apps.",
  },
  {
    name: "src/components/ui/checkbox.tsx",
    description:
      "A control that allows the user to toggle between checked and not checked.",
  },
  {
    name: "src/components/ui/collapsible.tsx",
    description: "An interactive component which expands/collapses a panel.",
  },
  {
    name: "src/components/ui/combobox.tsx",
    description:
      "Autocomplete input and command palette with a list of suggestions.",
  },
  {
    name: "src/components/ui/command.tsx",
    description: "Fast, composable, unstyled command menu for React.",
  },
  {
    name: "src/components/ui/context-menu.tsx",
    description:
      "Displays a menu to the user — such as a set of actions or functions — triggered by a button.",
  },
  {
    name: "src/components/ui/table.tsx",
    description: "Powerful table and datagrids built using TanStack Table.",
  },
  {
    name: "src/components/ui/dialog.tsx",
    description:
      "A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.",
  },
  {
    name: "src/components/ui/drawer.tsx",
    description: "A drawer component for React.",
  },
  {
    name: "src/components/ui/dropdown-menu.tsx",
    description:
      "Displays a menu to the user — such as a set of actions or functions — triggered by a button.",
  },
  {
    name: "src/components/ui/hover-card.tsx",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    name: "src/components/ui/input.tsx",
    description:
      "Displays a form input field or a component that looks like an input field.",
  },
  {
    name: "src/components/ui/input-otp.tsx",
    description:
      "Accessible one-time password component with copy paste functionality.",
  },
  {
    name: "src/components/ui/label.tsx",
    description: "Renders an accessible label associated with controls.",
  },
  {
    name: "src/components/ui/menubar.tsx",
    description:
      "A visually persistent menu common in desktop applications that provides quick access to a consistent set of commands.",
  },
  {
    name: "src/components/ui/navigation-menu.tsx",
    description: "A collection of links for navigating websites.",
  },
  {
    name: "src/components/ui/pagination.tsx",
    description: "Pagination with page navigation, next and previous links.",
  },
  {
    name: "src/components/ui/popover.tsx",
    description: "Displays rich content in a portal, triggered by a button.",
  },
  {
    name: "src/components/ui/progress.tsx",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    name: "src/components/ui/radio-group.tsx",
    description:
      "A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.",
  },
  {
    name: "src/components/ui/resizable.tsx",
    description:
      "Accessible resizable panel groups and layouts with keyboard support.",
  },
  {
    name: "src/components/ui/scroll-area.tsx",
    description:
      "Augments native scroll functionality for custom, cross-browser styling.",
  },
  {
    name: "src/components/ui/select.tsx",
    description:
      "Displays a list of options for the user to pick from—triggered by a button.",
  },
  {
    name: "src/components/ui/separator.tsx",
    description: "Visually or semantically separates content.",
  },
  {
    name: "src/components/ui/sheet.tsx",
    description:
      "Extends the Dialog component to display content that complements the main content of the screen.",
  },
  {
    name: "src/components/ui/sidebar.tsx",
    description: "A composable, themeable and customizable sidebar component.",
  },
  {
    name: "src/components/ui/skeleton.tsx",
    description: "Use to show a placeholder while content is loading.",
  },
  {
    name: "src/components/ui/slider.tsx",
    description:
      "An input where the user selects a value from within a given range.",
  },
  {
    name: "src/components/ui/sonner.tsx",
    description: "An opinionated toast component for React.",
  },
  {
    name: "src/components/ui/switch.tsx",
    description:
      "A control that allows the user to toggle between checked and not checked.",
  },
  {
    name: "src/components/ui/table.tsx",
    description: "A responsive table component.",
  },
  {
    name: "src/components/ui/tabs.tsx",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    name: "src/components/ui/textarea.tsx",
    description:
      "Displays a form textarea or a component that looks like a textarea.",
  },
  {
    name: "src/components/ui/toggle.tsx",
    description: "A two-state button that can be either on or off.",
  },
  {
    name: "src/components/ui/toggle-group.tsx",
    description: "A set of two-state buttons that can be toggled on or off.",
  },
  {
    name: "src/components/ui/tooltip.tsx",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
]

const activeFiles = [
  "src/components/ui/button.tsx",
  "src/components/ui/avatar.tsx",
  "src/components/ui/badge.tsx",
  "src/components/ui/breadcrumb.tsx",
  "src/components/ui/button.tsx",
  "src/components/ui/calendar.tsx",
  "src/components/ui/card.tsx",
  "src/components/ui/carousel.tsx",
  "src/components/ui/chart.tsx",
  "src/components/ui/checkbox.tsx",
  "src/components/ui/collapsible.tsx",
  "src/components/ui/input.tsx",
  "src/components/ui/input-otp.tsx",
  "src/components/ui/label.tsx",
  "src/components/ui/pagination.tsx",
  "src/components/ui/popover.tsx",
  "src/components/ui/progress.tsx",
  "src/components/ui/radio-group.tsx",
  "src/components/ui/resizable.tsx",
  "src/components/ui/select.tsx",
  "src/components/ui/separator.tsx",
  "src/components/ui/skeleton.tsx",
  "src/components/ui/slider.tsx",
  "src/components/ui/switch.tsx",
  "src/components/ui/table.tsx",
  "src/components/ui/textarea.tsx",
  "src/components/ui/toggle.tsx",
  "src/components/ui/toggle-group.tsx",
]

const files = allFiles.filter((file) => activeFiles.includes(file.name))

const filesText = files.map((file) => `- ${file.name}`).join("\n")

const prompt = `# ルール

ユーザの要望に必要なコンポーネントがあれば以下から応答しなさい。

${filesText}`

type Props = {
  provider: OpenAIProvider
  messages: CoreMessage[]
  tasks: string[]
}

export async function createShadcnuiDepsStream(props: Props) {
  const tasksText = props.tasks.map((task) => `- ${task}`).join("\n")

  return generateObject({
    model: props.provider.languageModel("gpt-4o-mini"),
    schema: z.object({
      components: z.array(z.string()),
    }),
    maxTokens: 2048,
    messages: [
      {
        role: "system",
        content: `次の要件を満たすコードを生成します. ${tasksText}`,
      },
      { role: "system", content: prompt },
      { role: "system", content: chatPrompt },
      ...props.messages,
    ],
  })
}

import { Home, Info, Key, Shield } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { LinkButton } from "~/components/ui/link-button"
import { Separator } from "~/components/ui/separator"
import type { CredentialStorage } from "~/lib/credential-storage"

type Props = {
  storage: CredentialStorage
  onRefresh(): void
}

export function CredentialPage(props: Props) {
  const [apiKey, setApiKey] = useState("")

  /**
   * APIキーをローカルストレージに保存する
   */
  const onSubmit = () => {
    props.storage.writeLocalApiKey(apiKey)
    props.onRefresh()
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-900">
      <LinkButton
        to="/"
        size="icon"
        variant="ghost"
        className="absolute top-4 right-4 h-8 w-8 text-zinc-400 hover:text-emerald-300"
      >
        <Home className="h-4 w-4" />
      </LinkButton>
      <Card className="w-full max-w-md border-zinc-800 bg-black backdrop-blur-sm">
        <CardHeader className="space-y-4 p-6">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-emerald-500/10 p-2">
              <Shield className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">
                API Key Setup
              </CardTitle>
              <CardDescription className="mt-2 text-zinc-400">
                環境変数にAPIキーが設定されていません。
                <br />
                OpenAIのAPIキーを入力して、AIによるWebサイト生成を始めましょう。
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit()
            }}
            className="space-y-4"
          >
            <div className="relative">
              <Key className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-zinc-400" />
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                className="border-zinc-800 bg-zinc-900/80 pl-10 text-white placeholder:text-zinc-400"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              APIキーを保存
            </Button>
          </form>
        </CardContent>
        <Separator className="bg-zinc-800" />
        <CardContent className="space-y-4 p-6">
          <div className="flex items-start space-x-4">
            <Info className="h-5 w-5 flex-shrink-0 text-zinc-400" />
            <p className="text-sm text-zinc-400">
              {description}
              <br />
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-emerald-500 hover:text-emerald-400"
              >
                OpenAI API Keysページへ →
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const description = `環境変数はファイル「.env.local」に「VITE_OPENAI_API_KEY」として設定できます。
環境変数が空の場合は、代わりにローカルストレージにAPIキーを保存できます。`

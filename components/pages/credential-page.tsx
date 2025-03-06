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
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-md">
        <CardHeader className="p-4">
          <CardTitle>{"OpenAI API key"}</CardTitle>
          <CardDescription>
            環境変数にAPIキーが設定されていません。APIキーを入力してください。
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit()
            }}
            className="space-y-4"
          >
            <Input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
            <Button type="submit" className="w-full">
              {"保存"}
            </Button>
          </form>
        </CardContent>
        <Separator />
        <CardContent className="p-4">
          <p className="text-xs">{description}</p>
        </CardContent>
      </Card>
    </div>
  )
}

const description = `環境変数はファイル「.env.local」に「VITE_OPENAI_API_KEY」として設定できます。
環境変数が空の場合は、代わりにローカルストレージにAPIキーを保存できます。`

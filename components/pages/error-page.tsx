import { AlertTriangle } from "lucide-react"
import { LinkButton } from "~/components/ui/link-button"
import { Card } from "~/components/ui/card"
import { ErrorComponentProps } from "@tanstack/react-router"

export function ErrorPage(props: ErrorComponentProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-zinc-900 via-gray-900 to-black">
      <main className="min-h-screen flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
            <Card className="w-full max-w-3xl border-zinc-800 bg-black/30">
              <div className="p-6 space-y-6">
                <div className="flex justify-center">
                  <AlertTriangle className="h-16 w-16 text-red-500" />
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-white">
                    エラーが発生しました
                  </h1>
                  
                  <p className="text-zinc-400 break-words">
                    {props.error.message}
                  </p>
                </div>

                <LinkButton
                  to="/"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  トップへ
                </LinkButton>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

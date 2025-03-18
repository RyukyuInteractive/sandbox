import type { WebContainer, WebContainerProcess } from "@webcontainer/api"
import type { IDisposable, Terminal } from "@xterm/xterm"
import { useCallback, useRef, useTransition } from "react"

type ShellState = {
  input: WritableStreamDefaultWriter<string> | null
  process: WebContainerProcess | null
  disposable: IDisposable | null
  outputStream: ReadableStreamDefaultReader<string> | null
  isInitialized: boolean
  isProcessing: boolean
}

type ExecResult = {
  output: string
  exitCode: number
}

export function useShell() {
  const stateRef = useRef<ShellState>({
    input: null,
    process: null,
    disposable: null,
    outputStream: null,
    isInitialized: false,
    isProcessing: false,
  })

  /**
   * シェルにコマンドを実行
   */
  const exec = async (command: string): Promise<ExecResult> => {
    if (!stateRef.current.input) {
      return { output: "", exitCode: 1 }
    }

    await stateRef.current.input.write(`${command}\n`)
    return waitTillOscCode("exit")
  }

  /**
   * シェルで実行中のプロセス終了
   */
  const exit = async () => {
    if (!stateRef.current.isProcessing) {
      return
    }
    await stateRef.current.input?.write("\x03")
    return waitTillOscCode("exit")
  }

  /**
   * コマンドの完了を待つ
   */
  const waitTillOscCode = async (waitCommand: string): Promise<ExecResult> => {
    let fullOutput = ""
    let exitCode = 0

    if (!stateRef.current.outputStream) {
      return { output: fullOutput, exitCode }
    }

    const tappedStream = stateRef.current.outputStream

    stateRef.current.isProcessing = true

    while (true) {
      const { value, done } = await tappedStream.read()

      if (done) {
        break
      }

      const text = value || ""
      fullOutput += text

      const escStart = String.fromCharCode(0x1b) // ESC文字
      const bell = String.fromCharCode(0x07) // BELL文字
      const pattern = new RegExp(
        `${escStart}]654;([^${bell}=]+)=?((-?\\d+):(\\d+))?${bell}`,
      )

      /**
       * 最後に以下のような出力がされる
       * \x1B]654;exit=-1:0\x07
       *
       * この出力をパースしてコマンドと終了コードを取得する
       * command: exit
       * code: 0
       */
      const [, command, , , code] = text.match(pattern) || []

      if (command === "exit") {
        exitCode = Number.parseInt(code, 10)
      }

      if (command === waitCommand) {
        break
      }
    }

    stateRef.current.isProcessing = false

    return { output: fullOutput, exitCode }
  }

  /**
   * シェルを初期化する
   */
  const init = async (
    webContainer: WebContainer,
    terminal: Terminal,
  ): Promise<void> => {
    if (stateRef.current.isInitialized) {
      return
    }

    const ready = Promise.withResolvers<void>()
    let isInteractive = false

    const process = await webContainer.spawn("/bin/jsh", ["--osc"], {
      terminal: {
        cols: terminal.cols,
        rows: terminal.rows,
      },
    })

    const input = process.input.getWriter()

    const [internalOutput, terminalOutput] = process.output.tee()

    terminalOutput.pipeTo(
      new WritableStream({
        write: async (data) => {
          if (!isInteractive) {
            isInteractive = true
            ready.resolve()
          }
          terminal.write(data)
        },
      }),
    )

    const outputStream = internalOutput.getReader()

    const disposable = terminal.onData((data) => {
      if (isInteractive) {
        input.write(data)
      }
    })

    stateRef.current = {
      input,
      process,
      disposable,
      outputStream,
      isInitialized: true,
      isProcessing: false,
    }

    return ready.promise
  }

  /**
   * シェルを終了する
   */
  const kill = useCallback(() => {
    if (stateRef.current.process) {
      stateRef.current.process.kill()
    }

    if (stateRef.current.disposable) {
      stateRef.current.disposable.dispose()
    }

    stateRef.current = {
      input: null,
      process: null,
      disposable: null,
      outputStream: null,
      isInitialized: false,
      isProcessing: false,
    }
  }, [])

  return {
    exec,
    exit,
    kill,
    init,
    isInitialized: stateRef.current.isInitialized,
  }
}

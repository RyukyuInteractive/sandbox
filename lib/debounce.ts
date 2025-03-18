/**
 * 関数実行を一定時間後に遅延させるdebounce関数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null

  return (...args: Parameters<T>) => {
    // 既存のタイマーをクリア
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId)
    }

    // 新しいタイマーをセット
    timeoutId = window.setTimeout(() => {
      timeoutId = null
      func(...args)
    }, delay)
  }
}

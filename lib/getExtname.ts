export function getExtname(path: string) {
  const match = path.match(/\.([^.]+)$/)
  return match ? match[1] : ""
}

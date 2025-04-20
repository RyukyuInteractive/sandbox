#!/usr/bin/env bun

import fs from "node:fs"
import path from "node:path"

const aiDir = path.join(process.cwd(), ".ai")

async function generateDevinRules() {
  console.log("Generating devinrules.md...")

  const files = fs
    .readdirSync(aiDir)
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => {
      const numA = Number.parseInt(a.split(".")[0])
      const numB = Number.parseInt(b.split(".")[0])
      return numA - numB
    })

  let content = "# Devin Rules\n\n"
  content +=
    "このドキュメントはSandboxプロジェクトの開発ルールと仕様をまとめたものです。\n\n"

  for (const file of files) {
    const filePath = path.join(aiDir, file)
    const fileContent = fs.readFileSync(filePath, "utf-8")

    const [num, name] = file.split(".")

    const adjustedContent = fileContent
      .split("\n")
      .map((line, index) => {
        if (index === 0 && line.startsWith("# ")) {
          return `## ${line.substring(2)}`
        }
        if (line.startsWith("# ")) {
          return `## ${line.substring(2)}`
        }
        if (line.startsWith("## ")) {
          return `### ${line.substring(3)}`
        }
        if (line.startsWith("### ")) {
          return `#### ${line.substring(4)}`
        }
        return line
      })
      .join("\n")

    content += `${adjustedContent}\n\n`
  }

  fs.writeFileSync(path.join(process.cwd(), "devinrules.md"), content)
  console.log("devinrules.md has been generated successfully!")
}

async function updatePackageJson() {
  console.log("Updating package.json...")

  const packageJsonPath = path.join(process.cwd(), "package.json")
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"))

  if (!packageJson.scripts.init) {
    packageJson.scripts.init = "bun run scripts/init.ts"
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    console.log("Added 'init' script to package.json")
  } else {
    console.log("'init' script already exists in package.json")
  }
}

async function main() {
  await updatePackageJson()
  await generateDevinRules()
}

main().catch(console.error)

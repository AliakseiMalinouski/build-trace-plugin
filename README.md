# build-trace-plugin

A powerful multi-module diagnostic plugin for **Rspack** that helps you detect unused modules, oversized files, suspicious dependencies, invalid environment variables, and bundle regressions — all within a single tool.

`build-trace-plugin` turns your build process into a fully observable and controlled pipeline.

---

## 🚀 Features

### **1. 🕵️ DependencyController — suspicious dependency detector**

Analyzes module dependencies and flags:

- dynamic imports
- commonJS imports
- mixed-module imports
- critical dependencies
- unknown dependency categories

Helps maintain a clean ESM architecture and prevents dependency poisoning.

---

### **2. 📊 BuildStats — build statistics logger**

Creates a JSON file with build metrics and compares bundle size against the previous build.  
Warns you when assets grow unexpectedly.

---

### **3. 🧹 UnusedModule — unused module detector**

Finds modules that have **no incoming connections** (not imported anywhere).

---

### **4. 🔐 EnvValidator — environment variables validator**

Validates required `process.env` variables before the build starts.

---

### **5. 🐘 LargeModule — large file detector**

Identifies modules that exceed a given file size threshold.

---

# Config Example

```ts
// rspack.config.ts
import { BuildTracePlugin } from "build-trace-plugin";

module.exports = {
  // ...your config,

  plugins: [
    new BuildTracePlugin({
      dependencyController: {
        directory: "src",
        fileExtentions: ["ts", "tsx", "js", "jsx"],
      },

      buildStats: {
        outputDir: "stats",
        outputFile: "build-stats.json",
      },

      envValidator: {
        envs: {
          API_URL: process.env.API_URL,
          AUTH_TOKEN: process.env.AUTH_TOKEN,
        },
      },

      unusedModule: {
        directory: "src",
      },

      largeModule: {
        maxFileSize: 1024,
        directory: "services",
      },
    }),
  ],
};

```

# Output Example

```bash
✅ All required environment variables are valid
🔴 Build has 3 unused modules
Module ./src/old/api.ts has no incoming connections
Module ./src/utils/debug.ts has no incoming connections
Module ./src/helpers/legacy.ts has no incoming connections

🧐 Build has 2 suspected dependencies in modules:
┌─────────┬───────────┬─────────────────────────────┐
│ critical│ category  │ module name                  │
├─────────┼───────────┼─────────────────────────────┤
│ false   │ cjs       │ ./src/features/users/model  │
│ true    │ unknown   │ ./src/app/index.tsx         │
└─────────┴───────────┴─────────────────────────────┘

📈 Assets size has increased about: 42 KB
📊 Build general stats generated in stats/build-info.json

```

---

# 📦 Installation

```bash
npm install build-trace-plugin --save-dev

```

```bash
yarn add build-trace-plugin -D

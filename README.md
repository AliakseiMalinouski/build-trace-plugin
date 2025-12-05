# build-trace-plugin

A powerful multi-module diagnostic plugin for **Rspack** that helps you detect unused modules, oversized files, suspicious dependencies, invalid environment variables, and bundle regressions — all within a single tool.

`build-trace-plugin` turns your build process into a fully observable and controlled pipeline.

---

## 🚀 Features

### **1. 🕵️ DependencyController — suspicious dependency detector**

Analyzes module dependencies and flags:

- dynamic imports
- CommonJS imports
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

# Example

// rspack.config.ts
import { defineConfig } from "@rspack/cli";
import { BuildTracePlugin } from "build-trace-plugin";

```ts
export default defineConfig({
  ...your config,

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
});

```

---

# 📦 Installation

```bash
npm install build-trace-plugin --save-dev

```

```bash
yarn add build-trace-plugin -D

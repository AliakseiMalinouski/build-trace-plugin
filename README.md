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

# 📦 Installation

```bash
npm install build-trace-plugin --save-dev

```

```bash
yarn add build-trace-plugin -D
```

---

# 🛠️ Config Example

```ts
// rspack.config.ts
import { BuildTracePlugin } from "build-trace-plugin";

module.exports = {
  // ...your config,

  plugins: [
    new BuildTracePlugin({
      // all plugins are disabled by default
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

      buildFileSize: true,
    }),
  ],
};

```

# 💾 Output Example

```bash

Rspack compiled successfully in 102 ms

❌ Env Validator Plugin: Some environment variable is not valid: API_URL

🏔️ Large Module Plugin: Build has 3 large modules:
┌─────────┬────────────────────┬──────────────┬────────┬─────────────────────────────┐
│ (index) │ type               │ dependencies │ size   │ name                        │
├─────────┼────────────────────┼──────────────┼────────┼─────────────────────────────┤
│ 0       │ 'javascript/auto'  │ 27           │ '1.97' │ 'modal.ts'                  │
│ 1       │ 'javascript/auto'  │ 20           │ '1.28' │ 'header.ts'                 │
│ 2       │ 'javascript/auto'  │ 19           │ '1.30' │ 'footer.tsx'                │
└─────────┴────────────────────┴──────────────┴────────┴─────────────────────────────┘

🥳 Ununsed Module Plugin: Build has 0 unused modules

🧐 Dependency Controller Plugin: Build has 4 suspected dependencies in modules:
┌─────────┬──────────┬─────────────────────┬────────────────────────────────────────────┐
│ (index) │ critical │ dependency category │ module name                                │
├─────────┼──────────┼─────────────────────┼────────────────────────────────────────────┤
│ 0       │ true     │ 'commonjs'          │ './src/services/modal/modal.model.ts'      │
│ 1       │ true     │ 'commonjs'          │ './src/models/validator/validator.model.ts'│
│ 2       │ false    │ 'unknown'           │ './src/models/button/button.model.ts'      │
│ 3       │ false    │ 'unknown'           │ './src/services/skeleton/index.ts'         │
└─────────┴──────────┴─────────────────────┴────────────────────────────────────────────┘

💪 Assets size is normal
✅ Build has finished successfully
📊 Build general stats generated in build_stats/build_stats.json

📶 Build File Size Plugin: Here are your build files sizes
┌─────────┬──────────────────────────────┬─────────┬─────────────┐
│ (index) │ name                         │ type    │ size        │
├─────────┼──────────────────────────────┼─────────┼─────────────┤
│ 0       │ 'vendors.css'                │ 'css'   │ '767.54 KB' │
│ 1       │ 'bundle.ade1f697b57e7583.js' │ 'js'    │ '529.05 KB' │
│ 2       │ 'icon-512.png'               │ 'image' │ '84.10 KB'  │
└─────────┴──────────────────────────────┴─────────┴─────────────┘
```

# License

[MIT license](https://github.com/AliakseiMalinouski/build-trace-plugin?tab=MIT-1-ov-file)

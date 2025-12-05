# build-trace-plugin

A powerful multi-module diagnostic plugin for **Rspack** that helps you detect unused modules, oversized files, suspicious dependencies, invalid environment variables, and bundle regressions — all within a single tool.

`build-trace-plugin` turns your build process into a fully observable and controlled pipeline.

---

## 🚀 Features

The plugin includes **five independent subsystems**, each of which can be enabled or disabled:

---

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

# 📦 Installation

```bash
npm install build-trace-plugin --save-dev

```

```bash
yarn add build-trace-plugin -D

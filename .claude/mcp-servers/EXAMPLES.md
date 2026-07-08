# Angular JSON Handler MCP - Usage Examples

Practical examples for using the Angular JSON Handler MCP server with your portfolio project.

## Table of Contents
1. [Reading Files](#reading-files)
2. [Writing Files](#writing-files)
3. [Validation](#validation)
4. [Querying Data](#querying-data)
5. [Transforming Data](#transforming-data)
6. [Real-World Workflows](#real-world-workflows)

---

## Reading Files

### Read Angular Configuration
```javascript
// Get current Angular workspace setup
const angularConfig = await tools["read-json"]({
  path: "./angular.json"
})

console.log("Projects in workspace:", Object.keys(angularConfig.projects))
console.log("CLI version:", angularConfig.version)
```

### Read Portfolio Data
```javascript
// Read portfolio configuration
const portfolio = await tools["read-json"]({
  path: "./public/portfolio-data.json"
})

console.log("Portfolio name:", portfolio.meta.name)
console.log("Number of projects:", portfolio.projects.featured.length)
console.log("Blog articles:", portfolio.blog.articles.length)
```

### Read TypeScript Configuration
```javascript
// Get TypeScript settings
const tsconfig = await tools["read-json"]({
  path: "./tsconfig.json"
})

console.log("Target:", tsconfig.compilerOptions.target)
console.log("Module:", tsconfig.compilerOptions.module)
console.log("Strict mode:", tsconfig.compilerOptions.strict)
```

### Read Package Configuration
```javascript
// Get package info and dependencies
const pkg = await tools["read-json"]({
  path: "./package.json"
})

console.log("Package name:", pkg.name)
console.log("Version:", pkg.version)
console.log("Angular version:", pkg.dependencies["@angular/core"])
console.log("Dev dependencies:", Object.keys(pkg.devDependencies))
```

---

## Writing Files

### Update Portfolio Meta Information
```javascript
// Read current portfolio data
const portfolio = await tools["read-json"]({
  path: "./public/portfolio-data.json"
})

// Update meta information
portfolio.meta.name = "Your Name"
portfolio.meta.role = "Senior Angular Developer"
portfolio.meta.description = "Full-stack enterprise developer"

// Write back to file
await tools["write-json"]({
  path: "./public/portfolio-data.json",
  data: portfolio,
  pretty: true,
  indent: 2
})

console.log("Portfolio updated successfully!")
```

### Add New Project
```javascript
// Read current data
const portfolio = await tools["read-json"]({
  path: "./public/portfolio-data.json"
})

// Create new project
const newProject = {
  slug: "new-project",
  title: "New Amazing Project",
  description: "Description of the project",
  status: "Live",
  statusColor: "success",
  thumbnail: "/new-project.webp",
  technologies: ["Angular", "TypeScript", "Tailwind CSS"],
  links: {
    live: "https://new-project.com",
    github: "https://github.com/user/new-project"
  }
}

// Add to portfolio
portfolio.projects.featured.push(newProject)

// Save
await tools["write-json"]({
  path: "./public/portfolio-data.json",
  data: portfolio,
  pretty: true
})

console.log("New project added!")
```

### Create TypeScript Configuration
```javascript
const tsconfig = {
  compilerOptions: {
    target: "ES2020",
    module: "ES2020",
    lib: ["ES2020", "DOM"],
    outDir: "./dist",
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true
  },
  include: ["src/**/*"],
  exclude: ["node_modules", "dist"]
}

await tools["write-json"]({
  path: "./tsconfig.json",
  data: tsconfig,
  pretty: true
})

console.log("TypeScript configuration created!")
```

---

## Validation

### Validate Angular Configuration
```javascript
// Validate angular.json structure
const validation = await tools["validate-json"]({
  path: "./angular.json",
  schema: "angular"
})

if (validation.valid) {
  console.log("✅ Angular configuration is valid!")
} else {
  console.error("❌ Validation errors:", validation.errors)
}
```

### Validate Portfolio Data
```javascript
// Check portfolio configuration integrity
const validation = await tools["validate-json"]({
  path: "./public/portfolio-data.json",
  schema: "portfolio"
})

if (validation.valid) {
  console.log("✅ Portfolio data structure is valid!")
} else {
  console.log("Issues found:")
  validation.errors.forEach(error => {
    console.log(`  - ${error}`)
  })
}
```

### Validate Package JSON
```javascript
// Ensure package.json has required fields
const validation = await tools["validate-json"]({
  path: "./package.json",
  schema: "package"
})

console.log("Validation result:", validation.valid ? "✅ Pass" : "❌ Fail")
```

### Validate TypeScript Config
```javascript
// Check TypeScript configuration
const validation = await tools["validate-json"]({
  path: "./tsconfig.json",
  schema: "tsconfig"
})

if (!validation.valid) {
  console.error("TypeScript configuration issues:", validation.errors)
}
```

---

## Querying Data

### Get All Project Titles
```javascript
// Query all featured project titles
const titles = await tools["query-json"]({
  path: "./public/portfolio-data.json",
  query: "$.projects.featured[*].title"
})

console.log("Projects:", titles.result)
```

### Get Specific Project
```javascript
// Get first featured project
const firstProject = await tools["query-json"]({
  path: "./public/portfolio-data.json",
  query: "$.projects.featured[0]"
})

console.log("First project:", firstProject.result)
```

### Get Blog Articles by Category
```javascript
// Get all articles
const articles = await tools["query-json"]({
  path: "./public/portfolio-data.json",
  query: "$.blog.articles"
})

console.log("Total articles:", articles.result.length)
```

### Get Contact Information
```javascript
// Query contact data
const contact = await tools["query-json"]({
  path: "./public/portfolio-data.json",
  query: "$.contact"
})

console.log("Email:", contact.result.email)
console.log("Title:", contact.result.title)
```

---

## Transforming Data

### Flatten Portfolio Structure
```javascript
// Read portfolio
const portfolio = await tools["read-json"]({
  path: "./public/portfolio-data.json"
})

// Flatten nested structure
const flattened = await tools["transform-json"]({
  data: portfolio,
  operation: "flatten"
})

console.log("Flattened keys:", Object.keys(flattened).slice(0, 10))
```

### Pick Specific Fields
```javascript
// Extract only essential fields
const essential = await tools["transform-json"]({
  data: portfolio,
  operation: "pick",
  options: {
    keys: ["meta", "hero", "projects", "contact"]
  }
})

console.log("Essential data extracted")
```

### Omit Sensitive Data
```javascript
// Remove sensitive fields
const public = await tools["transform-json"]({
  data: portfolio,
  operation: "omit",
  options: {
    keys: ["meta.email", "contact.directEmail"]
  }
})

console.log("Sensitive data removed")
```

### Sort Configuration Keys
```javascript
// Alphabetize config keys
const sorted = await tools["transform-json"]({
  data: angularConfig,
  operation: "sort"
})

console.log("Configuration keys sorted")
```

---

## Real-World Workflows

### Workflow 1: Add New Blog Article

```javascript
// 1. Read current portfolio
const portfolio = await tools["read-json"]({
  path: "./public/portfolio-data.json"
})

// 2. Create new article
const newArticle = {
  id: "angular-signals-guide",
  title: "Complete Guide to Angular Signals",
  slug: "angular-signals-guide",
  excerpt: "Learn how to use Angular Signals effectively...",
  category: "Angular",
  date: new Date().toISOString().split('T')[0],
  readTime: "10 min read",
  tags: ["Angular", "Signals", "Performance"]
}

// 3. Add to portfolio
portfolio.blog.articles.push(newArticle)

// 4. Validate
const validation = await tools["validate-json"]({
  path: "./public/portfolio-data.json",
  schema: "portfolio"
})

if (validation.valid) {
  // 5. Save
  await tools["write-json"]({
    path: "./public/portfolio-data.json",
    data: portfolio,
    pretty: true
  })
  console.log("✅ Article added and validated!")
}
```

### Workflow 2: Merge Configuration Updates

```javascript
// 1. Read current config
const current = await tools["read-json"]({
  path: "./angular.json"
})

// 2. Create updates
const updates = {
  projects: {
    portfolio: {
      architect: {
        build: {
          options: {
            optimization: true,
            sourceMap: false
          }
        }
      }
    }
  }
}

// 3. Merge
const merged = await tools["merge-json"]({
  base: current,
  updates: updates
})

// 4. Save
await tools["write-json"]({
  path: "./angular.json",
  data: merged,
  pretty: true
})

console.log("Configuration updated!")
```

### Workflow 3: Export Portfolio Summary

```javascript
// 1. Read portfolio
const portfolio = await tools["read-json"]({
  path: "./public/portfolio-data.json"
})

// 2. Extract key information
const summary = {
  profile: {
    name: portfolio.meta.name,
    role: portfolio.meta.role,
    email: portfolio.meta.email
  },
  projects: portfolio.projects.featured.map(p => ({
    title: p.title,
    description: p.description,
    link: p.links.live
  })),
  articles: portfolio.blog.articles.length,
  skills: portfolio.skills.categories.length
}

// 3. Save summary
await tools["write-json"]({
  path: "./public/portfolio-summary.json",
  data: summary,
  pretty: true
})

console.log("Portfolio summary exported!")
```

### Workflow 4: Validate All Configurations

```javascript
// Validate all important files
const validations = {
  angular: await tools["validate-json"]({
    path: "./angular.json",
    schema: "angular"
  }),
  tsconfig: await tools["validate-json"]({
    path: "./tsconfig.json",
    schema: "tsconfig"
  }),
  package: await tools["validate-json"]({
    path: "./package.json",
    schema: "package"
  }),
  portfolio: await tools["validate-json"]({
    path: "./public/portfolio-data.json",
    schema: "portfolio"
  })
}

// Report results
Object.entries(validations).forEach(([name, result]) => {
  console.log(`${name}: ${result.valid ? "✅" : "❌"}`)
  if (!result.valid) {
    result.errors.forEach(e => console.log(`  ${e}`))
  }
})
```

---

## Tips & Best Practices

1. **Always validate after modifications**
   ```javascript
   // After writing, validate to ensure integrity
   await tools["write-json"]({ /* ... */ })
   const validation = await tools["validate-json"]({ /* ... */ })
   ```

2. **Use deep merge for complex updates**
   ```javascript
   // Safer than direct assignment
   const merged = await tools["merge-json"]({
     base: current,
     updates: newValues
   })
   ```

3. **Query before modifying**
   ```javascript
   // Check what you're about to modify
   const target = await tools["query-json"]({
     path: "./file.json",
     query: "$.path.to.data"
   })
   ```

4. **Pretty-print for readability**
   ```javascript
   // Always use pretty=true for human-readable files
   await tools["write-json"]({
     data: config,
     pretty: true,
     indent: 2
   })
   ```

5. **Backup before major changes**
   ```javascript
   // Read → Backup → Modify → Write
   const original = await tools["read-json"]({ path: "./file.json" })
   await tools["write-json"]({ 
     path: "./file.json.backup", 
     data: original 
   })
   ```

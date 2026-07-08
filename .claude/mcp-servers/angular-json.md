---
name: angular-json-handler
description: MCP server for reading, writing, and validating Angular project JSON files
type: stdio
command: node
args:
  - server.js
environment: {}
---

# Angular JSON Handler MCP Server

This MCP server provides tools for managing JSON files in Angular projects.

## Capabilities

### Resources
- `angular-json://` - Read/write angular.json configuration
- `tsconfig://` - Read/write TypeScript configurations  
- `package-json://` - Read/write package.json dependencies
- `portfolio-data://` - Read/write portfolio data JSON

### Tools
- `read-json` - Read and parse JSON files with validation
- `write-json` - Write formatted JSON with schema validation
- `merge-json` - Deep merge JSON objects
- `validate-json` - Validate JSON against schemas
- `query-json` - Query JSON using JSONPath expressions
- `transform-json` - Transform JSON structures

## Usage Examples

```javascript
// Read angular.json
await tool.read-json({
  path: "./angular.json"
})

// Write portfolio data
await tool.write-json({
  path: "./public/portfolio-data.json",
  data: { meta: {...}, projects: {...} },
  pretty: true
})

// Validate configuration
await tool.validate-json({
  path: "./tsconfig.json",
  schema: "tsconfig"
})

// Query data
await tool.query-json({
  path: "./public/portfolio-data.json",
  query: "$.projects.featured[*].title"
})
```

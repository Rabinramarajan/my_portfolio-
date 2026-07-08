# Angular JSON Handler MCP Server

A Model Context Protocol (MCP) server for reading, writing, validating, and transforming JSON files in Angular projects.

## Features

### 🔧 Tools Available

#### `read-json`
Read and parse JSON files with optional validation
```javascript
{
  "path": "./angular.json",
  "validate": true
}
```

#### `write-json`
Write JSON data to files with formatting options
```javascript
{
  "path": "./public/portfolio-data.json",
  "data": { /* JSON object */ },
  "pretty": true,
  "indent": 2
}
```

#### `merge-json`
Deep merge JSON objects (non-mutating)
```javascript
{
  "base": { a: 1, b: { c: 2 } },
  "updates": { b: { d: 3 } }
}
// Result: { a: 1, b: { c: 2, d: 3 } }
```

#### `validate-json`
Validate JSON files against built-in schemas
- `angular` - Validates angular.json structure
- `tsconfig` - Validates TypeScript configuration
- `package` - Validates package.json
- `portfolio` - Validates portfolio-data.json

```javascript
{
  "path": "./angular.json",
  "schema": "angular"
}
```

#### `query-json`
Query JSON using path expressions
```javascript
{
  "path": "./public/portfolio-data.json",
  "query": "$.projects.featured[0].title"
}
```

#### `transform-json`
Transform JSON structures with operations:
- `flatten` - Flatten nested objects
- `unflatten` - Reconstruct nested structure
- `pick` - Select specific keys
- `omit` - Remove specific keys
- `sort` - Sort object keys alphabetically

```javascript
{
  "data": { /* JSON object */ },
  "operation": "flatten"
}
```

## Installation

### 1. Add to Claude Code Settings

Add to your `.claude/models.json` or Claude Code configuration:

```json
{
  "mcpServers": {
    "angular-json": {
      "command": "node",
      "args": [".claude/mcp-servers/angular-json-server.js"],
      "env": {}
    }
  }
}
```

### 2. Install Dependencies (if needed)

```bash
npm install @modelcontextprotocol/sdk
```

## Usage Examples

### Reading Angular Configuration
```javascript
// Use in Claude Code or AI tools
await tool.read-json({
  path: "./angular.json"
})
```

### Updating Portfolio Data
```javascript
// Read current data
const current = await tool.read-json({
  path: "./public/portfolio-data.json"
})

// Merge with updates
const updated = await tool.merge-json({
  base: current,
  updates: {
    projects: {
      featured: [...newProjects]
    }
  }
})

// Write back
await tool.write-json({
  path: "./public/portfolio-data.json",
  data: updated,
  pretty: true
})
```

### Querying Project Data
```javascript
// Get all project titles
await tool.query-json({
  path: "./public/portfolio-data.json",
  query: "$.projects.featured[*].title"
})
```

### Validating Configuration
```javascript
// Validate TypeScript config
const validation = await tool.validate-json({
  path: "./tsconfig.json",
  schema: "tsconfig"
})

if (!validation.valid) {
  console.error("Validation errors:", validation.errors)
}
```

### Transforming Data
```javascript
// Flatten portfolio structure
const flattened = await tool.transform-json({
  data: portfolioData,
  operation: "flatten"
})

// Pick specific fields
const summary = await tool.transform-json({
  data: portfolioData,
  operation: "pick",
  options: { keys: ["meta", "projects", "blog"] }
})
```

## Supported File Types

- `angular.json` - Angular workspace configuration
- `tsconfig.json` - TypeScript compiler options
- `package.json` - Node.js package metadata
- `portfolio-data.json` - Custom portfolio configuration
- Any valid JSON file

## Schema Validation

### Angular Schema
Required: `version`
Optional: `projects`, `newProjectRoot`, `cli`, `schematics`

### TypeScript Schema
Optional: `compilerOptions`, `include`, `exclude`, `extends`

### Package Schema
Required: `name`, `version`
Optional: `dependencies`, `devDependencies`, `scripts`, `main`, `type`

### Portfolio Schema
Required: `meta`
Optional: `nav`, `hero`, `about`, `projects`, `blog`, `contact`, `footer`

## Error Handling

All tools return structured error messages:
```javascript
{
  "success": false,
  "error": "Error message",
  "details": "Additional context"
}
```

## Performance

- Async/await for non-blocking I/O
- Efficient JSON parsing and serialization
- Deep merge without mutations
- Optimized query evaluation

## Future Enhancements

- [ ] JSONPath full specification support
- [ ] Schema generation from JSON files
- [ ] JSON diff/patch operations
- [ ] Large file streaming
- [ ] Custom schema definitions
- [ ] Batch operations

## Troubleshooting

**"JSON file not found"**
- Ensure path is correct (absolute or relative to project root)
- Check file permissions

**"Invalid JSON"**
- Validate file with `validate-json` tool
- Check for trailing commas or unescaped quotes

**"Validation failed"**
- Review validation error messages
- Check against appropriate schema type
- Use `read-json` to inspect actual structure

## License

MIT - Part of portfolio project enhancement suite

# Angular MCP JSON Handler - Complete Reference

A comprehensive Model Context Protocol (MCP) server for Angular project JSON management, providing tools for reading, writing, validating, and transforming JSON files with full TypeScript support.

## 📋 Quick Navigation

| Document | Purpose |
|----------|---------|
| **setup.md** | Installation and configuration guide |
| **angular-json-README.md** | Complete API documentation |
| **EXAMPLES.md** | Real-world usage examples |
| **package.json** | Dependencies and scripts |
| **claude.json** | Claude Code configuration |
| **angular-json-server.js** | Server implementation |

## 🚀 Quick Start

### 1. Install
```bash
npm install @modelcontextprotocol/sdk
```

### 2. Configure
Add to `.claude/claude.json`:
```json
{
  "mcpServers": {
    "angular-json": {
      "command": "node",
      "args": [".claude/mcp-servers/angular-json-server.js"]
    }
  }
}
```

### 3. Use
```javascript
// Read JSON file
const data = await tools["read-json"]({
  path: "./public/portfolio-data.json"
})

// Write with validation
await tools["write-json"]({
  path: "./public/portfolio-data.json",
  data: data,
  pretty: true
})
```

## 🛠️ Available Tools

### Core Operations
- **`read-json`** - Read and parse JSON files
- **`write-json`** - Write JSON with formatting
- **`merge-json`** - Deep merge objects
- **`query-json`** - Query using path expressions
- **`validate-json`** - Validate against schemas
- **`transform-json`** - Transform data structures

### Supported Schemas
- `angular` - angular.json workspace configuration
- `tsconfig` - TypeScript compiler options
- `package` - Node.js package metadata
- `portfolio` - Custom portfolio data

## 📊 Use Cases

### Project Management
- Read/write `angular.json` configurations
- Validate TypeScript `tsconfig.json` settings
- Manage `package.json` dependencies

### Data Operations
- Read portfolio data from JSON files
- Add/update projects, blog articles, testimonials
- Query specific data points
- Transform data for different formats

### Validation & Quality
- Validate configuration integrity
- Check required fields
- Ensure schema compliance
- Error reporting and diagnostics

### Automation
- Batch update operations
- Configuration migration
- Data synchronization
- Report generation

## 📚 Documentation Structure

```
.claude/mcp-servers/
├── INDEX.md                    ← You are here
├── setup.md                    ← Get started
├── angular-json-README.md      ← Full API docs
├── EXAMPLES.md                 ← Usage examples
├── package.json                ← Dependencies
├── angular-json-server.js      ← Implementation
├── angular-json.md             ← Server definition
└── claude.json                 ← Configuration
```

## 🎯 Common Tasks

### Reading Data
See **EXAMPLES.md** → [Reading Files](#reading-files)

### Writing Data
See **EXAMPLES.md** → [Writing Files](#writing-files)

### Validation
See **EXAMPLES.md** → [Validation](#validation)

### Querying Data
See **EXAMPLES.md** → [Querying Data](#querying-data)

### Transforming Data
See **EXAMPLES.md** → [Transforming Data](#transforming-data)

## 🔧 Configuration

### Basic Setup
```json
{
  "command": "node",
  "args": [".claude/mcp-servers/angular-json-server.js"]
}
```

### Advanced Options
```json
{
  "command": "node",
  "args": [".claude/mcp-servers/angular-json-server.js"],
  "env": {
    "DEBUG": "true",
    "NODE_ENV": "development"
  },
  "autoStart": true,
  "alwaysAllow": ["read-json", "write-json"]
}
```

## 📖 API Overview

### Tool Parameters

#### `read-json`
```typescript
{
  path: string,           // File path
  validate?: boolean      // Validate after reading
}
```

#### `write-json`
```typescript
{
  path: string,           // File path
  data: object,           // Data to write
  pretty?: boolean,       // Pretty-print (default: true)
  indent?: number         // Indent spaces (default: 2)
}
```

#### `merge-json`
```typescript
{
  base: object,           // Base object
  updates: object         // Updates to merge
}
```

#### `validate-json`
```typescript
{
  path: string,           // File path
  schema: string          // Schema type
}
```

#### `query-json`
```typescript
{
  path: string,           // File path
  query: string           // Path expression
}
```

#### `transform-json`
```typescript
{
  data: object,           // Data to transform
  operation: string,      // Operation type
  options?: object        // Operation options
}
```

## ✨ Features

- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Validated** - Schema validation built-in
- ✅ **Fast** - Async/await for performance
- ✅ **Flexible** - Works with any JSON file
- ✅ **Extensible** - Easy to add custom schemas
- ✅ **Well-Documented** - Complete guides and examples
- ✅ **Production-Ready** - Error handling included
- ✅ **No Dependencies** (except MCP SDK)

## 🚨 Error Handling

All tools return structured errors:
```javascript
{
  "success": false,
  "error": "Error message",
  "details": "Additional context"
}
```

Common issues and solutions in **setup.md** → [Troubleshooting](#troubleshooting)

## 🔗 Related Files

### Portfolio Project Integration
- `angular.json` - Angular workspace config
- `tsconfig.json` - TypeScript settings
- `package.json` - Dependencies
- `public/portfolio-data.json` - Portfolio content

### MCP Configuration
- `.claude/claude.json` - Main config
- `.claude/mcp-servers/` - Server files

## 📦 Version Info

- **Server Version**: 1.0.0
- **Status**: Production-ready
- **Node.js**: 14+
- **MCP SDK**: 0.1.0+

## 🤝 Contributing

To extend this MCP server:

1. Edit `angular-json-server.js`
2. Add new tools in the `tools` array
3. Implement handler in `handleToolCall()`
4. Update documentation
5. Test with examples

## 📝 License

MIT - Part of portfolio project

## 🆘 Support

1. **Quick Help**: See EXAMPLES.md
2. **Setup Issues**: See setup.md
3. **API Details**: See angular-json-README.md
4. **Configuration**: See claude.json
5. **Errors**: Check console output and logs

## 🎓 Learning Path

1. Start with **setup.md** for installation
2. Review **EXAMPLES.md** for usage patterns
3. Read **angular-json-README.md** for complete API
4. Try examples with your project files
5. Create custom workflows

---

**Last Updated**: 2026-07-08  
**Status**: ✅ Production Ready  
**Maintained**: Yes

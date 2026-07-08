# Angular JSON Handler MCP Setup Guide

## Installation Steps

### 1. Prerequisites
- Node.js 14+
- Claude Code (AI Assistant)
- Angular project with JSON files

### 2. Install MCP SDK

```bash
npm install @modelcontextprotocol/sdk
```

### 3. Configure Claude Code

Add the MCP server to your Claude Code configuration:

#### Option A: Via Claude Code Settings UI
1. Open Claude Code settings
2. Navigate to "MCP Servers"
3. Click "Add Server"
4. Configure:
   - **Name**: `angular-json`
   - **Command**: `node`
   - **Arguments**: `.claude/mcp-servers/angular-json-server.js`

#### Option B: Manual Configuration File

Create/edit `.claude/claude.json`:

```json
{
  "mcpServers": {
    "angular-json": {
      "command": "node",
      "args": [".claude/mcp-servers/angular-json-server.js"],
      "env": {
        "DEBUG": "false"
      }
    }
  }
}
```

### 4. Verify Installation

Test the server with Claude Code:

```
Can you read the angular.json file using the angular-json MCP server?
```

You should see the server loading and file contents displayed.

## File Structure

```
.claude/
├── mcp-servers/
│   ├── angular-json.md              # Server definition
│   ├── angular-json-server.js       # Server implementation
│   ├── angular-json-README.md       # Full documentation
│   └── setup.md                     # This file
└── claude.json                      # MCP configuration
```

## Quick Start Examples

### Read portfolio data
```javascript
Use the read-json tool to read "./public/portfolio-data.json"
```

### Validate configuration
```javascript
Use the validate-json tool with:
- path: "./angular.json"
- schema: "angular"
```

### Update project data
```javascript
1. Read current data with read-json
2. Merge updates with merge-json
3. Write back with write-json
```

## Troubleshooting

### Server won't start
- Check Node.js installation: `node --version`
- Verify file permissions on `.claude/mcp-servers/`
- Check console output for error messages

### "Module not found" error
- Install dependencies: `npm install @modelcontextprotocol/sdk`
- Verify installation: `npm list @modelcontextprotocol/sdk`

### Tools not showing in Claude Code
- Restart Claude Code
- Check `.claude/claude.json` syntax
- Verify server path is correct

### JSON files not found
- Use absolute paths or relative to project root
- Check file permissions
- Verify file exists with `ls` or file explorer

## Advanced Configuration

### Enable Debug Mode

```json
{
  "mcpServers": {
    "angular-json": {
      "command": "node",
      "args": [".claude/mcp-servers/angular-json-server.js"],
      "env": {
        "DEBUG": "true"
      }
    }
  }
}
```

### Custom Schema

Extend the server to support custom schemas by editing `angular-json-server.js`:

```javascript
// In validateSchema function, add:
portfolio: {
  properties: ['meta', 'nav', 'hero', 'projects', 'blog', 'contact'],
  required: ['meta', 'projects'],
}
```

## Environment Variables

- `DEBUG` - Enable debug logging (true/false)
- `NODE_ENV` - Node environment (development/production)

## Next Steps

1. **Read the full documentation**: `angular-json-README.md`
2. **Test basic operations**: Try reading and writing JSON files
3. **Integrate with workflow**: Use MCP tools in your AI-assisted development
4. **Customize schemas**: Adapt validation to your project needs

## Support

For issues or questions:
1. Check the README for examples
2. Verify server is running: `node .claude/mcp-servers/angular-json-server.js`
3. Check file paths are correct
4. Review Claude Code console output for errors

## Version Info

- MCP Server Version: 1.0.0
- SDK Version: @modelcontextprotocol/sdk (latest)
- Node.js: 14+
- Status: Production-ready

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Server } = require('@modelcontextprotocol/sdk/server/stdio');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  TextContent,
  Tool,
  Resource,
} = require('@modelcontextprotocol/sdk/types');

const server = new Server({
  name: 'angular-json-handler',
  version: '1.0.0',
});

// Define tools
const tools = [
  {
    name: 'read-json',
    description: 'Read and parse a JSON file with optional validation',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to JSON file (absolute or relative to project root)',
        },
        validate: {
          type: 'boolean',
          description: 'Validate JSON structure (default: true)',
          default: true,
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'write-json',
    description: 'Write JSON data to file with formatting',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to JSON file',
        },
        data: {
          type: 'object',
          description: 'Data to write',
        },
        pretty: {
          type: 'boolean',
          description: 'Pretty-print JSON (default: true)',
          default: true,
        },
        indent: {
          type: 'number',
          description: 'Indentation spaces (default: 2)',
          default: 2,
        },
      },
      required: ['path', 'data'],
    },
  },
  {
    name: 'merge-json',
    description: 'Deep merge JSON objects',
    inputSchema: {
      type: 'object',
      properties: {
        base: {
          type: 'object',
          description: 'Base object',
        },
        updates: {
          type: 'object',
          description: 'Updates to merge',
        },
      },
      required: ['base', 'updates'],
    },
  },
  {
    name: 'validate-json',
    description: 'Validate JSON file against schema',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to JSON file',
        },
        schema: {
          type: 'string',
          description: 'Schema type: "angular", "tsconfig", "package", "portfolio"',
        },
      },
      required: ['path', 'schema'],
    },
  },
  {
    name: 'query-json',
    description: 'Query JSON using simple path expressions',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to JSON file',
        },
        query: {
          type: 'string',
          description: 'Query path (e.g., "$.projects.featured[0].title")',
        },
      },
      required: ['path', 'query'],
    },
  },
  {
    name: 'transform-json',
    description: 'Transform JSON structure',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Data to transform',
        },
        operation: {
          type: 'string',
          description: 'Operation: "flatten", "unflatten", "pick", "omit", "sort"',
        },
        options: {
          type: 'object',
          description: 'Operation-specific options',
        },
      },
      required: ['data', 'operation'],
    },
  },
];

// Helper functions
function readJsonFile(filePath) {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    const content = fs.readFileSync(absolutePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to read JSON file: ${error.message}`);
  }
}

function writeJsonFile(filePath, data, pretty = true, indent = 2) {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    const content = pretty ? JSON.stringify(data, null, indent) : JSON.stringify(data);
    fs.writeFileSync(absolutePath, content, 'utf-8');
    return { success: true, path: absolutePath };
  } catch (error) {
    throw new Error(`Failed to write JSON file: ${error.message}`);
  }
}

function deepMerge(base, updates) {
  const result = { ...base };
  for (const key in updates) {
    if (typeof updates[key] === 'object' && updates[key] !== null && !Array.isArray(updates[key])) {
      result[key] = deepMerge(result[key] || {}, updates[key]);
    } else {
      result[key] = updates[key];
    }
  }
  return result;
}

function queryJson(data, queryPath) {
  const parts = queryPath.split('.').filter(p => p);
  let current = data;

  for (const part of parts) {
    if (part.includes('[')) {
      const [key, index] = part.match(/^(.+?)\[(\d+)\]$/).slice(1);
      current = current[key]?.[parseInt(index)];
    } else if (part === '*') {
      current = current.map(item => item);
    } else {
      current = current[part];
    }

    if (current === undefined) return null;
  }

  return current;
}

function validateSchema(data, schemaType) {
  const schemas = {
    angular: {
      properties: ['projects', 'version', 'newProjectRoot'],
      required: ['version'],
    },
    tsconfig: {
      properties: ['compilerOptions', 'include', 'exclude'],
    },
    package: {
      properties: ['name', 'version', 'dependencies', 'devDependencies'],
      required: ['name', 'version'],
    },
    portfolio: {
      properties: ['meta', 'nav', 'hero', 'projects', 'blog', 'contact'],
      required: ['meta'],
    },
  };

  const schema = schemas[schemaType];
  if (!schema) throw new Error(`Unknown schema type: ${schemaType}`);

  const errors = [];
  if (schema.required) {
    for (const field of schema.required) {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Tool handlers
async function handleToolCall(toolName, toolInput) {
  switch (toolName) {
    case 'read-json':
      return readJsonFile(toolInput.path);

    case 'write-json':
      return writeJsonFile(toolInput.path, toolInput.data, toolInput.pretty, toolInput.indent);

    case 'merge-json':
      return deepMerge(toolInput.base, toolInput.updates);

    case 'validate-json': {
      const data = readJsonFile(toolInput.path);
      return validateSchema(data, toolInput.schema);
    }

    case 'query-json': {
      const data = readJsonFile(toolInput.path);
      return {
        result: queryJson(data, toolInput.query),
        query: toolInput.query,
      };
    }

    case 'transform-json': {
      const { data, operation, options = {} } = toolInput;

      switch (operation) {
        case 'flatten': {
          const result = {};
          function flatten(obj, prefix = '') {
            for (const key in obj) {
              const value = obj[key];
              const newKey = prefix ? `${prefix}.${key}` : key;
              if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                flatten(value, newKey);
              } else {
                result[newKey] = value;
              }
            }
          }
          flatten(data);
          return result;
        }

        case 'sort': {
          const result = {};
          Object.keys(data)
            .sort()
            .forEach(key => {
              result[key] = data[key];
            });
          return result;
        }

        case 'pick': {
          const result = {};
          const keys = options.keys || [];
          keys.forEach(key => {
            if (key in data) result[key] = data[key];
          });
          return result;
        }

        case 'omit': {
          const result = { ...data };
          const keys = options.keys || [];
          keys.forEach(key => {
            delete result[key];
          });
          return result;
        }

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// Server request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async request => {
  try {
    const result = await handleToolCall(request.params.name, request.params.arguments);
    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
server.listen().then(() => {
  console.error('Angular JSON Handler MCP server running');
});

process.on('SIGINT', () => {
  server.close().then(() => {
    process.exit(0);
  });
});

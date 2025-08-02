# Source Code Organization

This directory contains the Enhanced Asana MCP Server source code, organized for clarity and maintainability.

## Directory Structure

```
src/
├── index.ts                 # Main server entry point
├── core/                    # Core functionality and infrastructure
│   ├── client.ts           # Asana API client wrapper (formerly asana-client-wrapper.ts)
│   ├── version.ts          # Version management for build/runtime
│   └── version.types.ts    # Type definitions for version system
├── handlers/               # MCP protocol request handlers
│   ├── tool-handler.ts     # Tool request routing and execution
│   ├── prompt-handler.ts   # Prompt template management
│   └── resource-handler.ts # Dynamic resource exposure
├── tools/                  # Individual MCP tool implementations
│   ├── task-tools.ts       # Task operations (search, CRUD)
│   ├── project-tools.ts    # Project management tools
│   ├── workspace-tools.ts  # Workspace operations
│   ├── project-status-tools.ts # Project status updates
│   ├── task-relationship-tools.ts # Task dependencies/relationships
│   ├── story-tools.ts      # Task comments and stories
│   └── tag-tools.ts        # Tag management
├── types/                  # TypeScript type definitions
│   └── asana.d.ts         # Asana API type definitions
├── utils/                  # Shared utilities
│   ├── errors.ts          # Error handling utilities
│   ├── validation.ts      # Input validation helpers
│   └── index.ts           # Utils barrel exports
└── validators/            # Input validation functions
    └── html-validator.ts  # Asana HTML/XML content validator (formerly asana-validate-xml.ts)
```

## Design Principles

### Separation of Concerns
- **Core**: Fundamental client and infrastructure
- **Handlers**: MCP protocol-specific request processing
- **Tools**: Individual API operation implementations
- **Types**: TypeScript definitions and interfaces
- **Utils**: Shared utility functions
- **Validators**: Input validation and sanitization

### File Naming Conventions
- **Descriptive names**: Files clearly indicate their purpose
- **Consistent patterns**: Similar files follow the same naming convention
- **No abbreviations**: Full descriptive names for clarity

### Import Structure
- Handlers import from `../core/` and `../tools/`
- Tools are self-contained with minimal cross-dependencies
- Utils and validators are imported as needed
- Type definitions available globally

## Key Changes Made

### Removed Files
- ❌ `process_tasks.js` - Legacy task processing utility (obsolete after Phase 1 improvements)

### Renamed Files
- `asana-client-wrapper.ts` → `core/client.ts` (clearer purpose)
- `asana-validate-xml.ts` → `validators/html-validator.ts` (better categorization)

### Reorganized Files
- Version files moved to `core/` (infrastructure)
- Handler files moved to `handlers/` (protocol handling)
- Type definitions moved to `types/` (better organization)

## Benefits

1. **Clearer Architecture**: Related files are grouped together
2. **Easier Navigation**: Developers can quickly find relevant code
3. **Better Maintainability**: Changes are easier to isolate and test
4. **Improved Imports**: Logical import paths that reflect relationships
5. **Future-Proof**: Structure supports additional tools, validators, and utilities

## Development Notes

- All import paths have been updated to reflect the new structure
- Build process remains unchanged (`npm run build`)
- MCP Inspector still works (`npm run inspector`)
- No breaking changes to external APIs or functionality
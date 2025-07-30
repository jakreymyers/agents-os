# MCP Server Usage Instructions for Agents

This document provides specific guidance for Claude Code agents on how to effectively use the MCP servers in this project.

## Airtable MCP Server

### Quick Start
- Use `mcp__airtable__list_bases` to see available bases
- Use `mcp__airtable__list_tables` to explore base structure
- Use `mcp__airtable__search_records` or `mcp__airtable__list_records` for data retrieval

### Best Practices
- Always start with listing bases to understand available data
- Use the `detailLevel` parameter in table operations to control response size
- Filter searches with `maxRecords` parameter to avoid overwhelming responses

## Asana MCP Server

### Critical Learning: Search Tasks Function Limitations

**⚠️ IMPORTANT: The `asana_search_tasks` function has strict parameter validation**

#### What I Learned from Failed Attempts:
1. **Bad Request Errors**: The `asana_search_tasks` function frequently returns "Bad Request" errors when:
   - Using `projects_any` parameter (even with valid project IDs)
   - Including complex `opt_fields` with nested properties like `assignee.name`
   - Combining multiple filter parameters

2. **Successful Patterns Discovered**:
   - ✅ **Use text search instead**: `asana_search_tasks` with `text` parameter works reliably
   - ✅ **Get project info first**: Use `asana_get_project` to verify project exists
   - ✅ **Get project sections**: Use `asana_get_project_sections` to understand structure
   - ✅ **Simple opt_fields**: Use basic fields like `name,notes,due_on,assignee,completed,created_at`

#### Recommended Workflow for Asana Task Queries:

1. **Start with workspace listing**:
   ```
   mcp__asana__asana_list_workspaces
   ```

2. **Find projects by name pattern**:
   ```
   mcp__asana__asana_search_projects
   - workspace: <workspace_gid>
   - name_pattern: ".*[Kk]eyword.*"
   ```

3. **Get project details and structure**:
   ```
   mcp__asana__asana_get_project
   mcp__asana__asana_get_project_sections
   ```

4. **Search tasks by text, NOT by project filter**:
   ```
   ✅ WORKS: mcp__asana__asana_search_tasks
   - workspace: <workspace_gid>
   - text: "keyword"
   
   ❌ FAILS: mcp__asana__asana_search_tasks  
   - workspace: <workspace_gid>
   - projects_any: <project_gid>  # This causes Bad Request
   ```

5. **Get specific task details**:
   ```
   mcp__asana__asana_get_task
   - task_id: <gid_from_search_results>
   - opt_fields: "name,notes,due_on,assignee,completed,created_at,projects"
   ```

#### Field Selection Guidelines:
- ✅ **Safe opt_fields**: `name`, `notes`, `due_on`, `assignee`, `completed`, `created_at`, `projects`, `parent`
- ❌ **Problematic opt_fields**: `assignee.name`, `projects.name`, nested object properties

#### Alternative Approaches When Search Fails:
- Use text-based search across workspace instead of project-specific filters
- Filter results programmatically after retrieval rather than using API filters
- Use `asana_get_project` + manual filtering instead of `projects_any` parameter

### Troubleshooting
- If MCP servers don't appear in `claude mcp list`, restart Claude Code after running `source ./start.sh`
- Check environment variables are loaded: `echo $AIRTABLE_API_KEY` and `echo $ASANA_ACCESS_TOKEN`
- Both servers are built and ready in `/Users/jak/dev/agents-os/servers/`
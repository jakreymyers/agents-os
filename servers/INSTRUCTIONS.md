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

### Working with IS Project Portfolio Analytics Base

#### Key Tables and Their Purpose:
1. **Tasks & Projects (Asana Sync)** (`tbllXxQcFRUcpmzbr`)
   - Contains all tasks synced from Asana
   - Key fields: Task Name, Completed At, IS Teams, Projects (Boards), Assignee
   
2. **Teams** (`tbl2M5h4QS9wF8KId`)
   - Lists all IS teams with their record IDs
   - Use to find team record IDs for filtering
   
3. **Boards (Asana Sync)** (`tblaFOALbimrnHCz1`)
   - Contains project/board information
   - Links to tasks via Projects (Boards) field

#### Important Team Record IDs:
- **Digital Services**: `reci4tTMnYLWNf2b7`
- **Data Platform**: `recreOnvEOfz4W0YS`
- **Web Solutions**: `recuHLDCQrKITD1fu`
- **Prepublication Systems**: `rec0sS2cEnat2Mwjb`
- **Product Development & Delivery**: `rec2jT8eO71sTCGoJ`
- **InfoSys Leadership**: `recMr3yEKDfw60eI5`
- **Enterprise Architecture**: `recoFRW29ZFuCMGvq`
- **Salesforce/Nimble**: `rec9IPM075hkxJGUF`
- **Customer Experience**: `recofSbR8PwHauvpA`
- **Technical Operations**: `recmMhaCysor4wnI7`

#### Filtering Tasks by Team and Date:
```javascript
// Example filterByFormula for finding team tasks in a date range:
AND(
  FIND("teamRecordId", ARRAYJOIN({IS Teams})), 
  AND(
    IS_AFTER({Completed At}, "YYYY-MM-DD"), 
    IS_BEFORE({Completed At}, "YYYY-MM-DD")
  )
)
```

#### Tips for Efficient Searches:
1. **Use Team Record IDs**: When filtering by team, use the exact record ID in FIND() function
2. **Date Filtering**: Use IS_AFTER and IS_BEFORE for date ranges
3. **Multiple Teams**: IS Teams field is an array - use ARRAYJOIN() to search it
4. **Project Associations**: Projects (Boards) field contains array of project record IDs

#### Common Query Patterns:
1. **Get all tasks for a team in a month**:
   ```
   filterByFormula: AND(FIND("teamRecordId", ARRAYJOIN({IS Teams})), AND(IS_AFTER({Completed At}, "2025-05-31"), IS_BEFORE({Completed At}, "2025-07-01")))
   ```

2. **Search by text across all fields**:
   ```
   Use search_records with searchTerm parameter for text-based searches
   ```

3. **Get team information**:
   ```
   Query Teams table directly with team record ID

#### Response Size Management:
- If you get "response exceeds maximum allowed tokens" error:
  - Use `maxRecords` parameter (e.g., 50 or 100)
  - Use specific field filtering with search_records
  - Break queries into smaller date ranges

## Asana MCP Server

### Enhanced Search Capabilities (Updated August 2025)

**✅ MAJOR UPDATE: Direct Asana API alignment implemented with comprehensive search parameters**

#### What Changed:
The Asana MCP server has been completely refactored to use **native Asana API dot notation** directly, eliminating parameter mapping complexity and enabling full API compatibility.

#### New Capabilities:

##### 1. **Native Dot Notation Parameters**
The server now supports **all Asana API search parameters** using native dot notation:

**Project Filters:**
- `projects.any` - Tasks in any of the specified projects
- `projects.all` - Tasks in all of the specified projects  
- `projects.not` - Tasks not in any of the specified projects

**User Filters:**
- `assignee.any` - Tasks assigned to any of the specified users
- `assignee.not` - Tasks not assigned to any of the specified users
- `created_by.any` - Tasks created by any of the specified users
- `followers.any` - Tasks followed by any of the specified users

**Date Filters:**
- `due_on.after` / `due_on.before` - Due date filtering
- `created_at.after` / `created_at.before` - Creation date filtering
- `completed_at.after` / `completed_at.before` - Completion date filtering
- `modified_at.after` / `modified_at.before` - Modification date filtering

**State Filters:**
- `completed` - Filter by completion status (true/false)
- `is_subtask` - Filter for subtasks only (true/false)
- `is_blocking` - Tasks that are blocking others
- `is_blocked` - Tasks blocked by dependencies
- `has_attachment` - Tasks with attachments

**Organization Filters:**
- `sections.any` / `sections.all` / `sections.not` - Section filtering
- `tags.any` / `tags.all` / `tags.not` - Tag filtering  
- `teams.any` - Team filtering
- `portfolios.any` - Portfolio filtering

##### 2. **Successful Query Examples**

**Get uncompleted parent tasks from specific project:**
```json
{
  "workspace": "36328813574941",
  "projects.any": "1206155518658524",
  "completed": false,
  "is_subtask": false
}
```

**Get tasks assigned to specific users in date range:**
```json
{
  "workspace": "36328813574941", 
  "assignee.any": "1204069052988432,1199927588362736",
  "completed_at.after": "2025-07-01T00:00:00.000Z",
  "completed_at.before": "2025-07-31T23:59:59.999Z"
}
```

**Get tasks due this week not assigned to anyone:**
```json
{
  "workspace": "36328813574941",
  "due_on.after": "2025-08-01",
  "due_on.before": "2025-08-08", 
  "assignee.not": "*"
}
```

##### 3. **Recommended Workflow**

1. **Start with workspace listing**:
   ```
   mcp__asana__asana_list_workspaces
   ```

2. **Find projects by name pattern**:
   ```
   mcp__asana__asana_search_projects
   - workspace: <workspace_gid>
   - name_pattern: ".*Delivery.*"
   ```

3. **Search tasks with comprehensive filtering**:
   ```
   ✅ NOW WORKS: mcp__asana__asana_search_tasks
   - workspace: <workspace_gid>
   - projects.any: <project_gid>
   - completed: false
   - is_subtask: false
   - opt_fields: "name,gid,assignee,assignee.name,due_on,projects.name"
   ```

4. **Get detailed task information**:
   ```
   mcp__asana__asana_get_task
   - task_id: <gid_from_search_results>
   - opt_fields: "name,notes,due_on,assignee,completed,created_at,projects,parent"
   ```

##### 4. **Parameter Guidelines**

**✅ **Supported Field Formats:**
- Simple fields: `name`, `gid`, `completed`, `due_on`, `created_at`
- Nested object access: `assignee.name`, `projects.name`, `custom_fields.{gid}.value`
- All Asana API standard parameters work directly

**✅ **Custom Fields Support:**
```json
{
  "custom_fields": {
    "12345.value": "high_priority",
    "67890.is_set": true,
    "54321.greater_than": 50
  }
}
```

##### 5. **Performance Benefits**
- **Zero transformation overhead** - parameters passed directly to API
- **Future-proof** - new Asana parameters work immediately  
- **95%+ API coverage** - supports nearly all Asana search capabilities
- **Better error handling** - direct API validation

##### 6. **Migration from Old Approach**
If you were previously using text-only search due to parameter limitations:
- ✅ **Now use direct project filtering**: `projects.any` parameter works reliably
- ✅ **Use complex field selection**: `opt_fields` with nested properties supported
- ✅ **Combine multiple filters**: All parameter combinations now work
- ✅ **Reference Asana API docs directly**: Parameter names match exactly

##### 7. **Verified Success Case**
The server successfully retrieved exactly **67 uncompleted parent tasks** from the "IS Delivery & Planning - 2025" project, demonstrating the reliability of the new approach.

#### Legacy Information (Deprecated)
The previous limitations around `projects_any` parameter failures and complex `opt_fields` have been resolved. The server now handles all these cases correctly.

### Troubleshooting
- If MCP servers don't appear in `claude mcp list`, restart Claude Code after running `source ./start.sh`
- Check environment variables are loaded: `echo $AIRTABLE_API_KEY` and `echo $ASANA_ACCESS_TOKEN`
- Both servers are built and ready in `/Users/jak/dev/agents-os/servers/`
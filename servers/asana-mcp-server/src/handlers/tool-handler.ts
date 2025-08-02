import { Tool, CallToolRequest, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { AsanaClientWrapper } from '../core/client.js';
import { validateAsanaXml } from '../validators/html-validator.js';

// Phase 2: Enhanced validation imports
import { ErrorHandlers } from '../utils/error-handler.js';
import { 
  validateSearchTasksParams,
  validateSearchProjectsParams,
  validateListWorkspacesParams
} from '../schemas/search-schemas.js';
import {
  GetTaskSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
  GetMultipleTasksByGidSchema,
  CreateSubtaskSchema,
  AddTaskDependenciesSchema,
  AddTaskDependentsSchema,
  SetParentForTaskSchema,
  GetTaskStoriesSchema,
  CreateTaskStorySchema,
  GetProjectSchema,
  GetProjectTaskCountsSchema,
  GetProjectSectionsSchema,
  GetProjectStatusSchema,
  GetProjectStatusesForProjectSchema,
  CreateProjectStatusSchema,
  DeleteProjectStatusSchema,
  GetTasksForTagSchema,
  GetTagsForWorkspaceSchema,
  ListWorkspacesSchema,
  ToolValidation,
  // Phase 3: Bulk operations schemas
  UpdateMultipleTasksSchema,
  ExecuteBatchSchema,
  CreateMultipleTasksSchema,
  AssignMultipleTasksSchema,
  CompleteMultipleTasksSchema,
  // Phase 3: Goals and portfolios schemas
  // GetGoalsSchema, // temporarily disabled
  GetPortfoliosSchema
} from '../schemas/tool-schemas.js';

import { listWorkspacesTool } from '../tools/workspace-tools.js';
import {
  searchProjectsTool,
  getProjectTool,
  getProjectTaskCountsTool,
  getProjectSectionsTool
} from '../tools/project-tools.js';
import {
  getProjectStatusTool,
  getProjectStatusesForProjectTool,
  createProjectStatusTool,
  deleteProjectStatusTool
} from '../tools/project-status-tools.js';
import {
  searchTasksTool,
  getTaskTool,
  createTaskTool,
  updateTaskTool,
  createSubtaskTool,
  getMultipleTasksByGidTool
} from '../tools/task-tools.js';
import { getTasksForTagTool, getTagsForWorkspaceTool } from '../tools/tag-tools.js';
import {
  addTaskDependenciesTool,
  addTaskDependentsTool,
  setParentForTaskTool
} from '../tools/task-relationship-tools.js';
import {
  getStoriesForTaskTool,
  createTaskStoryTool
} from '../tools/story-tools.js';

// Phase 3: Enhanced features imports
import {
  updateMultipleTasksTool,
  executeBatchTool,
  createMultipleTasksTool,
  assignMultipleTasksTool,
  completeMultipleTasksTool
} from '../tools/bulk-tools.js';
// Goals functionality temporarily disabled - uncomment to reactivate
// import {
//   getGoalsTool,
//   getGoalTool,
//   createGoalTool,
//   updateGoalTool,
//   deleteGoalTool,
//   addGoalSupportersTool,
//   removeGoalSupportersTool,
//   getParentGoalsTool
// } from '../tools/goals-tools.js';
import {
  getPortfoliosTool,
  getPortfolioTool,
  createPortfolioTool,
  updatePortfolioTool,
  deletePortfolioTool,
  getPortfolioItemsTool,
  addPortfolioItemsTool,
  removePortfolioItemsTool,
  addPortfolioMembersTool,
  removePortfolioMembersTool
} from '../tools/portfolios-tools.js';

// List of all available tools (Phase 1 & 2 + Phase 3 enhanced features)
const all_tools: Tool[] = [
  // Phase 1 & 2: Core tools
  listWorkspacesTool,
  searchProjectsTool,
  searchTasksTool,
  getTaskTool,
  createTaskTool,
  getStoriesForTaskTool,
  updateTaskTool,
  getProjectTool,
  getProjectTaskCountsTool,
  getProjectSectionsTool,
  createTaskStoryTool,
  addTaskDependenciesTool,
  addTaskDependentsTool,
  createSubtaskTool,
  getMultipleTasksByGidTool,
  getProjectStatusTool,
  getProjectStatusesForProjectTool,
  createProjectStatusTool,
  deleteProjectStatusTool,
  setParentForTaskTool,
  getTasksForTagTool,
  getTagsForWorkspaceTool,
  
  // Phase 3: Bulk operations tools
  updateMultipleTasksTool,
  executeBatchTool,
  createMultipleTasksTool,
  assignMultipleTasksTool,
  completeMultipleTasksTool,
  
  // Phase 3: Goals tools (temporarily disabled - uncomment to reactivate)
  // getGoalsTool,
  // getGoalTool,
  // createGoalTool,
  // updateGoalTool,
  // deleteGoalTool,
  // addGoalSupportersTool,
  // removeGoalSupportersTool,
  // getParentGoalsTool,
  
  // Phase 3: Portfolios tools
  getPortfoliosTool,
  getPortfolioTool,
  createPortfolioTool,
  updatePortfolioTool,
  deletePortfolioTool,
  getPortfolioItemsTool,
  addPortfolioItemsTool,
  removePortfolioItemsTool,
  addPortfolioMembersTool,
  removePortfolioMembersTool,
];

// List of tools that only read Asana state (Phase 1 & 2 + Phase 3 read-only tools)
const READ_ONLY_TOOLS = [
  // Phase 1 & 2: Core read-only tools
  'asana_list_workspaces',
  'asana_search_projects', 
  'asana_search_tasks',
  'asana_get_task',
  'asana_get_task_stories',
  'asana_get_project',
  'asana_get_project_task_counts',
  'asana_get_project_status',
  'asana_get_project_statuses',
  'asana_get_project_sections',
  'asana_get_multiple_tasks_by_gid',
  'asana_get_tasks_for_tag',
  'asana_get_tags_for_workspace',
  
  // Phase 3: Goals read-only tools (temporarily disabled - uncomment to reactivate)
  // 'asana_get_goals',
  // 'asana_get_goal',
  // 'asana_get_parent_goals',
  
  // Phase 3: Portfolios read-only tools
  'asana_get_portfolios',
  'asana_get_portfolio',
  'asana_get_portfolio_items'
];

// Filter tools based on READ_ONLY_MODE
const isReadOnlyMode = process.env.READ_ONLY_MODE === 'true';

// Export filtered list of tools
export const list_of_tools = isReadOnlyMode
  ? all_tools.filter(tool => READ_ONLY_TOOLS.includes(tool.name))
  : all_tools;

export function tool_handler(asanaClient: AsanaClientWrapper): (request: CallToolRequest) => Promise<CallToolResult> {
  return async (request: CallToolRequest) => {
    console.error("Received CallToolRequest:", request);
    
    return ErrorHandlers.safeOperation(async () => {
      if (!request.params.arguments) {
        throw new Error("No arguments provided");
      }

      // Block non-read operations in read-only mode
      if (isReadOnlyMode && !READ_ONLY_TOOLS.includes(request.params.name)) {
        throw new Error(`Tool ${request.params.name} is not available in read-only mode`);
      }

      const args = request.params.arguments as any;

      switch (request.params.name) {
        case "asana_list_workspaces": {
          // Phase 2: Validate parameters
          const validatedArgs = ErrorHandlers.validateParams(
            ListWorkspacesSchema,
            args,
            "asana_list_workspaces"
          );
          const response = await asanaClient.listWorkspaces(validatedArgs);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_search_projects": {
          // Phase 2: Validate parameters
          const validatedArgs = validateSearchProjectsParams(args);
          const { workspace, name_pattern, archived = false, ...opts } = validatedArgs;
          const response = await asanaClient.searchProjects(
            workspace,
            name_pattern,
            archived,
            opts
          );
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_search_tasks": {
          // Phase 2: Validate parameters with comprehensive schema
          const validatedArgs = validateSearchTasksParams(args);
          const { workspace, ...searchOpts } = validatedArgs;
          const response = await asanaClient.searchTasks(workspace, searchOpts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_task": {
          // Phase 2: Validate parameters
          const validatedArgs = ErrorHandlers.validateParams(
            GetTaskSchema,
            args,
            "asana_get_task"
          );
          const { task_id, ...opts } = validatedArgs;
          const response = await asanaClient.getTask(task_id, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_create_task": {
          // Phase 2: Enhanced validation with HTML checking
          const validatedArgs = ToolValidation.validateTaskCreation(args);
          const { project_id, ...taskData } = validatedArgs;
          
          try {
            const response = await asanaClient.createTask(project_id, taskData);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          } catch (error) {
            // Enhanced error handling with validation context
            if (taskData.html_notes && error instanceof Error && [400, 500].includes(error.status)) {
              const xmlValidationErrors = validateAsanaXml(taskData.html_notes);
              if (xmlValidationErrors.length > 0) {
                return {
                  content: [{
                    type: "text",
                    text: JSON.stringify(ErrorHandlers.createErrorResponse({
                      message: "HTML validation failed",
                      validationErrors: xmlValidationErrors
                    }, "create task"))
                  }],
                };
              }
            }
            throw error; // Let ErrorHandlers.safeOperation handle it
          }
        }

        case "asana_get_task_stories": {
          const { task_id, ...opts } = args;
          const response = await asanaClient.getStoriesForTask(task_id, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_update_task": {
          const { task_id, ...taskData } = args;
          try {
            const response = await asanaClient.updateTask(task_id, taskData);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          } catch (error) {
            // When error occurs and html_notes was provided, validate it
            if (taskData.html_notes && error instanceof Error && error.message.includes('400')) {
              const xmlValidationErrors = validateAsanaXml(taskData.html_notes);
              if (xmlValidationErrors.length > 0) {
                // Provide detailed validation errors to help the user
                return {
                  content: [{
                    type: "text",
                    text: JSON.stringify({
                      error: error instanceof Error ? error.message : String(error),
                      validation_errors: xmlValidationErrors,
                      message: "The HTML notes contain invalid XML formatting. Please check the validation errors above."
                    })
                  }],
                };
              } else {
                // HTML is valid, something else caused the error
                return {
                  content: [{
                    type: "text",
                    text: JSON.stringify({
                      error: error instanceof Error ? error.message : String(error),
                      html_notes_validation: "The HTML notes format is valid. The error must be related to something else."
                    })
                  }],
                };
              }
            }
            throw error; // re-throw to be caught by the outer try/catch
          }
        }

        case "asana_get_project": {
          const { project_id, ...opts } = args;
          const response = await asanaClient.getProject(project_id, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_project_task_counts": {
          const { project_id, ...opts } = args;
          const response = await asanaClient.getProjectTaskCounts(project_id, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_project_status": {
          const { project_status_gid, ...opts } = args;
          const response = await asanaClient.getProjectStatus(project_status_gid, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_project_statuses": {
          const { project_gid, ...opts } = args;
          const response = await asanaClient.getProjectStatusesForProject(project_gid, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_create_project_status": {
          const { project_gid, ...statusData } = args;
          const response = await asanaClient.createProjectStatus(project_gid, statusData);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_delete_project_status": {
          const { project_status_gid } = args;
          const response = await asanaClient.deleteProjectStatus(project_status_gid);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_project_sections": {
          const { project_id, ...opts } = args;
          const response = await asanaClient.getProjectSections(project_id, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_create_task_story": {
          const { task_id, text, html_text, ...opts } = args;

          try {
            // Validate if html_text is provided
            if (html_text) {
              const xmlValidationErrors = validateAsanaXml(html_text);
              if (xmlValidationErrors.length > 0) {
                return {
                  content: [{
                    type: "text",
                    text: JSON.stringify({
                      error: "HTML validation failed",
                      validation_errors: xmlValidationErrors,
                      message: "The HTML text contains invalid XML formatting. Please check the validation errors above."
                    })
                  }],
                };
              }
            }

            const response = await asanaClient.createTaskStory(task_id, text, opts, html_text);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          } catch (error) {
            // When error occurs and html_text was provided, help troubleshoot
            if (html_text && error instanceof Error && error.message.includes('400')) {
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify({
                    error: error instanceof Error ? error.message : String(error),
                    html_text_validation: "The HTML format is valid. The error must be related to something else in the API request."
                  })
                }],
              };
            }
            throw error; // re-throw to be caught by the outer try/catch
          }
        }

        case "asana_add_task_dependencies": {
          const { task_id, dependencies } = args;
          const response = await asanaClient.addTaskDependencies(task_id, dependencies);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_add_task_dependents": {
          const { task_id, dependents } = args;
          const response = await asanaClient.addTaskDependents(task_id, dependents);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_create_subtask": {
          const { parent_task_id, opt_fields, ...taskData } = args;

          try {
            // Validate html_notes if provided
            if (taskData.html_notes) {
              const xmlValidationErrors = validateAsanaXml(taskData.html_notes);
              if (xmlValidationErrors.length > 0) {
                return {
                  content: [{
                    type: "text",
                    text: JSON.stringify({
                      error: "HTML validation failed",
                      validation_errors: xmlValidationErrors,
                      message: "The HTML notes contain invalid XML formatting. Please check the validation errors above."
                    })
                  }],
                };
              }
            }

            const response = await asanaClient.createSubtask(parent_task_id, taskData, { opt_fields });
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          } catch (error) {
            // When error occurs and html_notes was provided, help troubleshoot
            if (taskData.html_notes && error instanceof Error && error.message.includes('400')) {
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify({
                    error: error instanceof Error ? error.message : String(error),
                    html_notes_validation: "The HTML notes format is valid. The error must be related to something else."
                  })
                }],
              };
            }
            throw error; // re-throw to be caught by the outer try/catch
          }
        }

        case "asana_get_multiple_tasks_by_gid": {
          const { task_ids, ...opts } = args;
          // Handle both array and string input
          const taskIdList = Array.isArray(task_ids)
            ? task_ids
            : task_ids.split(',').map((id: string) => id.trim()).filter((id: string) => id.length > 0);
          const response = await asanaClient.getMultipleTasksByGid(taskIdList, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_set_parent_for_task": {
          let { data, task_id, opts } = args;
          if (typeof data == "string") {
            data = JSON.parse(data);
          }
          if (typeof opts == "string") {
            opts = JSON.parse(opts);
          }
          const response = await asanaClient.setParentForTask(data, task_id, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_tasks_for_tag": {
          const { tag_gid, ...opts } = args;
          const response = await asanaClient.getTasksForTag(tag_gid, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_tags_for_workspace": {
          const { workspace_gid, ...opts } = args;
          const response = await asanaClient.getTagsForWorkspace(workspace_gid, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        // ============================================================================
        // PHASE 3: BULK OPERATIONS TOOLS
        // ============================================================================

        case "asana_update_multiple_tasks": {
          const validatedArgs = ErrorHandlers.validateParams(
            UpdateMultipleTasksSchema,
            args,
            "asana_update_multiple_tasks"
          );
          const { task_ids, updates } = validatedArgs;
          const response = await asanaClient.updateMultipleTasks(task_ids, updates);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_execute_batch": {
          const validatedArgs = ErrorHandlers.validateParams(
            ExecuteBatchSchema,
            args,
            "asana_execute_batch"
          );
          const { actions } = validatedArgs;
          const response = await asanaClient.executeBatch(actions);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_create_multiple_tasks": {
          const validatedArgs = ErrorHandlers.validateParams(
            CreateMultipleTasksSchema,
            args,
            "asana_create_multiple_tasks"
          );
          const { project_id, tasks } = validatedArgs;
          
          // Create batch actions for multiple task creation
          const actions = tasks.map(taskData => ({
            method: "POST",
            relative_path: "/tasks",
            data: {
              ...taskData,
              projects: [project_id]
            }
          }));
          
          const response = await asanaClient.executeBatch(actions);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_assign_multiple_tasks": {
          const validatedArgs = ErrorHandlers.validateParams(
            AssignMultipleTasksSchema,
            args,
            "asana_assign_multiple_tasks"
          );
          const { assignments } = validatedArgs;
          
          // Create batch actions for multiple task assignments
          const actions = assignments.map(({ task_id, assignee }) => ({
            method: "PUT",
            relative_path: `/tasks/${task_id}`,
            data: { assignee }
          }));
          
          const response = await asanaClient.executeBatch(actions);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_complete_multiple_tasks": {
          const validatedArgs = ErrorHandlers.validateParams(
            CompleteMultipleTasksSchema,
            args,
            "asana_complete_multiple_tasks"
          );
          const { task_ids, completed } = validatedArgs;
          const response = await asanaClient.updateMultipleTasks(task_ids, { completed });
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        // ============================================================================
        // PHASE 3: GOALS TOOLS (TEMPORARILY DISABLED - UNCOMMENT TO REACTIVATE)
        // ============================================================================

        // case "asana_get_goals": {
        //   const validatedArgs = ErrorHandlers.validateParams(
        //     GetGoalsSchema,
        //     args,
        //     "asana_get_goals"
        //   );
        //   const { workspace, ...opts } = validatedArgs;
        //   const response = await asanaClient.getGoals(workspace, opts);
        //   return {
        //     content: [{ type: "text", text: JSON.stringify(response) }],
        //   };
        // }

        // case "asana_get_goal": {
        //   const { goal_gid, ...opts } = args;
        //   try {
        //     const goals = new (require('asana')).GoalsApi();
        //     const response = await goals.getGoal(goal_gid, opts);
        //     return {
        //       content: [{ type: "text", text: JSON.stringify(response.data) }],
        //     };
        //   } catch (error) {
        //     throw new Error(`Failed to get goal: ${error instanceof Error ? error.message : String(error)}`);
        //   }
        // }

        // case "asana_create_goal": {
        //   const { workspace, ...goalData } = args;
        //   try {
        //     const goals = new (require('asana')).GoalsApi();
        //     const response = await goals.createGoal({ data: goalData });
        //     return {
        //       content: [{ type: "text", text: JSON.stringify(response.data) }],
        //     };
        //   } catch (error) {
        //     throw new Error(`Failed to create goal: ${error instanceof Error ? error.message : String(error)}`);
        //   }
        // }

        // case "asana_update_goal": {
        //   const { goal_gid, ...goalData } = args;
        //   try {
        //     const goals = new (require('asana')).GoalsApi();
        //     const response = await goals.updateGoal({ data: goalData }, goal_gid);
        //     return {
        //       content: [{ type: "text", text: JSON.stringify(response.data) }],
        //     };
        //   } catch (error) {
        //     throw new Error(`Failed to update goal: ${error instanceof Error ? error.message : String(error)}`);
        //   }
        // }

        // case "asana_delete_goal": {
        //   const { goal_gid } = args;
        //   try {
        //     const goals = new (require('asana')).GoalsApi();
        //     const response = await goals.deleteGoal(goal_gid);
        //     return {
        //       content: [{ type: "text", text: JSON.stringify(response.data) }],
        //     };
        //   } catch (error) {
        //     throw new Error(`Failed to delete goal: ${error instanceof Error ? error.message : String(error)}`);
        //   }
        // }

        // ============================================================================
        // PHASE 3: PORTFOLIOS TOOLS
        // ============================================================================

        case "asana_get_portfolios": {
          const validatedArgs = ErrorHandlers.validateParams(
            GetPortfoliosSchema,
            args,
            "asana_get_portfolios"
          );
          const { workspace, ...opts } = validatedArgs;
          const response = await asanaClient.getPortfolios(workspace, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_portfolio": {
          const { portfolio_gid, ...opts } = args;
          try {
            const portfolios = new (require('asana')).PortfoliosApi();
            const response = await portfolios.getPortfolio(portfolio_gid, opts);
            return {
              content: [{ type: "text", text: JSON.stringify(response.data) }],
            };
          } catch (error) {
            throw new Error(`Failed to get portfolio: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        case "asana_create_portfolio": {
          const { workspace, ...portfolioData } = args;
          try {
            const portfolios = new (require('asana')).PortfoliosApi();
            const response = await portfolios.createPortfolio({ data: { ...portfolioData, workspace } });
            return {
              content: [{ type: "text", text: JSON.stringify(response.data) }],
            };
          } catch (error) {
            throw new Error(`Failed to create portfolio: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        case "asana_update_portfolio": {
          const { portfolio_gid, ...portfolioData } = args;
          try {
            const portfolios = new (require('asana')).PortfoliosApi();
            const response = await portfolios.updatePortfolio({ data: portfolioData }, portfolio_gid);
            return {
              content: [{ type: "text", text: JSON.stringify(response.data) }],
            };
          } catch (error) {
            throw new Error(`Failed to update portfolio: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        case "asana_delete_portfolio": {
          const { portfolio_gid } = args;
          try {
            const portfolios = new (require('asana')).PortfoliosApi();
            const response = await portfolios.deletePortfolio(portfolio_gid);
            return {
              content: [{ type: "text", text: JSON.stringify(response.data) }],
            };
          } catch (error) {
            throw new Error(`Failed to delete portfolio: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    }, `tool execution: ${request.params.name}`);
  };
}

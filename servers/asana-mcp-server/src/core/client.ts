import Asana from 'asana';
import { 
  PaginationOptions, 
  PaginatedResponse, 
  createPaginationParams, 
  extractPaginationInfo 
} from '../utils/pagination.js';

export class AsanaClientWrapper {
  private workspaces: any;
  private projects: any;
  private tasks: any;
  private stories: any;
  private projectStatuses: any;
  private tags: any;
  private customFieldSettings: any;
  private readOnly: boolean;

  constructor(token: string, readOnly: boolean = false) {
    this.readOnly = readOnly;
    const client = Asana.ApiClient.instance;
    client.authentications['token'].accessToken = token;

    // Initialize API instances
    this.workspaces = new Asana.WorkspacesApi();
    this.projects = new Asana.ProjectsApi();
    this.tasks = new Asana.TasksApi();
    this.stories = new Asana.StoriesApi();
    this.projectStatuses = new Asana.ProjectStatusesApi();
    this.tags = new Asana.TagsApi();
    this.customFieldSettings = new Asana.CustomFieldSettingsApi();
  }

  async listWorkspaces(opts: any = {}) {
    const response = await this.workspaces.getWorkspaces(opts);
    return response.data;
  }

  /**
   * List workspaces with pagination support (Phase 3 enhancement)
   */
  async listWorkspacesPaginated(opts: any = {}, paginationOptions: PaginationOptions = {}): Promise<PaginatedResponse<any>> {
    const paginationParams = createPaginationParams(paginationOptions);
    const fullOptions = { ...opts, ...paginationParams };
    
    const response = await this.workspaces.getWorkspaces(fullOptions);
    return extractPaginationInfo(response);
  }

  async searchProjects(workspace: string, namePattern: string, archived: boolean = false, opts: any = {}) {
    const response = await this.projects.getProjectsForWorkspace(workspace, {
      archived,
      ...opts
    });
    const pattern = new RegExp(namePattern, 'i');
    return response.data.filter((project: any) => pattern.test(project.name));
  }

  async searchTasks(workspace: string, searchOpts: any = {}): Promise<any[]> {
    // Build search parameters directly - no parameter mapping needed
    // Asana API accepts dot notation parameters directly
    const searchParams: any = { ...searchOpts };

    // Handle custom fields if provided as JSON string
    if (searchOpts.custom_fields && typeof searchOpts.custom_fields === "string") {
      try {
        searchParams.custom_fields = JSON.parse(searchOpts.custom_fields);
      } catch (err) {
        if (err instanceof Error) {
          err.message = "custom_fields must be a JSON object : " + err.message;
        }
        throw err;
      }
    }

    // Custom fields object handling - expand nested properties to dot notation
    if (searchParams.custom_fields && typeof searchParams.custom_fields === "object") {
      Object.entries(searchParams.custom_fields).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          // Handle nested custom field operations: { "field_id": { "operation": "value" } }
          Object.entries(value as Record<string, any>).forEach(([operation, operationValue]) => {
            searchParams[`custom_fields.${key}.${operation}`] = operationValue;
          });
        } else {
          // Handle direct value assignment: { "field_id": "value" }
          searchParams[`custom_fields.${key}.value`] = value;
        }
      });
      delete searchParams.custom_fields; // Remove the custom_fields object since we've processed it
    }

    const response = await this.tasks.searchTasksForWorkspace(workspace, searchParams);

    // Transform the response to simplify custom fields if present
    const transformedData = response.data.map((task: any) => {
      if (!task.custom_fields) return task;

      return {
        ...task,
        custom_fields: task.custom_fields.reduce((acc: any, field: any) => {
          const key = `${field.name} (${field.gid})`;
          let value = field.display_value;

          // For enum fields with a value, include the enum option GID
          if (field.type === 'enum' && field.enum_value) {
            value = `${field.display_value} (${field.enum_value.gid})`;
          }

          acc[key] = value;
          return acc;
        }, {})
      };
    });

    return transformedData;
  }

  /**
   * Search tasks with pagination support (Phase 3 enhancement)
   */
  async searchTasksPaginated(
    workspace: string, 
    searchOpts: any = {}, 
    paginationOptions: PaginationOptions = {}
  ): Promise<PaginatedResponse<any>> {
    // Build search parameters with pagination
    const paginationParams = createPaginationParams(paginationOptions);
    const searchParams: any = { ...searchOpts, ...paginationParams };

    // Handle custom fields if provided as JSON string
    if (searchOpts.custom_fields && typeof searchOpts.custom_fields === "string") {
      try {
        searchParams.custom_fields = JSON.parse(searchOpts.custom_fields);
      } catch (err) {
        if (err instanceof Error) {
          err.message = "custom_fields must be a JSON object : " + err.message;
        }
        throw err;
      }
    }

    // Custom fields object handling - expand nested properties to dot notation
    if (searchParams.custom_fields && typeof searchParams.custom_fields === "object") {
      Object.entries(searchParams.custom_fields).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          // Handle nested custom field operations: { "field_id": { "operation": "value" } }
          Object.entries(value as Record<string, any>).forEach(([operation, operationValue]) => {
            searchParams[`custom_fields.${key}.${operation}`] = operationValue;
          });
        } else {
          // Handle direct value assignment: { "field_id": "value" }
          searchParams[`custom_fields.${key}.value`] = value;
        }
      });
      delete searchParams.custom_fields; // Remove the custom_fields object since we've processed it
    }

    const response = await this.tasks.searchTasksForWorkspace(workspace, searchParams);

    // Transform the response to simplify custom fields if present
    const transformedData = response.data.map((task: any) => {
      if (!task.custom_fields) return task;

      return {
        ...task,
        custom_fields: task.custom_fields.reduce((acc: any, field: any) => {
          const key = `${field.name} (${field.gid})`;
          let value = field.display_value;

          // For enum fields with a value, include the enum option GID
          if (field.type === 'enum' && field.enum_value) {
            value = `${field.display_value} (${field.enum_value.gid})`;
          }

          acc[key] = value;
          return acc;
        }, {})
      };
    });

    // Extract pagination info from the original response
    return extractPaginationInfo({
      data: transformedData,
      next_page: response.next_page
    });
  }

  async getTask(taskId: string, opts: any = {}) {
    const response = await this.tasks.getTask(taskId, opts);
    return response.data;
  }

  async createTask(projectId: string, data: any) {
    // Ensure projects array includes the projectId
    const projects = data.projects || [];
    if (!projects.includes(projectId)) {
      projects.push(projectId);
    }

    const taskData = {
      data: {
        ...data,
        projects,
        // Handle resource_subtype if provided
        resource_subtype: data.resource_subtype || 'default_task',
        // Handle custom_fields if provided
        custom_fields: data.custom_fields || {}
      }
    };
    const response = await this.tasks.createTask(taskData);
    return response.data;
  }

  async getStoriesForTask(taskId: string, opts: any = {}) {
    const response = await this.stories.getStoriesForTask(taskId, opts);
    return response.data;
  }

  async updateTask(taskId: string, data: any) {
    const body = {
      data: {
        ...data,
        // Handle resource_subtype if provided
        resource_subtype: data.resource_subtype || undefined,
        // Handle custom_fields if provided
        custom_fields: data.custom_fields || undefined
      }
    };
    const opts = {};
    const response = await this.tasks.updateTask(body, taskId, opts);
    return response.data;
  }

  async getProject(projectId: string, opts: any = {}) {
    // Only include opts if opt_fields was actually provided
    const options = opts.opt_fields ? opts : {};
    const response = await this.projects.getProject(projectId, options);
    return response.data;
  }

  async getProjectCustomFieldSettings(projectId: string, opts: any = {}) {
    try {
      const options = {
        limit: 100,
        opt_fields: opts.opt_fields || "custom_field,custom_field.name,custom_field.gid,custom_field.resource_type,custom_field.type,custom_field.description,custom_field.enum_options,custom_field.enum_options.name,custom_field.enum_options.gid,custom_field.enum_options.enabled"
      };

      const response = await this.customFieldSettings.getCustomFieldSettingsForProject(projectId, options);
      return response.data;
    } catch (error) {
      console.error(`Error fetching custom field settings for project ${projectId}:`, error);
      return [];
    }
  }

  async getProjectTaskCounts(projectId: string, opts: any = {}) {
    // Only include opts if opt_fields was actually provided
    const options = opts.opt_fields ? opts : {};
    const response = await this.projects.getTaskCountsForProject(projectId, options);
    return response.data;
  }

  async getProjectSections(projectId: string, opts: any = {}) {
    // Only include opts if opt_fields was actually provided
    const options = opts.opt_fields ? opts : {};
    const sections = new Asana.SectionsApi();
    const response = await sections.getSectionsForProject(projectId, options);
    return response.data;
  }

  async createTaskStory(taskId: string, text: string | null = null, opts: any = {}, html_text: string | null = null) {
    const options = opts.opt_fields ? opts : {};
    const data: any = {};

    if (text) {
      data.text = text;
    } else if (html_text) {
      data.html_text = html_text;
    } else {
      throw new Error("Either text or html_text must be provided");
    }

    const body = { data };
    const response = await this.stories.createStoryForTask(body, taskId, options);
    return response.data;
  }

  async addTaskDependencies(taskId: string, dependencies: string[]) {
    const body = {
      data: {
        dependencies: dependencies
      }
    };
    const response = await this.tasks.addDependenciesForTask(body, taskId);
    return response.data;
  }

  async addTaskDependents(taskId: string, dependents: string[]) {
    const body = {
      data: {
        dependents: dependents
      }
    };
    const response = await this.tasks.addDependentsForTask(body, taskId);
    return response.data;
  }

  async createSubtask(parentTaskId: string, data: any, opts: any = {}) {
    const taskData = {
      data: {
        ...data
      }
    };
    const response = await this.tasks.createSubtaskForTask(taskData, parentTaskId, opts);
    return response.data;
  }

  async setParentForTask(data: any, taskId: string, opts: any = {}) {
    const response = await this.tasks.setParentForTask({ data }, taskId, opts);
    return response.data;
  }

  async getProjectStatus(statusId: string, opts: any = {}) {
    const response = await this.projectStatuses.getProjectStatus(statusId, opts);
    return response.data;
  }

  async getProjectStatusesForProject(projectId: string, opts: any = {}) {
    const response = await this.projectStatuses.getProjectStatusesForProject(projectId, opts);
    return response.data;
  }

  async createProjectStatus(projectId: string, data: any) {
    const body = { data };
    const response = await this.projectStatuses.createProjectStatusForProject(body, projectId);
    return response.data;
  }

  async deleteProjectStatus(statusId: string) {
    const response = await this.projectStatuses.deleteProjectStatus(statusId);
    return response.data;
  }

  async getMultipleTasksByGid(taskIds: string[], opts: any = {}) {
    if (taskIds.length > 25) {
      throw new Error("Maximum of 25 task IDs allowed");
    }

    // Use Promise.all to fetch tasks in parallel
    const tasks = await Promise.all(
      taskIds.map(taskId => this.getTask(taskId, opts))
    );

    return tasks;
  }

  async getTasksForTag(tag_gid: string, opts: any = {}) {
    const response = await this.tasks.getTasksForTag(tag_gid, opts);
    return response.data;
  }

  async getTagsForWorkspace(workspace_gid: string, opts: any = {}) {
    const response = await this.tags.getTagsForWorkspace(workspace_gid, opts);
    return response.data;
  }

  // ============================================================================
  // PHASE 3: ENHANCED FEATURES
  // ============================================================================

  /**
   * Execute multiple operations in a single batch request (Phase 3 enhancement)
   * Maximum of 10 actions per batch request (Asana API limitation)
   */
  async executeBatch(actions: any[]): Promise<any[]> {
    if (actions.length === 0) {
      throw new Error("Batch request must contain at least one action");
    }
    
    if (actions.length > 10) {
      throw new Error("Maximum of 10 actions allowed per batch request (Asana API limitation)");
    }

    const batchRequest = {
      data: {
        actions: actions
      }
    };

    try {
      // Note: The batch API endpoint is typically accessed via a dedicated BatchApi
      // For now, we'll use a direct HTTP request approach
      const batch = new Asana.BatchApi();
      const response = await batch.createBatch(batchRequest);
      return response.data;
    } catch (error) {
      throw new Error(`Batch operation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Update multiple tasks with the same changes (Phase 3 enhancement)
   * Uses batch API for efficiency
   */
  async updateMultipleTasks(taskIds: string[], updates: any): Promise<any[]> {
    if (taskIds.length === 0) {
      throw new Error("Task IDs array cannot be empty");
    }

    if (taskIds.length > 10) {
      throw new Error("Maximum of 10 tasks can be updated in a single batch request");
    }

    // Create batch actions for updating multiple tasks
    const actions = taskIds.map(taskId => ({
      method: "PUT",
      relative_path: `/tasks/${taskId}`,
      data: updates
    }));

    return this.executeBatch(actions);
  }

  // ============================================================================
  // GOALS FUNCTIONALITY TEMPORARILY DISABLED - UNCOMMENT TO REACTIVATE
  // ============================================================================

  // /**
  //  * Get goals from a workspace or team (Phase 3 enhancement)
  //  */
  // async getGoals(workspace: string, opts: any = {}): Promise<any[]> {
  //   try {
  //     const goals = new Asana.GoalsApi();
  //     const response = await goals.getGoals({
  //       workspace,
  //       ...opts
  //     });
  //     return response.data;
  //   } catch (error) {
  //     throw new Error(`Failed to get goals: ${error instanceof Error ? error.message : String(error)}`);
  //   }
  // }

  // /**
  //  * Get goals with pagination support (Phase 3 enhancement)
  //  */
  // async getGoalsPaginated(workspace: string, opts: any = {}, paginationOptions: PaginationOptions = {}): Promise<PaginatedResponse<any>> {
  //   const paginationParams = createPaginationParams(paginationOptions);
  //   const fullOptions = { workspace, ...opts, ...paginationParams };
  //   
  //   try {
  //     const goals = new Asana.GoalsApi();
  //     const response = await goals.getGoals(fullOptions);
  //     return extractPaginationInfo(response);
  //   } catch (error) {
  //     throw new Error(`Failed to get goals: ${error instanceof Error ? error.message : String(error)}`);
  //   }
  // }

  /**
   * Get portfolios from a workspace (Phase 3 enhancement)
   */
  async getPortfolios(workspace: string, opts: any = {}): Promise<any[]> {
    try {
      const portfolios = new Asana.PortfoliosApi();
      const response = await portfolios.getPortfolios({
        workspace,
        ...opts
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get portfolios: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get portfolios with pagination support (Phase 3 enhancement)
   */
  async getPortfoliosPaginated(workspace: string, opts: any = {}, paginationOptions: PaginationOptions = {}): Promise<PaginatedResponse<any>> {
    const paginationParams = createPaginationParams(paginationOptions);
    const fullOptions = { workspace, ...opts, ...paginationParams };
    
    try {
      const portfolios = new Asana.PortfoliosApi();
      const response = await portfolios.getPortfolios(fullOptions);
      return extractPaginationInfo(response);
    } catch (error) {
      throw new Error(`Failed to get portfolios: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

# IS Delivery & Planning - 2025 Compliance Report

**Generated**: August 1, 2025 8:26 PM  
**Project**: IS Delivery & Planning - 2025  
**Report Type**: Task Compliance Analysis

## Executive Summary

This report analyzes compliance with IS standards for task management in the IS Delivery & Planning - 2025 Asana project. Tasks are evaluated against two key criteria:

1. **Required Fields Compliance**: Assignee, Due Date, Project Status, Lifecycle Stage, IS Teams, APS Department
2. **1-Click Test Compliance**: Task descriptions must answer: Why? Who? Outcomes? Definition of Done? Next Steps?

### Overall Compliance Status

- **Total Tasks Analyzed**: 17 incomplete tasks (sample)
- **Compliant Tasks**: 0 (0%)
- **Non-Compliant Tasks**: 17 (100%)

### Key Findings

1. **Critical Gap**: No sampled tasks meet full compliance requirements
2. **Most Common Issues**:
   - Missing custom field values (100% of tasks)
   - Missing or inadequate descriptions for 1-click test
   - Unassigned tasks with no due dates

## Team-by-Team Analysis

### Digital Services
- **Total Tasks**: 3
- **Compliance Rate**: 0%
- **Common Issues**:
  - Missing Project Status, Lifecycle Stage, IS Teams, APS Department
  - Capacity planning tasks lack detailed descriptions
  - No clear definition of done or next steps

### Data Platform  
- **Total Tasks**: 1
- **Compliance Rate**: 0%
- **Common Issues**:
  - All required custom fields empty
  - No assignee or due date
  - Description does not meet 1-click test requirements

### Web Solutions
- **Total Tasks**: 1  
- **Compliance Rate**: 0%
- **Common Issues**:
  - Missing all custom field values
  - No assignee or due date set
  - Lacks detailed implementation description

### No Team Assigned
- **Total Tasks**: 12
- **Compliance Rate**: 0%
- **Common Issues**:
  - Tasks not assigned to any IS Team
  - Many are recurring meetings without proper task structure
  - Missing project context and deliverables

## Detailed Non-Compliance List

### Critical Issues (Affecting Multiple Teams)

#### 1. Digital Services | Priorities & Resourcing (July 15th - Aug 15th)
- **Task ID**: 1210953454292546
- **URL**: [View in Asana](https://app.asana.com/0/0/1210953454292546)
- **Issues**:
  - Missing Assignee
  - Missing Due Date  
  - Missing Project Status
  - Missing Lifecycle Stage
  - Missing IS Teams
  - Missing APS Department
- **Impact**: Critical capacity planning document lacks ownership and timeline

#### 2. Multiple Sprint Planning Tasks
- **Affected Tasks**: 8 sprint planning tasks (Sprint 16-22)
- **Common Issues**:
  - No assignee or due date
  - All custom fields empty
  - No clear outcomes or next steps defined
- **Recommendation**: Convert to recurring task template with proper fields

#### 3. IS Scrum of Scrums Meetings
- **Affected Tasks**: Multiple scheduled meetings
- **Issues**:
  - Inconsistent assignee assignment
  - Custom fields not populated
  - Meeting notes don't follow 1-click test structure
- **Recommendation**: Standardize meeting task creation with required fields

## Recommendations

### Immediate Actions Required

1. **Bulk Update Campaign**
   - Run a one-time update to populate missing custom fields
   - Assign task owners based on team responsibilities
   - Set appropriate due dates for all tasks

2. **Template Creation**
   - Create standardized templates for:
     - Sprint planning tasks
     - Team capacity planning  
     - Recurring meetings
     - Project milestones

3. **Description Standards**
   - Implement description template that addresses:
     - Why are we doing this?
     - Who else is involved?
     - What are the specific outcomes?
     - What is the definition of done?
     - What is the next step?

4. **Automation Rules**
   - Set up Asana rules to:
     - Require custom fields before task creation
     - Auto-assign based on task type
     - Flag non-compliant tasks weekly

### Process Improvements

1. **Weekly Compliance Review**
   - Each team lead reviews their team's compliance
   - Address gaps in team standup meetings
   - Track improvement trends

2. **Training & Documentation**
   - Create quick reference guide for required fields
   - Host training on 1-click test writing
   - Share examples of compliant tasks

3. **Accountability Structure**
   - Team leads responsible for team compliance
   - Monthly compliance included in team metrics
   - Celebrate teams achieving 100% compliance

## Technical Learnings for Agent Implementation

Based on this analysis, the Asana compliance agent should:

1. **Use Text-Based Search**: The `projects_any` parameter frequently fails; use text search instead
2. **Batch Requests**: Process tasks in smaller batches to avoid token limits
3. **Cache Custom Field IDs**: Store these as constants to avoid repeated lookups
4. **Focus on Incomplete Tasks**: Filter by `completed: false` to reduce data volume
5. **Extract Team Assignments**: Parse the multi_enum_values for IS Teams field
6. **Handle Missing Data**: Many tasks have empty custom_fields arrays

## Next Steps

1. Review this report with IS Leadership
2. Prioritize bulk update of existing tasks
3. Implement templates and automation
4. Schedule follow-up compliance check in 2 weeks
5. Refine agent configuration based on feedback

---

*This report was generated using the Asana MCP Server. For questions or improvements, contact the IS Portfolio Management team.*
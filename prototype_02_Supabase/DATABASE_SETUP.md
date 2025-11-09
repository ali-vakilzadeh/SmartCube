# Database Setup Instructions

## Critical: You must execute these SQL scripts in your Supabase database

The error "Could not find the table 'public.workflows' in the schema cache" means the database tables haven't been created yet.

## How to Run SQL Scripts in Supabase

### Option 1: Using v0 (Recommended)
v0 can execute SQL scripts directly. The scripts are in the `scripts/` folder and need to be run in order:

1. Click the "Run Script" button that appears in the v0 UI
2. Or select each script file and execute them in order (001 through 007)

### Option 2: Manual Execution in Supabase Dashboard
If v0 script execution doesn't work, follow these steps:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor (left sidebar)
3. Copy and paste each SQL script in order:
   - `scripts/001_create_users_table.sql`
   - `scripts/002_create_workflows_table.sql`
   - `scripts/003_create_executions_table.sql`
   - `scripts/004_create_tasks_table.sql`
   - `scripts/005_create_smart_cubes_table.sql`
   - `scripts/006_create_analytics_table.sql`
   - `scripts/007_create_user_trigger.sql`
4. Run each script by clicking "Run" or pressing Ctrl+Enter

## What These Scripts Do

- **001**: Creates the users table with profile information
- **002**: Creates the workflows table for workflow definitions
- **003**: Creates the executions table for tracking workflow runs
- **004**: Creates the tasks table for individual workflow steps
- **005**: Creates the smart_cubes table for data cube configurations
- **006**: Creates the analytics table for logging operations
- **007**: Creates a trigger to automatically create user profile when auth user is created

## Verify Installation

After running all scripts, verify in Supabase:
1. Go to Table Editor
2. You should see these tables: users, workflows, executions, tasks, smart_cubes, analytics
3. Each table should have Row Level Security (RLS) enabled

## Troubleshooting

If you still get table errors after running scripts:
1. Check the Supabase logs for any SQL errors
2. Ensure RLS policies were created successfully
3. Verify your environment variables are correct
4. Try refreshing the schema cache in Supabase

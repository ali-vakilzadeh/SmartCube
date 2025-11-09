# New Interactive Features - SmartCube Workflow Builder

This document describes the new interactive features added to the SmartCube workflow builder.

## 1. Cube Edit Sidebar ✅

**Feature:** Click on any cube to open an edit sidebar on the right side of the canvas.

**Capabilities:**
- **Edit Cube Name** - Change the display name of the cube
- **Change Cube Color** - Pick a custom color for the cube (affects border and icon color)
- **AI Prompt Configuration** - For AI-powered cubes (text, image, recognition), configure the prompt/instructions
- **Delete Cube** - Remove the cube from the workflow with confirmation dialog
- **View Cube Metadata** - See cube type and ID for debugging

**Implementation:**
- New component: `components/workflow/cube-edit-sidebar.tsx`
- Automatically opens when a cube is selected
- Saves changes immediately to the workflow state
- Close button to dismiss the sidebar

## 2. Resizable Cubes ✅

**Feature:** Drag the corners of selected cubes to resize them.

**Capabilities:**
- **Minimum Size Enforced** - Cubes cannot be smaller than 180x80 pixels
- **Visual Resize Handles** - 8px circular handles appear on selected cubes
- **Live Resizing** - See the cube resize in real-time as you drag
- **Color-Matched Handles** - Resize handles match the cube's custom color

**Implementation:**
- Uses ReactFlow's built-in `NodeResizer` component
- Appears only when a cube is selected
- Handles are positioned at corners and edges for intuitive resizing

## 3. Editable Connections ✅

**Feature:** Connections (edges) between cubes can be deleted and show clear directionality.

**Capabilities:**
- **Directional Arrows** - All connections show an arrow pointing from source to target
- **Delete Connections** - Select an edge and press Delete or Backspace to remove it
- **Animated Flow** - Connections are animated to show data flow direction
- **Smooth Curves** - Connections use "smoothstep" routing for professional appearance
- **Click to Select** - Click on any connection to select it for editing/deletion

**Implementation:**
- Default edge options include `MarkerType.ArrowClosed` for arrow heads
- `deleteKeyCode` enabled for keyboard-based deletion
- `onEdgesDelete` callback handles edge removal from workflow state
- Animated edges provide visual feedback of active connections

## 4. Decider Cube Two-Output System ✅

**Feature:** Decider cubes have two distinct output points for TRUE and FALSE paths.

**Capabilities:**
- **TRUE Output (Green)** - Left output handle colored green with "TRUE" label
- **FALSE Output (Red)** - Right output handle colored red with "FALSE" label
- **Visual Differentiation** - Clearly marked outputs prevent connection errors
- **Conditional Branching** - Create if/then/else logic flows in workflows
- **Multiple Path Support** - Connect different cubes to each output for branching logic

**Implementation:**
- Decider cubes render two source handles at different positions (33% and 67%)
- Each handle has a unique `id` ("true" or "false")
- Color-coded handles (green for true, red for false)
- Labels positioned below handles for clarity
- Standard cubes continue to have single output handle

## Technical Details

### Components Modified
1. **cube-node.tsx** - Added NodeResizer, custom colors, decider dual outputs
2. **workflow-canvas.tsx** - Added sidebar integration, edge styling, selection handling
3. **cube-edit-sidebar.tsx** - New component for cube editing interface

### Dependencies Used
- **reactflow@11.11.4** - NodeResizer, MarkerType, and advanced edge features
- **@radix-ui/react-scroll-area** - Smooth scrolling in sidebar
- **lucide-react** - Icons for UI elements

### State Management
- Node data includes: `label`, `color`, `config.prompt`, `cubeType`
- Edge data includes: `sourceHandle`, `targetHandle` for decider routing
- Selection state managed via ReactFlow's `onSelectionChange`

## User Experience Improvements

1. **Visual Clarity** - Custom colors help distinguish between different workflow paths
2. **Flexible Layout** - Resizable cubes adapt to complex workflow visualizations
3. **Easy Editing** - Sidebar provides focused interface for cube configuration
4. **Clear Logic Flow** - Decider outputs make conditional logic immediately understandable
5. **Professional Appearance** - Animated, arrow-marked connections show clear data flow

## Future Enhancements (Potential)

- [ ] Connection labels showing data type or transformation
- [ ] Bulk cube operations (move, delete, color change)
- [ ] Cube templates/presets for common patterns
- [ ] Connection validation (type checking between cubes)
- [ ] Undo/redo functionality for canvas operations
- [ ] Mini-map highlighting of selected elements

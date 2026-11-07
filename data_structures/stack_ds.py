"""
DSVERSE - Stack Data Structure & Execution Engine.
Academic execution engine supporting both Array-based (fixed capacity LIFO)
and Linked-List-based dynamic Stacks with synchronized ANSI C line mapping.
"""

from typing import List, Dict, Any, Optional

C_STACK_ARRAY_STRUCT = """#define MAX_STACK 8

typedef struct {
    int items[MAX_STACK];
    int top;
} ArrayStack;"""

C_STACK_LL_STRUCT = """struct StackNode {
    int data;
    struct StackNode* next;
};
typedef struct StackNode* STACK_NODE;"""

C_STACK_SNIPPETS = {
    "array_push": (
        "int push(ArrayStack *s, int val) {\n"
        "    if (s->top >= MAX_STACK - 1) {\n"
        "        printf(\"Stack Overflow!\\n\");\n"
        "        return -1;\n"
        "    }\n"
        "    s->top++;\n"
        "    s->items[s->top] = val;\n"
        "    return 0;\n"
        "}"
    ),
    "array_pop": (
        "int pop(ArrayStack *s) {\n"
        "    if (s->top < 0) {\n"
        "        printf(\"Stack Underflow!\\n\");\n"
        "        return -1;\n"
        "    }\n"
        "    int val = s->items[s->top];\n"
        "    s->top--;\n"
        "    return val;\n"
        "}"
    ),
    "array_peek": (
        "int peek(ArrayStack *s) {\n"
        "    if (s->top < 0) return -1; // Empty\n"
        "    return s->items[s->top];\n"
        "}"
    ),
    "ll_push": (
        "STACK_NODE ll_push(STACK_NODE top, int val) {\n"
        "    STACK_NODE temp = (STACK_NODE)malloc(sizeof(struct StackNode));\n"
        "    if (temp == NULL) return top; // Heap exhaustion\n"
        "    temp->data = val;\n"
        "    temp->next = top;\n"
        "    top = temp;\n"
        "    return top;\n"
        "}"
    ),
    "ll_pop": (
        "STACK_NODE ll_pop(STACK_NODE top, int *popped_val) {\n"
        "    if (top == NULL) return NULL; // Underflow\n"
        "    STACK_NODE temp = top;\n"
        "    *popped_val = temp->data;\n"
        "    top = top->next;\n"
        "    free(temp);\n"
        "    return top;\n"
        "}"
    )
}

STACK_BASE_ADDR = 0x7FFE00


class StackDS:
    def __init__(self, capacity: int = 8, initial_values: Optional[List[int]] = None):
        self.capacity = capacity
        # items stored from index 0 up to top
        vals = initial_values if initial_values is not None else [10, 25, 42, 68]
        self.items: List[int] = list(vals)[:capacity]
        self.top: int = len(self.items) - 1
        self.operation_count = 0

    def _snapshot(
        self,
        active_index: Optional[int] = None,
        popping_index: Optional[int] = None,
        pushing_index: Optional[int] = None,
        is_peek: bool = False
    ) -> List[Dict[str, Any]]:
        elements = []
        for i in range(self.capacity):
            has_val = i <= self.top and i < len(self.items)
            val = self.items[i] if has_val else None
            addr = f"0x{STACK_BASE_ADDR + i * 4:06X}"
            elements.append({
                "index": i,
                "value": val,
                "address": addr,
                "is_top": i == self.top,
                "is_active": i == active_index,
                "is_popping": i == popping_index,
                "is_pushing": i == pushing_index,
                "is_peek": i == self.top if is_peek else False,
                "is_occupied": has_val
            })
        return elements

    def get_state(self) -> Dict[str, Any]:
        return {
            "elements": self._snapshot(),
            "top": self.top,
            "size": self.top + 1,
            "capacity": self.capacity,
            "is_empty": self.top == -1,
            "is_full": self.top >= self.capacity - 1,
            "c_struct": C_STACK_ARRAY_STRUCT
        }

    def reset_default(self) -> Dict[str, Any]:
        self.items = [10, 25, 42, 68]
        self.top = len(self.items) - 1
        self.operation_count = 0
        return self.get_state()

    def clear(self) -> Dict[str, Any]:
        self.items = []
        self.top = -1
        self.operation_count = 0
        return self.get_state()

    def push(self, value: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_STACK_SNIPPETS["array_push"]

        # Step 1: Overflow check
        if self.top >= self.capacity - 1:
            steps.append({
                "step_number": 1,
                "description": f"Stack Overflow check failed! top ({self.top}) >= MAX_STACK - 1 ({self.capacity - 1}).",
                "elements": self._snapshot(),
                "c_line_number": 2,
                "c_line_explanation": "if (s->top >= MAX_STACK - 1); Stack capacity bound reached. Operation aborted.",
                "log_type": "error",
                "comparisons": 1,
                "pointer_assignments": 0
            })
            return {
                "operation": f"Push {value}",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_STACK_ARRAY_STRUCT,
                "error": True,
                "message": "Stack Overflow: maximum capacity reached."
            }

        # Step 1: Pre-push state
        steps.append({
            "step_number": 1,
            "description": f"Capacity check passed. Preparing to push {value}. Current top = {self.top}.",
            "elements": self._snapshot(),
            "c_line_number": 6,
            "c_line_explanation": "s->top++; Incrementing top index pointer to reserve the next available slot.",
            "log_type": "info",
            "comparisons": 1,
            "pointer_assignments": 0
        })

        # Step 2: Increment top
        self.top += 1
        self.items.append(value)

        steps.append({
            "step_number": 2,
            "description": f"Incremented top pointer to index {self.top} (address 0x{STACK_BASE_ADDR + self.top * 4:06X}).",
            "elements": self._snapshot(pushing_index=self.top),
            "c_line_number": 6,
            "c_line_explanation": f"top pointer advanced to {self.top}.",
            "log_type": "pointer",
            "comparisons": 1,
            "pointer_assignments": 1
        })

        # Step 3: Write value
        steps.append({
            "step_number": 3,
            "description": f"Stored value {value} at s->items[{self.top}]. Push completed successfully in O(1) time.",
            "elements": self._snapshot(active_index=self.top),
            "c_line_number": 7,
            "c_line_explanation": f"s->items[{self.top}] = {value}; Direct memory write at top of stack.",
            "log_type": "success",
            "comparisons": 1,
            "pointer_assignments": 2
        })

        return {
            "operation": f"Push {value}",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_STACK_ARRAY_STRUCT,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(1)",
                "time_worst": "O(1)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": 1,
                "traversals": 1,
                "pointer_assignments": 2,
                "total_nodes": self.top + 1
            }
        }

    def pop(self) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_STACK_SNIPPETS["array_pop"]

        # Step 1: Underflow check
        if self.top < 0:
            steps.append({
                "step_number": 1,
                "description": "Stack Underflow check failed! top < 0. Stack is empty.",
                "elements": self._snapshot(),
                "c_line_number": 2,
                "c_line_explanation": "if (s->top < 0); Stack is currently empty. Cannot pop from empty stack.",
                "log_type": "error",
                "comparisons": 1,
                "pointer_assignments": 0
            })
            return {
                "operation": "Pop Element",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_STACK_ARRAY_STRUCT,
                "error": True,
                "message": "Stack Underflow: stack is empty."
            }

        popped_val = self.items[self.top]

        # Step 1: Capture top value
        steps.append({
            "step_number": 1,
            "description": f"Reading top element {popped_val} from index {self.top}.",
            "elements": self._snapshot(popping_index=self.top),
            "c_line_number": 6,
            "c_line_explanation": f"int val = s->items[{self.top}]; Retrieving element from top of stack.",
            "log_type": "pointer",
            "comparisons": 1,
            "pointer_assignments": 0
        })

        # Step 2: Decrement top
        self.items.pop()
        self.top -= 1

        steps.append({
            "step_number": 2,
            "description": f"Decremented top pointer to index {self.top}. Popped {popped_val} successfully.",
            "elements": self._snapshot(),
            "c_line_number": 7,
            "c_line_explanation": f"s->top--; Top moved down. Active size now {self.top + 1}.",
            "log_type": "success",
            "comparisons": 1,
            "pointer_assignments": 1
        })

        return {
            "operation": f"Pop (Retrieved {popped_val})",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_STACK_ARRAY_STRUCT,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(1)",
                "time_worst": "O(1)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": 1,
                "traversals": 1,
                "pointer_assignments": 1,
                "total_nodes": self.top + 1
            }
        }

    def peek(self) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_STACK_SNIPPETS["array_peek"]

        if self.top < 0:
            steps.append({
                "step_number": 1,
                "description": "Peek inspection: Stack is empty (top == -1).",
                "elements": self._snapshot(),
                "c_line_number": 2,
                "c_line_explanation": "if (s->top < 0) return -1; Cannot inspect empty stack.",
                "log_type": "warning",
                "comparisons": 1,
                "pointer_assignments": 0
            })
            return {
                "operation": "Peek Top Element",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_STACK_ARRAY_STRUCT,
                "error": True,
                "message": "Stack is empty."
            }

        top_val = self.items[self.top]
        steps.append({
            "step_number": 1,
            "description": f"Inspecting top element: {top_val} at index {self.top} (address 0x{STACK_BASE_ADDR + self.top * 4:06X}) without removal.",
            "elements": self._snapshot(is_peek=True),
            "c_line_number": 3,
            "c_line_explanation": f"return s->items[{self.top}]; Direct read without modifying top pointer.",
            "log_type": "success",
            "comparisons": 1,
            "pointer_assignments": 0
        })

        return {
            "operation": f"Peek Top (Value: {top_val})",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_STACK_ARRAY_STRUCT,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(1)",
                "time_worst": "O(1)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": 1,
                "traversals": 1,
                "pointer_assignments": 0,
                "total_nodes": self.top + 1
            }
        }


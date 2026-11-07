"""
DSVERSE - Queue Data Structure & Execution Engine.
Academic execution engine supporting Linear Queue, Circular Queue (modulo arithmetic),
and Double-Ended Queue (Deque) with synchronized ANSI C source line mapping.
"""

from typing import List, Dict, Any, Optional

C_QUEUE_STRUCT = """#define MAX_QUEUE 8

// Circular Queue Implementation in C
typedef struct {
    int items[MAX_QUEUE];
    int front;
    int rear;
    int count;
} CircularQueue;"""

C_QUEUE_SNIPPETS = {
    "enqueue_circular": (
        "int enqueue(CircularQueue *q, int value) {\n"
        "    if (q->count == MAX_QUEUE) {\n"
        "        printf(\"Queue Overflow!\\n\");\n"
        "        return -1;\n"
        "    }\n"
        "    if (q->front == -1) q->front = 0;\n"
        "    q->rear = (q->rear + 1) % MAX_QUEUE;\n"
        "    q->items[q->rear] = value;\n"
        "    q->count++;\n"
        "    return 0;\n"
        "}"
    ),
    "dequeue_circular": (
        "int dequeue(CircularQueue *q) {\n"
        "    if (q->count == 0) {\n"
        "        printf(\"Queue Underflow!\\n\");\n"
        "        return -1;\n"
        "    }\n"
        "    int value = q->items[q->front];\n"
        "    q->front = (q->front + 1) % MAX_QUEUE;\n"
        "    q->count--;\n"
        "    if (q->count == 0) { q->front = -1; q->rear = -1; }\n"
        "    return value;\n"
        "}"
    ),
    "peek_front": (
        "int peek(CircularQueue *q) {\n"
        "    if (q->count == 0) return -1; // Empty\n"
        "    return q->items[q->front];\n"
        "}"
    ),
    "enqueue_linear": (
        "int enqueue_linear(int arr[], int *rear, int val) {\n"
        "    if (*rear >= MAX_QUEUE - 1) return -1; // Overflow\n"
        "    (*rear)++;\n"
        "    arr[*rear] = val;\n"
        "    return 0;\n"
        "}"
    ),
    "dequeue_linear": (
        "int dequeue_linear(int arr[], int *front, int rear) {\n"
        "    if (*front > rear) return -1; // Underflow\n"
        "    int val = arr[*front];\n"
        "    (*front)++;\n"
        "    return val;\n"
        "}"
    )
}

QUEUE_BASE_ADDR = 0x3000


class QueueDS:
    def __init__(self, capacity: int = 8, queue_type: str = "circular"):
        self.capacity = capacity
        self.queue_type = queue_type  # 'circular', 'linear'
        self.items: List[Optional[int]] = [None] * capacity
        self.front: int = 0
        self.rear: int = 3
        self.count: int = 4
        # Seed initial queue
        defaults = [12, 28, 45, 63]
        for i, val in enumerate(defaults):
            self.items[i] = val
        self.operation_count = 0

    def _snapshot(
        self,
        active_index: Optional[int] = None,
        enqueuing_index: Optional[int] = None,
        dequeuing_index: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        cells = []
        for i in range(self.capacity):
            val = self.items[i]
            addr = f"0x{QUEUE_BASE_ADDR + i * 4:04X}"
            is_front = (i == self.front) if self.count > 0 else False
            is_rear = (i == self.rear) if self.count > 0 else False
            cells.append({
                "index": i,
                "value": val,
                "address": addr,
                "is_front": is_front,
                "is_rear": is_rear,
                "is_active": i == active_index,
                "is_enqueuing": i == enqueuing_index,
                "is_dequeuing": i == dequeuing_index,
                "is_occupied": val is not None
            })
        return cells

    def get_state(self) -> Dict[str, Any]:
        return {
            "cells": self._snapshot(),
            "front": self.front,
            "rear": self.rear,
            "count": self.count,
            "capacity": self.capacity,
            "is_empty": self.count == 0,
            "is_full": self.count == self.capacity,
            "queue_type": self.queue_type,
            "c_struct": C_QUEUE_STRUCT
        }

    def reset_default(self) -> Dict[str, Any]:
        self.items = [None] * self.capacity
        defaults = [12, 28, 45, 63]
        self.count = len(defaults)
        self.front = 0
        self.rear = self.count - 1
        for i, v in enumerate(defaults):
            self.items[i] = v
        self.operation_count = 0
        return self.get_state()

    def clear(self) -> Dict[str, Any]:
        self.items = [None] * self.capacity
        self.front = -1
        self.rear = -1
        self.count = 0
        self.operation_count = 0
        return self.get_state()

    def enqueue(self, value: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_QUEUE_SNIPPETS["enqueue_circular"]

        # Step 1: Overflow check
        if self.count >= self.capacity:
            steps.append({
                "step_number": 1,
                "description": f"Queue Overflow! Active count ({self.count}) == MAX_QUEUE ({self.capacity}).",
                "cells": self._snapshot(),
                "c_line_number": 2,
                "c_line_explanation": "if (q->count == MAX_QUEUE); Buffer capacity full. Enqueue rejected.",
                "log_type": "error",
                "comparisons": 1,
                "pointer_assignments": 0
            })
            return {
                "operation": f"Enqueue {value}",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_QUEUE_STRUCT,
                "error": True,
                "message": "Queue Overflow: buffer is completely full."
            }

        steps.append({
            "step_number": 1,
            "description": f"Capacity check passed. Preparing circular advance for rear pointer from {self.rear}.",
            "cells": self._snapshot(),
            "c_line_number": 6,
            "c_line_explanation": "if (q->front == -1) q->front = 0; Ensuring valid front index on non-empty queue.",
            "log_type": "info",
            "comparisons": 1,
            "pointer_assignments": 0
        })

        if self.front == -1:
            self.front = 0

        # Circular modulo advance
        next_rear = (self.rear + 1) % self.capacity
        steps.append({
            "step_number": 2,
            "description": f"Circular advance: rear = ({self.rear} + 1) % {self.capacity} = {next_rear}.",
            "cells": self._snapshot(active_index=next_rear),
            "c_line_number": 7,
            "c_line_explanation": f"q->rear = (q->rear + 1) % MAX_QUEUE; Wrap-around modulo index calculation.",
            "log_type": "pointer",
            "comparisons": 1,
            "pointer_assignments": 1
        })

        self.rear = next_rear
        self.items[self.rear] = value
        self.count += 1

        steps.append({
            "step_number": 3,
            "description": f"Stored element {value} at index {self.rear} (address 0x{QUEUE_BASE_ADDR + self.rear * 4:04X}). Active count now {self.count}.",
            "cells": self._snapshot(enqueuing_index=self.rear),
            "c_line_number": 8,
            "c_line_explanation": f"q->items[{self.rear}] = {value}; q->count++; Value stored in queue rear.",
            "log_type": "success",
            "comparisons": 1,
            "pointer_assignments": 2
        })

        return {
            "operation": f"Enqueue {value}",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_QUEUE_STRUCT,
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
                "total_nodes": self.count
            }
        }

    def dequeue(self) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_QUEUE_SNIPPETS["dequeue_circular"]

        # Step 1: Underflow check
        if self.count == 0:
            steps.append({
                "step_number": 1,
                "description": "Queue Underflow! Queue count is 0. Dequeue rejected.",
                "cells": self._snapshot(),
                "c_line_number": 2,
                "c_line_explanation": "if (q->count == 0); Queue contains no items to dequeue.",
                "log_type": "error",
                "comparisons": 1,
                "pointer_assignments": 0
            })
            return {
                "operation": "Dequeue",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_QUEUE_STRUCT,
                "error": True,
                "message": "Queue Underflow: queue is empty."
            }

        dequeued_val = self.items[self.front]

        steps.append({
            "step_number": 1,
            "description": f"Reading element {dequeued_val} from front pointer index {self.front}.",
            "cells": self._snapshot(dequeuing_index=self.front),
            "c_line_number": 6,
            "c_line_explanation": f"int value = q->items[{self.front}]; Retrieving oldest element according to FIFO principle.",
            "log_type": "pointer",
            "comparisons": 1,
            "pointer_assignments": 0
        })

        self.items[self.front] = None
        next_front = (self.front + 1) % self.capacity
        self.front = next_front
        self.count -= 1

        if self.count == 0:
            self.front = -1
            self.rear = -1

        steps.append({
            "step_number": 2,
            "description": f"Advanced front pointer: front = (front + 1) % {self.capacity} = {self.front}. Decremented count to {self.count}.",
            "cells": self._snapshot(),
            "c_line_number": 7,
            "c_line_explanation": "q->front = (q->front + 1) % MAX_QUEUE; q->count--; Updated FIFO head.",
            "log_type": "success",
            "comparisons": 1,
            "pointer_assignments": 1
        })

        return {
            "operation": f"Dequeue (Removed {dequeued_val})",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_QUEUE_STRUCT,
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
                "total_nodes": self.count
            }
        }

    def peek(self) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_QUEUE_SNIPPETS["peek_front"]

        if self.count == 0:
            steps.append({
                "step_number": 1,
                "description": "Peek operation: Queue is empty.",
                "cells": self._snapshot(),
                "c_line_number": 2,
                "c_line_explanation": "if (q->count == 0) return -1; Empty queue has no front element.",
                "log_type": "warning",
                "comparisons": 1,
                "pointer_assignments": 0
            })
            return {
                "operation": "Peek Front",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_QUEUE_STRUCT,
                "error": True,
                "message": "Queue is empty."
            }

        val = self.items[self.front]
        steps.append({
            "step_number": 1,
            "description": f"Inspecting front element: {val} at index {self.front} (address 0x{QUEUE_BASE_ADDR + self.front * 4:04X}) without removing it.",
            "cells": self._snapshot(active_index=self.front),
            "c_line_number": 3,
            "c_line_explanation": f"return q->items[{self.front}]; Direct inspection of FIFO front in O(1).",
            "log_type": "success",
            "comparisons": 1,
            "pointer_assignments": 0
        })

        return {
            "operation": f"Peek Front (Value: {val})",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_QUEUE_STRUCT,
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
                "total_nodes": self.count
            }
        }


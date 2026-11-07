"""
DSVERSE - Array Data Structure & Execution Engine.
Academic execution engine tracking static and dynamic array operations,
contiguous memory addressing, index shifts, and ANSI C source line mapping.
"""

from typing import List, Dict, Any, Optional

C_ARRAY_STRUCT = """// Standard Fixed & Dynamic Array in C
#define MAX_CAPACITY 10

typedef struct {
    int data[MAX_CAPACITY];
    int size;
    int capacity;
} Array;"""

C_ARRAY_SNIPPETS = {
    "insert_at": (
        "int insert_at(int arr[], int *size, int capacity, int index, int value) {\n"
        "    if (*size >= capacity) return -1; // Overflow\n"
        "    if (index < 0 || index > *size) return -2; // Invalid index\n"
        "    for (int i = *size - 1; i >= index; i--) {\n"
        "        arr[i + 1] = arr[i]; // Shift right\n"
        "    }\n"
        "    arr[index] = value;\n"
        "    (*size)++;\n"
        "    return 0; // Success\n"
        "}"
    ),
    "delete_at": (
        "int delete_at(int arr[], int *size, int index) {\n"
        "    if (*size <= 0) return -1; // Underflow\n"
        "    if (index < 0 || index >= *size) return -2;\n"
        "    int removed = arr[index];\n"
        "    for (int i = index; i < *size - 1; i++) {\n"
        "        arr[i] = arr[i + 1]; // Shift left\n"
        "    }\n"
        "    (*size)--;\n"
        "    return removed;\n"
        "}"
    ),
    "search": (
        "int linear_search(int arr[], int size, int target) {\n"
        "    for (int i = 0; i < size; i++) {\n"
        "        if (arr[i] == target) {\n"
        "            return i; // Found at index i\n"
        "        }\n"
        "    }\n"
        "    return -1; // Element not found\n"
        "}"
    ),
    "update": (
        "int update_at(int arr[], int size, int index, int new_val) {\n"
        "    if (index < 0 || index >= size) return -1;\n"
        "    arr[index] = new_val; // Direct random access O(1)\n"
        "    return 0;\n"
        "}"
    ),
    "reverse": (
        "void reverse_array(int arr[], int size) {\n"
        "    int left = 0, right = size - 1;\n"
        "    while (left < right) {\n"
        "        int temp = arr[left];\n"
        "        arr[left] = arr[right];\n"
        "        arr[right] = temp;\n"
        "        left++; right--;\n"
        "    }\n"
        "}"
    ),
    "min_max": (
        "void find_min_max(int arr[], int size, int *min_val, int *max_val) {\n"
        "    *min_val = arr[0];\n"
        "    *max_val = arr[0];\n"
        "    for (int i = 1; i < size; i++) {\n"
        "        if (arr[i] < *min_val) *min_val = arr[i];\n"
        "        if (arr[i] > *max_val) *max_val = arr[i];\n"
        "    }\n"
        "}"
    )
}

BASE_ADDRESS = 0x2000  # Base memory address representation (hex)


class ArrayDS:
    def __init__(self, capacity: int = 10, initial_values: Optional[List[int]] = None):
        self.capacity = capacity
        self.data: List[Optional[int]] = [None] * capacity
        vals = initial_values if initial_values is not None else [15, 32, 47, 84, 96]
        self.size = min(len(vals), capacity)
        for i in range(self.size):
            self.data[i] = vals[i]
        self.operation_count = 0

    def _snapshot(
        self,
        active_index: Optional[int] = None,
        comparing_index: Optional[int] = None,
        shifting_indices: Optional[List[int]] = None,
        inserted_index: Optional[int] = None,
        deleted_index: Optional[int] = None,
        pointer_labels: Optional[Dict[int, str]] = None
    ) -> List[Dict[str, Any]]:
        cells = []
        shifts = shifting_indices or []
        ptrs = pointer_labels or {}
        for i in range(self.capacity):
            val = self.data[i]
            addr = f"0x{BASE_ADDRESS + i * 4:04X}"
            cells.append({
                "index": i,
                "value": val,
                "address": addr,
                "is_active": i == active_index,
                "is_comparing": i == comparing_index,
                "is_shifting": i in shifts,
                "is_inserted": i == inserted_index,
                "is_deleted": i == deleted_index,
                "is_occupied": i < self.size and val is not None,
                "pointer_label": ptrs.get(i)
            })
        return cells

    def get_state(self) -> Dict[str, Any]:
        return {
            "cells": self._snapshot(),
            "size": self.size,
            "capacity": self.capacity,
            "c_struct": C_ARRAY_STRUCT
        }

    def reset_default(self) -> Dict[str, Any]:
        self.data = [None] * self.capacity
        defaults = [15, 32, 47, 84, 96]
        self.size = len(defaults)
        for i in range(self.size):
            self.data[i] = defaults[i]
        self.operation_count = 0
        return self.get_state()

    def insert_at(self, index: int, value: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_ARRAY_SNIPPETS["insert_at"]
        shifts_count = 0
        comparisons = 0

        # Step 1: Capacity validation
        comparisons += 1
        if self.size >= self.capacity:
            steps.append({
                "step_number": 1,
                "description": f"Overflow check: size ({self.size}) >= capacity ({self.capacity}). Insertion rejected.",
                "cells": self._snapshot(),
                "c_line_number": 2,
                "c_line_explanation": "Array has reached MAX_CAPACITY limit. Cannot insert into fixed buffer.",
                "log_type": "error",
                "comparisons": 1,
                "shifts": 0
            })
            return {
                "operation": f"Insert {value} at index {index}",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_ARRAY_STRUCT,
                "error": True,
                "message": "Array overflow: buffer capacity reached."
            }

        # Step 2: Bound check
        comparisons += 1
        if index < 0 or index > self.size:
            steps.append({
                "step_number": 1,
                "description": f"Boundary check: index {index} is out of bounds [0, {self.size}].",
                "cells": self._snapshot(),
                "c_line_number": 3,
                "c_line_explanation": "Index is invalid. Elements must be contiguous; no gaps permitted in standard array.",
                "log_type": "error",
                "comparisons": comparisons,
                "shifts": 0
            })
            return {
                "operation": f"Insert {value} at index {index}",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_ARRAY_STRUCT,
                "error": True,
                "message": f"Index {index} out of bounds. Permitted range: 0 to {self.size}."
            }

        steps.append({
            "step_number": 1,
            "description": f"Preparing insertion of value {value} at index {index}. Current size: {self.size}.",
            "cells": self._snapshot(active_index=index, pointer_labels={index: "TARGET_IDX"}),
            "c_line_number": 4,
            "c_line_explanation": f"Checking if elements need to be shifted right starting from index {self.size - 1} down to {index}.",
            "log_type": "info",
            "comparisons": comparisons,
            "shifts": 0
        })

        # Shifting elements to the right
        for i in range(self.size - 1, index - 1, -1):
            shifts_count += 1
            val_to_shift = self.data[i]
            self.data[i + 1] = val_to_shift
            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Shifting element {val_to_shift} from index {i} to index {i + 1}.",
                "cells": self._snapshot(
                    active_index=i + 1,
                    shifting_indices=[i, i + 1],
                    pointer_labels={i: "SRC", i + 1: "DEST"}
                ),
                "c_line_number": 5,
                "c_line_explanation": f"arr[{i + 1}] = arr[{i}]; Moving element to clear slot at target index.",
                "log_type": "traverse",
                "comparisons": comparisons,
                "shifts": shifts_count
            })

        # Insert value
        self.data[index] = value
        self.size += 1

        steps.append({
            "step_number": len(steps) + 1,
            "description": f"Writing value {value} into memory address 0x{BASE_ADDRESS + index * 4:04X} (arr[{index}]).",
            "cells": self._snapshot(
                inserted_index=index,
                pointer_labels={index: "NEW_VAL"}
            ),
            "c_line_number": 7,
            "c_line_explanation": f"arr[{index}] = {value}; Direct memory write at contiguous address.",
            "log_type": "success",
            "comparisons": comparisons,
            "shifts": shifts_count
        })

        steps.append({
            "step_number": len(steps) + 1,
            "description": f"Incremented array size counter to {self.size}. Insertion complete.",
            "cells": self._snapshot(active_index=index),
            "c_line_number": 8,
            "c_line_explanation": "(*size)++; Updated active elements counter.",
            "log_type": "success",
            "comparisons": comparisons,
            "shifts": shifts_count
        })

        return {
            "operation": f"Insert {value} at index {index}",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_ARRAY_STRUCT,
            "complexity": {
                "time_best": "O(1)" if index == self.size - 1 else "O(n)",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": shifts_count,
                "pointer_assignments": shifts_count + 1,
                "total_nodes": self.size
            }
        }

    def delete_at(self, index: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_ARRAY_SNIPPETS["delete_at"]
        comparisons = 0
        shifts_count = 0

        # Underflow check
        comparisons += 1
        if self.size <= 0:
            steps.append({
                "step_number": 1,
                "description": "Underflow check: array is empty.",
                "cells": self._snapshot(),
                "c_line_number": 2,
                "c_line_explanation": "Cannot delete from an empty array.",
                "log_type": "error",
                "comparisons": 1,
                "shifts": 0
            })
            return {
                "operation": f"Delete at index {index}",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_ARRAY_STRUCT,
                "error": True,
                "message": "Array underflow: array is empty."
            }

        # Index check
        comparisons += 1
        if index < 0 or index >= self.size:
            steps.append({
                "step_number": 1,
                "description": f"Index {index} is out of bounds [0, {self.size - 1}].",
                "cells": self._snapshot(),
                "c_line_number": 3,
                "c_line_explanation": "Index is outside valid element bounds.",
                "log_type": "error",
                "comparisons": comparisons,
                "shifts": 0
            })
            return {
                "operation": f"Delete at index {index}",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_ARRAY_STRUCT,
                "error": True,
                "message": f"Index {index} out of bounds."
            }

        removed_val = self.data[index]
        steps.append({
            "step_number": 1,
            "description": f"Targeting element {removed_val} at index {index} (address 0x{BASE_ADDRESS + index * 4:04X}) for deletion.",
            "cells": self._snapshot(deleted_index=index, pointer_labels={index: "DELETED"}),
            "c_line_number": 4,
            "c_line_explanation": f"int removed = arr[{index}]; Capturing element to be removed.",
            "log_type": "pointer",
            "comparisons": comparisons,
            "shifts": 0
        })

        # Shifting elements to the left
        for i in range(index, self.size - 1):
            shifts_count += 1
            next_val = self.data[i + 1]
            self.data[i] = next_val
            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Shifting element {next_val} from index {i + 1} leftward to index {i}.",
                "cells": self._snapshot(
                    active_index=i,
                    shifting_indices=[i, i + 1],
                    pointer_labels={i: "DEST", i + 1: "SRC"}
                ),
                "c_line_number": 6,
                "c_line_explanation": f"arr[{i}] = arr[{i + 1}]; Compacting contiguous buffer leftward.",
                "log_type": "traverse",
                "comparisons": comparisons,
                "shifts": shifts_count
            })

        self.data[self.size - 1] = None
        self.size -= 1

        steps.append({
            "step_number": len(steps) + 1,
            "description": f"Decremented array size counter to {self.size}. Memory slot at index {self.size} cleared.",
            "cells": self._snapshot(),
            "c_line_number": 8,
            "c_line_explanation": "(*size)--; Removed last duplicate slot from active partition.",
            "log_type": "success",
            "comparisons": comparisons,
            "shifts": shifts_count
        })

        return {
            "operation": f"Delete at index {index} (value: {removed_val})",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_ARRAY_STRUCT,
            "complexity": {
                "time_best": "O(1)" if index == self.size else "O(n)",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": shifts_count,
                "pointer_assignments": shifts_count,
                "total_nodes": self.size
            }
        }

    def search(self, target: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_ARRAY_SNIPPETS["search"]
        comparisons = 0
        found_index = -1

        steps.append({
            "step_number": 1,
            "description": f"Initiating linear search for key {target} across {self.size} elements.",
            "cells": self._snapshot(pointer_labels={0: "START"}),
            "c_line_number": 2,
            "c_line_explanation": "for (int i = 0; i < size; i++); Sequential iteration starting at index 0.",
            "log_type": "info",
            "comparisons": 0,
            "shifts": 0
        })

        for i in range(self.size):
            comparisons += 1
            curr_val = self.data[i]
            if curr_val == target:
                found_index = i
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"Match found! arr[{i}] ({curr_val}) == target ({target}) at address 0x{BASE_ADDRESS + i * 4:04X}.",
                    "cells": self._snapshot(active_index=i, pointer_labels={i: "FOUND"}),
                    "c_line_number": 4,
                    "c_line_explanation": f"Element matched target! Returning index {i}.",
                    "log_type": "success",
                    "comparisons": comparisons,
                    "shifts": 0
                })
                break
            else:
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"Comparing arr[{i}] ({curr_val}) != target ({target}). Continuing scan.",
                    "cells": self._snapshot(comparing_index=i, pointer_labels={i: "CHECK"}),
                    "c_line_number": 3,
                    "c_line_explanation": f"if (arr[{i}] == {target}) evaluated to false.",
                    "log_type": "traverse",
                    "comparisons": comparisons,
                    "shifts": 0
                })

        if found_index == -1:
            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Key {target} not found after inspecting all {self.size} elements. Returning -1.",
                "cells": self._snapshot(),
                "c_line_number": 7,
                "c_line_explanation": "Loop terminated without match. Return -1.",
                "log_type": "warning",
                "comparisons": comparisons,
                "shifts": 0
            })

        return {
            "operation": f"Linear Search for {target}",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_ARRAY_STRUCT,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": comparisons,
                "pointer_assignments": 0,
                "total_nodes": self.size
            }
        }

    def update_at(self, index: int, new_val: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_ARRAY_SNIPPETS["update"]

        if index < 0 or index >= self.size:
            steps.append({
                "step_number": 1,
                "description": f"Bounds error: index {index} out of range [0, {self.size - 1}].",
                "cells": self._snapshot(),
                "c_line_number": 2,
                "c_line_explanation": "Array bound checking prevents segmentation fault.",
                "log_type": "error",
                "comparisons": 1,
                "shifts": 0
            })
            return {
                "operation": f"Update index {index}",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_ARRAY_STRUCT,
                "error": True,
                "message": f"Index {index} out of bounds."
            }

        old_val = self.data[index]
        self.data[index] = new_val

        steps.append({
            "step_number": 1,
            "description": f"Direct random access O(1) to index {index} (address 0x{BASE_ADDRESS + index * 4:04X}). Overwriting {old_val} with {new_val}.",
            "cells": self._snapshot(active_index=index, pointer_labels={index: "UPDATED"}),
            "c_line_number": 3,
            "c_line_explanation": f"arr[{index}] = {new_val}; Memory offset computed directly as base + index * sizeof(int).",
            "log_type": "success",
            "comparisons": 1,
            "shifts": 0
        })

        return {
            "operation": f"Update arr[{index}] to {new_val}",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_ARRAY_STRUCT,
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
                "total_nodes": self.size
            }
        }

    def reverse(self) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_ARRAY_SNIPPETS["reverse"]
        left = 0
        right = self.size - 1
        swaps = 0

        steps.append({
            "step_number": 1,
            "description": f"Initializing two-pointer in-place reversal: left = 0, right = {right}.",
            "cells": self._snapshot(pointer_labels={left: "LEFT", right: "RIGHT"}),
            "c_line_number": 2,
            "c_line_explanation": "int left = 0, right = size - 1; Pointers set at opposing array boundaries.",
            "log_type": "info",
            "comparisons": 0,
            "shifts": 0
        })

        while left < right:
            swaps += 1
            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Swapping arr[{left}] ({self.data[left]}) with arr[{right}] ({self.data[right]}).",
                "cells": self._snapshot(
                    shifting_indices=[left, right],
                    pointer_labels={left: "SWAP_L", right: "SWAP_R"}
                ),
                "c_line_number": 5,
                "c_line_explanation": "Swapping symmetric boundary elements in-place using temporary variable.",
                "log_type": "pointer",
                "comparisons": swaps,
                "shifts": swaps * 2
            })

            # Swap
            self.data[left], self.data[right] = self.data[right], self.data[left]
            left += 1
            right -= 1

            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Swap complete. Advanced left to {left}, decremented right to {right}.",
                "cells": self._snapshot(pointer_labels={left: "LEFT", right: "RIGHT"} if left <= right else {}),
                "c_line_number": 7,
                "c_line_explanation": "left++; right--; Narrowing the two-pointer interval.",
                "log_type": "traverse",
                "comparisons": swaps,
                "shifts": swaps * 2
            })

        steps.append({
            "step_number": len(steps) + 1,
            "description": "Two pointers met or crossed. In-place array reversal completed.",
            "cells": self._snapshot(),
            "c_line_number": 8,
            "c_line_explanation": "Loop terminated. Array reversed with O(1) auxiliary memory.",
            "log_type": "success",
            "comparisons": swaps,
            "shifts": swaps * 2
        })

        return {
            "operation": "Reverse Array In-Place",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_ARRAY_STRUCT,
            "complexity": {
                "time_best": "O(n)",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": swaps,
                "traversals": self.size,
                "pointer_assignments": swaps * 3,
                "total_nodes": self.size
            }
        }


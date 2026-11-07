"""
DSVERSE - Core Doubly Linked List Data Structure & Execution Engine.
Executes two-way pointer manipulation (prev and next) in Python while generating
synchronized event steps mapped line-by-line to ANSI C reference code.
"""

import uuid
from typing import List, Dict, Any, Optional

C_DOUBLY_STRUCT = """struct DNode {
    int data;
    struct DNode* prev;
    struct DNode* next;
};
typedef struct DNode* DNODE;"""

C_DOUBLY_SNIPPETS = {
    "insert_beginning": (
        "DNODE insert_beginning(DNODE start, int info)\n"
        "{\n"
        "    DNODE temp = (DNODE)malloc(sizeof(struct DNode));\n"
        "    temp->data = info;\n"
        "    temp->prev = NULL;\n"
        "    temp->next = start;\n"
        "    if (start != NULL) {\n"
        "        start->prev = temp;\n"
        "    }\n"
        "    start = temp;\n"
        "    return start;\n"
        "}"
    ),
    "insert_end": (
        "DNODE insert_end(DNODE start, int info)\n"
        "{\n"
        "    DNODE temp = (DNODE)malloc(sizeof(struct DNode));\n"
        "    DNODE curr = start;\n"
        "    temp->data = info;\n"
        "    temp->next = NULL;\n"
        "    if (start == NULL) {\n"
        "        temp->prev = NULL;\n"
        "        return temp;\n"
        "    }\n"
        "    while (curr->next != NULL) {\n"
        "        curr = curr->next;\n"
        "    }\n"
        "    curr->next = temp;\n"
        "    temp->prev = curr;\n"
        "    return start;\n"
        "}"
    ),
    "delete_beginning": (
        "DNODE delete_beginning(DNODE start)\n"
        "{\n"
        "    DNODE temp;\n"
        "    if (start == NULL) return NULL;\n"
        "    temp = start;\n"
        "    start = start->next;\n"
        "    if (start != NULL) {\n"
        "        start->prev = NULL;\n"
        "    }\n"
        "    free(temp);\n"
        "    return start;\n"
        "}"
    ),
    "delete_end": (
        "DNODE delete_end(DNODE start)\n"
        "{\n"
        "    DNODE curr = start;\n"
        "    if (start == NULL) return NULL;\n"
        "    if (start->next == NULL) {\n"
        "        free(start);\n"
        "        return NULL;\n"
        "    }\n"
        "    while (curr->next != NULL) {\n"
        "        curr = curr->next;\n"
        "    }\n"
        "    curr->prev->next = NULL;\n"
        "    free(curr);\n"
        "    return start;\n"
        "}"
    ),
    "reverse": (
        "DNODE reverse_doubly(DNODE start)\n"
        "{\n"
        "    DNODE temp = NULL;\n"
        "    DNODE curr = start;\n"
        "    while (curr != NULL) {\n"
        "        temp = curr->prev;\n"
        "        curr->prev = curr->next;\n"
        "        curr->next = temp;\n"
        "        curr = curr->prev;\n"
        "    }\n"
        "    if (temp != NULL) {\n"
        "        start = temp->prev;\n"
        "    }\n"
        "    return start;\n"
        "}"
    )
}


class DoublyNode:
    """A node in the Doubly Linked List with prev and next pointers."""
    def __init__(self, value: int, node_id: Optional[str] = None):
        self.value: int = value
        self.prev: Optional['DoublyNode'] = None
        self.next: Optional['DoublyNode'] = None
        self.id: str = node_id or f"dnode-{uuid.uuid4().hex[:6]}"

    def to_dict(self, is_active: bool = False, is_new: bool = False, is_deleted: bool = False, is_head: bool = False, is_tail: bool = False) -> Dict[str, Any]:
        return {
            "id": self.id,
            "value": self.value,
            "prev_id": self.prev.id if self.prev else None,
            "next_id": self.next.id if self.next else None,
            "is_active": is_active,
            "is_new": is_new,
            "is_deleted": is_deleted,
            "is_head": is_head,
            "is_tail": is_tail
        }


class DoublyLinkedList:
    """
    Doubly Linked List with pointer-level execution tracking mapped to ANSI C.
    """

    def __init__(self, initial_values: Optional[List[int]] = None):
        self.head: Optional[DoublyNode] = None
        self.tail: Optional[DoublyNode] = None
        self.operation_count: int = 0
        if initial_values:
            for val in initial_values:
                self._raw_append(val)

    def _raw_append(self, value: int):
        new_node = DoublyNode(value)
        if not self.head:
            self.head = self.tail = new_node
            return
        self.tail.next = new_node
        new_node.prev = self.tail
        self.tail = new_node

    def _snapshot(self, active_id: Optional[str] = None, new_node: Optional[DoublyNode] = None, deleted_id: Optional[str] = None) -> List[Dict[str, Any]]:
        snapshots = []
        curr = self.head
        while curr:
            snapshots.append(curr.to_dict(
                is_active=(curr.id == active_id),
                is_new=(new_node and curr.id == new_node.id),
                is_deleted=(curr.id == deleted_id),
                is_head=(curr == self.head),
                is_tail=(curr == self.tail)
            ))
            curr = curr.next

        if new_node and not any(s["id"] == new_node.id for s in snapshots):
            snapshots.insert(0, new_node.to_dict(is_active=True, is_new=True))
        return snapshots

    def get_length(self) -> int:
        count = 0
        curr = self.head
        while curr:
            count += 1
            curr = curr.next
        return count

    def to_values(self) -> List[int]:
        vals = []
        curr = self.head
        while curr:
            vals.append(curr.value)
            curr = curr.next
        return vals

    def insert_beginning(self, value: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        step_idx = 1

        new_node = DoublyNode(value)
        steps.append({
            "step_number": step_idx,
            "description": f"Allocated heap memory for DNode({value}). Set temp->data = {value}, temp->prev = NULL.",
            "nodes": self._snapshot(active_id=new_node.id, new_node=new_node),
            "head_id": self.head.id if self.head else None,
            "tail_id": self.tail.id if self.tail else None,
            "c_line_number": 3,
            "c_line_explanation": "temp = (DNODE)malloc(sizeof(struct DNode)); // Dynamic allocation",
            "log_type": "info",
            "comparisons": 0,
            "pointer_assignments": 2,
            "pointers_traversed": 0
        })
        step_idx += 1

        new_node.next = self.head
        steps.append({
            "step_number": step_idx,
            "description": f"Set temp->next = start (Pointing to {'Node(' + str(self.head.value) + ')' if self.head else 'NULL'}).",
            "nodes": self._snapshot(active_id=new_node.id, new_node=new_node),
            "head_id": self.head.id if self.head else None,
            "tail_id": self.tail.id if self.tail else None,
            "c_line_number": 6,
            "c_line_explanation": "temp->next = start; // Linking forward to existing list",
            "log_type": "pointer",
            "comparisons": 0,
            "pointer_assignments": 3,
            "pointers_traversed": 0
        })
        step_idx += 1

        if self.head:
            self.head.prev = new_node
            steps.append({
                "step_number": step_idx,
                "description": f"start != NULL: Pointed start->prev back to Node({value}). Two-way connection active!",
                "nodes": self._snapshot(active_id=self.head.id, new_node=new_node),
                "head_id": self.head.id,
                "tail_id": self.tail.id,
                "c_line_number": 8,
                "c_line_explanation": "start->prev = temp; // Establishing backward pointer link",
                "log_type": "pointer",
                "comparisons": 1,
                "pointer_assignments": 4,
                "pointers_traversed": 0
            })
            step_idx += 1

        self.head = new_node
        if not self.tail:
            self.tail = new_node

        steps.append({
            "step_number": step_idx,
            "description": f"Updated start = temp. HEAD pointer moved to Node({value}). O(1) Prepending complete!",
            "nodes": self._snapshot(active_id=self.head.id),
            "head_id": self.head.id,
            "tail_id": self.tail.id,
            "c_line_number": 10,
            "c_line_explanation": "start = temp; // Updating head to point to new first node",
            "log_type": "success",
            "comparisons": 1,
            "pointer_assignments": 5,
            "pointers_traversed": 0
        })

        return {
            "operation": "Insert at Beginning (Doubly)",
            "steps": steps,
            "c_code": C_DOUBLY_SNIPPETS["insert_beginning"],
            "c_struct": C_DOUBLY_STRUCT,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(1)",
                "time_worst": "O(1)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": 1,
                "traversals": 0,
                "pointer_assignments": 5,
                "total_nodes": self.get_length()
            }
        }

    def insert_end(self, value: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        step_idx = 1

        new_node = DoublyNode(value)
        steps.append({
            "step_number": step_idx,
            "description": f"Allocated heap memory for DNode({value}). Set temp->data = {value}, temp->next = NULL.",
            "nodes": self._snapshot(active_id=new_node.id, new_node=new_node),
            "head_id": self.head.id if self.head else None,
            "tail_id": self.tail.id if self.tail else None,
            "c_line_number": 3,
            "c_line_explanation": "temp = (DNODE)malloc(sizeof(struct DNode)); // Allocation",
            "log_type": "info",
            "comparisons": 0,
            "pointer_assignments": 2,
            "pointers_traversed": 0
        })
        step_idx += 1

        if not self.head:
            self.head = self.tail = new_node
            steps.append({
                "step_number": step_idx,
                "description": "List was empty (start == NULL). Set temp->prev = NULL, return temp.",
                "nodes": self._snapshot(active_id=self.head.id),
                "head_id": self.head.id,
                "tail_id": self.tail.id,
                "c_line_number": 9,
                "c_line_explanation": "return temp; // First node becomes the sole element",
                "log_type": "success",
                "comparisons": 1,
                "pointer_assignments": 3,
                "pointers_traversed": 0
            })
            return {
                "operation": "Insert at End (Doubly)",
                "steps": steps,
                "c_code": C_DOUBLY_SNIPPETS["insert_end"],
                "c_struct": C_DOUBLY_STRUCT,
                "complexity": {"time_best": "O(1)", "time_avg": "O(1)", "time_worst": "O(1)", "space_auxiliary": "O(1)"},
                "metrics": {"comparisons": 1, "traversals": 0, "pointer_assignments": 3, "total_nodes": 1}
            }

        # Traverse with curr
        curr = self.head
        traversals = 0
        while curr.next:
            curr = curr.next
            traversals += 1
            steps.append({
                "step_number": step_idx,
                "description": f"Traversed forward: curr = curr->next ➔ Node({curr.value}).",
                "nodes": self._snapshot(active_id=curr.id, new_node=new_node),
                "head_id": self.head.id,
                "tail_id": self.tail.id,
                "c_line_number": 12,
                "c_line_explanation": "curr = curr->next; // Advancing to tail",
                "log_type": "traverse",
                "comparisons": traversals,
                "pointer_assignments": 2,
                "pointers_traversed": traversals
            })
            step_idx += 1

        curr.next = new_node
        new_node.prev = curr
        self.tail = new_node

        steps.append({
            "step_number": step_idx,
            "description": f"Reached tail Node({curr.value}). Assigned curr->next = temp and temp->prev = curr. Bidirectional link formed!",
            "nodes": self._snapshot(active_id=new_node.id),
            "head_id": self.head.id,
            "tail_id": self.tail.id,
            "c_line_number": 15,
            "c_line_explanation": "curr->next = temp; temp->prev = curr; // Mutual linkage",
            "log_type": "success",
            "comparisons": traversals + 1,
            "pointer_assignments": 5,
            "pointers_traversed": traversals
        })

        return {
            "operation": "Insert at End (Doubly)",
            "steps": steps,
            "c_code": C_DOUBLY_SNIPPETS["insert_end"],
            "c_struct": C_DOUBLY_STRUCT,
            "complexity": {"time_best": "O(1)", "time_avg": "O(n)", "time_worst": "O(n)", "space_auxiliary": "O(1)"},
            "metrics": {"comparisons": traversals + 1, "traversals": traversals, "pointer_assignments": 5, "total_nodes": self.get_length()}
        }

    def delete_beginning(self) -> Dict[str, Any]:
        self.operation_count += 1
        if not self.head:
            return {"error": True, "message": "List is empty.", "steps": []}

        steps = []
        step_idx = 1
        deleted_val = self.head.value
        deleted_id = self.head.id

        steps.append({
            "step_number": step_idx,
            "description": f"Stored temp = start (Node({deleted_val})).",
            "nodes": self._snapshot(active_id=deleted_id, deleted_id=deleted_id),
            "head_id": self.head.id,
            "tail_id": self.tail.id,
            "c_line_number": 5,
            "c_line_explanation": "temp = start; // Holding reference to delete",
            "log_type": "info",
            "comparisons": 1,
            "pointer_assignments": 1,
            "pointers_traversed": 0
        })
        step_idx += 1

        self.head = self.head.next
        if self.head:
            self.head.prev = None
        else:
            self.tail = None

        steps.append({
            "step_number": step_idx,
            "description": f"Advanced start = start->next and set new start->prev = NULL. Called free(temp). Node({deleted_val}) deleted!",
            "nodes": self._snapshot(active_id=self.head.id if self.head else None),
            "head_id": self.head.id if self.head else None,
            "tail_id": self.tail.id if self.tail else None,
            "c_line_number": 8,
            "c_line_explanation": "start->prev = NULL; free(temp); // Severing backward link and freeing memory",
            "log_type": "success",
            "comparisons": 2,
            "pointer_assignments": 3,
            "pointers_traversed": 0
        })

        return {
            "operation": "Delete from Beginning (Doubly)",
            "steps": steps,
            "c_code": C_DOUBLY_SNIPPETS["delete_beginning"],
            "c_struct": C_DOUBLY_STRUCT,
            "complexity": {"time_best": "O(1)", "time_avg": "O(1)", "time_worst": "O(1)", "space_auxiliary": "O(1)"},
            "metrics": {"comparisons": 2, "traversals": 0, "pointer_assignments": 3, "total_nodes": self.get_length()}
        }

    def delete_end(self) -> Dict[str, Any]:
        self.operation_count += 1
        if not self.head:
            return {"error": True, "message": "List is empty.", "steps": []}

        steps = []
        if not self.head.next:
            deleted_val = self.head.value
            self.head = self.tail = None
            steps.append({
                "step_number": 1,
                "description": f"Single node in list: freed Node({deleted_val}). List is now empty.",
                "nodes": [],
                "head_id": None,
                "tail_id": None,
                "c_line_number": 6,
                "c_line_explanation": "free(start); return NULL;",
                "log_type": "success",
                "comparisons": 1,
                "pointer_assignments": 2,
                "pointers_traversed": 0
            })
            return {
                "operation": f"Delete End (Doubly: {deleted_val})",
                "steps": steps,
                "c_code": C_DOUBLY_SNIPPETS["delete_end"],
                "c_struct": C_DOUBLY_STRUCT,
                "metrics": {"comparisons": 1, "traversals": 0, "pointer_assignments": 2, "total_nodes": 0}
            }

        curr = self.head
        traversals = 0
        while curr.next:
            traversals += 1
            curr = curr.next

        deleted_val = curr.value
        curr.prev.next = None
        self.tail = curr.prev

        steps.append({
            "step_number": 1,
            "description": f"Traversed to tail Node({deleted_val}). Severed backward connection: curr->prev->next = NULL. Called free(curr).",
            "nodes": self._snapshot(active_id=self.tail.id),
            "head_id": self.head.id,
            "tail_id": self.tail.id,
            "c_line_number": 12,
            "c_line_explanation": "curr->prev->next = NULL; free(curr); return start;",
            "log_type": "success",
            "comparisons": traversals,
            "pointer_assignments": 2,
            "pointers_traversed": traversals
        })

        return {
            "operation": f"Delete End (Doubly: {deleted_val})",
            "steps": steps,
            "c_code": C_DOUBLY_SNIPPETS["delete_end"],
            "c_struct": C_DOUBLY_STRUCT,
            "complexity": {"time_best": "O(1)", "time_avg": "O(n)", "time_worst": "O(n)", "space_auxiliary": "O(1)"},
            "metrics": {"comparisons": traversals, "traversals": traversals, "pointer_assignments": 2, "total_nodes": self.get_length()}
        }

    def reverse(self) -> Dict[str, Any]:
        self.operation_count += 1
        if not self.head or not self.head.next:
            return {
                "operation": "Reverse Doubly Linked List",
                "steps": [{
                    "step_number": 1,
                    "description": "List has 0 or 1 node. Reversal complete trivially.",
                    "nodes": self._snapshot(),
                    "head_id": self.head.id if self.head else None,
                    "tail_id": self.tail.id if self.tail else None,
                    "c_line_number": 2,
                    "c_line_explanation": "No swap required for single node or empty list.",
                    "log_type": "info"
                }],
                "c_code": C_DOUBLY_SNIPPETS["reverse"],
                "c_struct": C_DOUBLY_STRUCT,
                "metrics": {"comparisons": 0, "traversals": 0, "pointer_assignments": 0, "total_nodes": self.get_length()}
            }

        steps = []
        curr = self.head
        temp = None
        step_num = 1
        swaps = 0

        while curr:
            swaps += 1
            temp = curr.prev
            curr.prev = curr.next
            curr.next = temp

            steps.append({
                "step_number": step_num,
                "description": f"Swapping pointers for Node({curr.value}): prev becomes {curr.prev.value if curr.prev else 'NULL'}, next becomes {curr.next.value if curr.next else 'NULL'}.",
                "nodes": self._snapshot(active_id=curr.id),
                "head_id": self.head.id,
                "tail_id": self.tail.id,
                "c_line_number": 6,
                "c_line_explanation": "temp = curr->prev; curr->prev = curr->next; curr->next = temp;",
                "log_type": "pointer",
                "comparisons": swaps,
                "pointer_assignments": swaps * 3,
                "pointers_traversed": swaps
            })
            step_num += 1
            curr = curr.prev  # move to next in original order

        if temp:
            self.tail = self.head
            self.head = temp.prev

        steps.append({
            "step_number": step_num,
            "description": f"All two-way pointers swapped. Updated start = Node({self.head.value}). Reversal complete!",
            "nodes": self._snapshot(active_id=self.head.id),
            "head_id": self.head.id,
            "tail_id": self.tail.id,
            "c_line_number": 10,
            "c_line_explanation": "start = temp->prev; return start;",
            "log_type": "success",
            "comparisons": swaps,
            "pointer_assignments": swaps * 3 + 2,
            "pointers_traversed": swaps
        })

        return {
            "operation": "Reverse Doubly Linked List",
            "steps": steps,
            "c_code": C_DOUBLY_SNIPPETS["reverse"],
            "c_struct": C_DOUBLY_STRUCT,
            "complexity": {"time_best": "O(n)", "time_avg": "O(n)", "time_worst": "O(n)", "space_auxiliary": "O(1)"},
            "metrics": {"comparisons": swaps, "traversals": swaps, "pointer_assignments": swaps * 3 + 2, "total_nodes": self.get_length()}
        }

    def get_state(self) -> Dict[str, Any]:
        return {
            "nodes": self._snapshot(),
            "head_id": self.head.id if self.head else None,
            "tail_id": self.tail.id if self.tail else None,
            "total_nodes": self.get_length(),
            "c_struct": C_DOUBLY_STRUCT
        }

    def reset_default(self) -> Dict[str, Any]:
        self.head = self.tail = None
        for val in [10, 20, 30, 40]:
            self._raw_append(val)
        return {
            "operation": "Reset Doubly Linked List",
            "steps": [{
                "step_number": 1,
                "description": "Reset Doubly Linked List: NULL ⮜ [10] ⮞ [20] ⮞ [30] ⮞ [40] ⮞ NULL.",
                "nodes": self._snapshot(active_id=self.head.id),
                "head_id": self.head.id,
                "tail_id": self.tail.id,
                "c_line_number": 1,
                "c_line_explanation": "// Demonstrator setup for Doubly Linked List",
                "log_type": "info",
                "comparisons": 0,
                "pointer_assignments": 0,
                "pointers_traversed": 0
            }],
            "c_code": C_DOUBLY_SNIPPETS["insert_beginning"],
            "c_struct": C_DOUBLY_STRUCT,
            "complexity": {"time_best": "O(1)", "time_avg": "O(1)", "time_worst": "O(1)", "space_auxiliary": "O(1)"},
            "metrics": {"comparisons": 0, "traversals": 0, "pointer_assignments": 0, "total_nodes": 4}
        }

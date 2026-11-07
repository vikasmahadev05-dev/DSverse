"""
DSVERSE - Circular Linked List Data Structure & Execution Engine.
Academic execution engine tracking circular pointer loops, Floyd's Cycle Detection
(Tortoise & Hare), and synchronized ANSI C line mapping.
"""

import uuid
from typing import List, Dict, Any, Optional

C_CIRCULAR_STRUCT = """struct CNode {
    int data;
    struct CNode* next;
};
typedef struct CNode* CNODE;"""

C_CIRCULAR_SNIPPETS = {
    "insert_beginning": (
        "CNODE insert_beginning(CNODE head, int val) {\n"
        "    CNODE temp = (CNODE)malloc(sizeof(struct CNode));\n"
        "    temp->data = val;\n"
        "    if (head == NULL) {\n"
        "        temp->next = temp; // Points to self\n"
        "        return temp;\n"
        "    }\n"
        "    CNODE curr = head;\n"
        "    while (curr->next != head) {\n"
        "        curr = curr->next; // Find last node\n"
        "    }\n"
        "    curr->next = temp;\n"
        "    temp->next = head;\n"
        "    return temp; // New node becomes head\n"
        "}"
    ),
    "insert_end": (
        "CNODE insert_end(CNODE head, int val) {\n"
        "    CNODE temp = (CNODE)malloc(sizeof(struct CNode));\n"
        "    temp->data = val;\n"
        "    if (head == NULL) {\n"
        "        temp->next = temp;\n"
        "        return temp;\n"
        "    }\n"
        "    CNODE curr = head;\n"
        "    while (curr->next != head) {\n"
        "        curr = curr->next;\n"
        "    }\n"
        "    curr->next = temp;\n"
        "    temp->next = head; // Circle back to head\n"
        "    return head;\n"
        "}"
    ),
    "delete_beginning": (
        "CNODE delete_beginning(CNODE head) {\n"
        "    if (head == NULL) return NULL;\n"
        "    if (head->next == head) {\n"
        "        free(head);\n"
        "        return NULL;\n"
        "    }\n"
        "    CNODE curr = head;\n"
        "    while (curr->next != head) curr = curr->next;\n"
        "    CNODE temp = head;\n"
        "    curr->next = head->next;\n"
        "    head = head->next;\n"
        "    free(temp);\n"
        "    return head;\n"
        "}"
    ),
    "detect_cycle": (
        "int detect_cycle_floyd(CNODE head) {\n"
        "    if (head == NULL) return 0;\n"
        "    CNODE slow = head;\n"
        "    CNODE fast = head;\n"
        "    while (fast != NULL && fast->next != NULL) {\n"
        "        slow = slow->next;\n"
        "        fast = fast->next->next;\n"
        "        if (slow == fast) return 1; // Cycle confirmed\n"
        "    }\n"
        "    return 0;\n"
        "}"
    )
}


class CircularNode:
    """A node in the Circular Linked List."""
    def __init__(self, value: int, node_id: Optional[str] = None):
        self.value: int = value
        self.next: Optional['CircularNode'] = None
        self.id: str = node_id or f"cnode-{uuid.uuid4().hex[:6]}"

    def to_dict(
        self,
        is_active: bool = False,
        is_new: bool = False,
        is_deleted: bool = False,
        is_head: bool = False,
        is_slow: bool = False,
        is_fast: bool = False
    ) -> Dict[str, Any]:
        return {
            "id": self.id,
            "value": self.value,
            "next_id": self.next.id if self.next else None,
            "is_active": is_active,
            "is_new": is_new,
            "is_deleted": is_deleted,
            "is_head": is_head,
            "is_slow": is_slow,
            "is_fast": is_fast
        }


class CircularLinkedList:
    def __init__(self, initial_values: Optional[List[int]] = None):
        self.head: Optional[CircularNode] = None
        self.operation_count: int = 0
        vals = initial_values if initial_values is not None else [10, 20, 30, 40]
        for v in vals:
            self._raw_append(v)

    def _raw_append(self, value: int):
        new_node = CircularNode(value)
        if not self.head:
            self.head = new_node
            new_node.next = self.head
            return
        curr = self.head
        while curr.next != self.head:
            curr = curr.next
        curr.next = new_node
        new_node.next = self.head

    def _snapshot(
        self,
        active_id: Optional[str] = None,
        slow_id: Optional[str] = None,
        fast_id: Optional[str] = None,
        new_node: Optional[CircularNode] = None
    ) -> List[Dict[str, Any]]:
        if not self.head:
            return [new_node.to_dict(is_active=True, is_new=True)] if new_node else []

        snapshots = []
        curr = self.head
        visited = set()

        while True:
            visited.add(curr.id)
            snapshots.append(curr.to_dict(
                is_active=(curr.id == active_id),
                is_head=(curr == self.head),
                is_slow=(curr.id == slow_id),
                is_fast=(curr.id == fast_id)
            ))
            curr = curr.next
            if curr == self.head or curr.id in visited:
                break

        if new_node and not any(s["id"] == new_node.id for s in snapshots):
            snapshots.insert(0, new_node.to_dict(is_active=True, is_new=True))

        return snapshots

    def get_length(self) -> int:
        if not self.head:
            return 0
        count = 1
        curr = self.head
        while curr.next != self.head:
            count += 1
            curr = curr.next
        return count

    def get_state(self) -> Dict[str, Any]:
        return {
            "nodes": self._snapshot(),
            "head_id": self.head.id if self.head else None,
            "total_nodes": self.get_length(),
            "c_struct": C_CIRCULAR_STRUCT
        }

    def reset_default(self) -> Dict[str, Any]:
        self.head = None
        for val in [10, 20, 30, 40]:
            self._raw_append(val)
        self.operation_count = 0
        return self.get_state()

    def insert_beginning(self, value: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_CIRCULAR_SNIPPETS["insert_beginning"]

        new_node = CircularNode(value)
        steps.append({
            "step_number": 1,
            "description": f"Allocated CNode({value}). Prepared for insertion at circular head.",
            "nodes": self._snapshot(active_id=new_node.id, new_node=new_node),
            "head_id": self.head.id if self.head else None,
            "c_line_number": 2,
            "c_line_explanation": "CNODE temp = (CNODE)malloc(sizeof(struct CNode)); temp->data = val;",
            "log_type": "info",
            "comparisons": 0,
            "pointer_assignments": 1,
            "pointers_traversed": 0
        })

        if not self.head:
            self.head = new_node
            new_node.next = self.head
            steps.append({
                "step_number": 2,
                "description": "List was empty. Linked new_node.next back to itself. Circle established with 1 node.",
                "nodes": self._snapshot(active_id=self.head.id),
                "head_id": self.head.id,
                "c_line_number": 5,
                "c_line_explanation": "temp->next = temp; return temp;",
                "log_type": "success",
                "comparisons": 1,
                "pointer_assignments": 2,
                "pointers_traversed": 0
            })
            return {
                "operation": f"Insert {value} at Beginning (Circular)",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_CIRCULAR_STRUCT,
                "metrics": {"comparisons": 1, "traversals": 0, "pointer_assignments": 2, "total_nodes": 1}
            }

        curr = self.head
        traversals = 0
        while curr.next != self.head:
            traversals += 1
            curr = curr.next
            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Scanning circular list to find tail node: curr ➔ Node({curr.value}).",
                "nodes": self._snapshot(active_id=curr.id, new_node=new_node),
                "head_id": self.head.id,
                "c_line_number": 9,
                "c_line_explanation": "while (curr->next != head) curr = curr->next; Finding last node in circular loop.",
                "log_type": "traverse",
                "comparisons": traversals,
                "pointer_assignments": 1,
                "pointers_traversed": traversals
            })

        curr.next = new_node
        new_node.next = self.head
        self.head = new_node

        steps.append({
            "step_number": len(steps) + 1,
            "description": f"Tail Node({curr.value}).next linked to new Node({value}). new_node.next linked to old head. HEAD pointer updated to Node({value}).",
            "nodes": self._snapshot(active_id=self.head.id),
            "head_id": self.head.id,
            "c_line_number": 12,
            "c_line_explanation": "curr->next = temp; temp->next = head; return temp;",
            "log_type": "success",
            "comparisons": traversals,
            "pointer_assignments": 3,
            "pointers_traversed": traversals
        })

        return {
            "operation": f"Insert {value} at Beginning (Circular)",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_CIRCULAR_STRUCT,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": traversals,
                "traversals": traversals,
                "pointer_assignments": 3,
                "total_nodes": self.get_length()
            }
        }

    def insert_end(self, value: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_CIRCULAR_SNIPPETS["insert_end"]

        new_node = CircularNode(value)
        steps.append({
            "step_number": 1,
            "description": f"Allocated CNode({value}). Prepared for appending to circular tail.",
            "nodes": self._snapshot(active_id=new_node.id, new_node=new_node),
            "head_id": self.head.id if self.head else None,
            "c_line_number": 2,
            "c_line_explanation": "CNODE temp = (CNODE)malloc(sizeof(struct CNode)); temp->data = val;",
            "log_type": "info",
            "comparisons": 0,
            "pointer_assignments": 1,
            "pointers_traversed": 0
        })

        if not self.head:
            self.head = new_node
            new_node.next = self.head
            steps.append({
                "step_number": 2,
                "description": "List was empty. Set HEAD ➔ new node, and looped new_node.next ➔ self.head.",
                "nodes": self._snapshot(active_id=self.head.id),
                "head_id": self.head.id,
                "c_line_number": 5,
                "c_line_explanation": "temp->next = temp; return temp;",
                "log_type": "success",
                "comparisons": 1,
                "pointer_assignments": 2,
                "pointers_traversed": 0
            })
            return {
                "operation": f"Insert {value} at End (Circular)",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_CIRCULAR_STRUCT,
                "metrics": {"comparisons": 1, "traversals": 0, "pointer_assignments": 2, "total_nodes": 1}
            }

        curr = self.head
        traversals = 0
        while curr.next != self.head:
            traversals += 1
            curr = curr.next
            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Traversing circular loop to tail: curr ➔ Node({curr.value}).",
                "nodes": self._snapshot(active_id=curr.id, new_node=new_node),
                "head_id": self.head.id,
                "c_line_number": 9,
                "c_line_explanation": "while (curr->next != head) curr = curr->next;",
                "log_type": "traverse",
                "comparisons": traversals,
                "pointer_assignments": 1,
                "pointers_traversed": traversals
            })

        curr.next = new_node
        new_node.next = self.head

        steps.append({
            "step_number": len(steps) + 1,
            "description": f"Linked old tail Node({curr.value}).next ➔ Node({value}), and new_node.next ➔ HEAD Node({self.head.value}). Circle preserved!",
            "nodes": self._snapshot(active_id=new_node.id),
            "head_id": self.head.id,
            "c_line_number": 12,
            "c_line_explanation": "curr->next = temp; temp->next = head; return head;",
            "log_type": "success",
            "comparisons": traversals,
            "pointer_assignments": 3,
            "pointers_traversed": traversals
        })

        return {
            "operation": f"Insert {value} at End (Circular)",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_CIRCULAR_STRUCT,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": traversals,
                "traversals": traversals,
                "pointer_assignments": 3,
                "total_nodes": self.get_length()
            }
        }

    def delete_beginning(self) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_CIRCULAR_SNIPPETS["delete_beginning"]

        if not self.head:
            steps.append({
                "step_number": 1,
                "description": "Underflow: List is empty. Cannot delete.",
                "nodes": [],
                "head_id": None,
                "c_line_number": 2,
                "c_line_explanation": "if (head == NULL) return NULL;",
                "log_type": "error",
                "comparisons": 1,
                "pointer_assignments": 0,
                "pointers_traversed": 0
            })
            return {
                "operation": "Delete Beginning (Circular)",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_CIRCULAR_STRUCT,
                "error": True,
                "message": "List is empty."
            }

        if self.head.next == self.head:
            removed_val = self.head.value
            self.head = None
            steps.append({
                "step_number": 1,
                "description": f"Single node in circular list: freed Node({removed_val}). List is now empty.",
                "nodes": [],
                "head_id": None,
                "c_line_number": 4,
                "c_line_explanation": "free(head); return NULL;",
                "log_type": "success",
                "comparisons": 1,
                "pointer_assignments": 1,
                "pointers_traversed": 0
            })
            return {
                "operation": f"Delete Beginning ({removed_val})",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_CIRCULAR_STRUCT,
                "metrics": {"comparisons": 1, "traversals": 0, "pointer_assignments": 1, "total_nodes": 0}
            }

        curr = self.head
        while curr.next != self.head:
            curr = curr.next

        old_head = self.head
        self.head = self.head.next
        curr.next = self.head

        steps.append({
            "step_number": 1,
            "description": f"Tail Node({curr.value}).next redirected to new HEAD Node({self.head.value}). Freed old head Node({old_head.value}).",
            "nodes": self._snapshot(active_id=self.head.id),
            "head_id": self.head.id,
            "c_line_number": 10,
            "c_line_explanation": "curr->next = head->next; head = head->next; free(temp);",
            "log_type": "success",
            "comparisons": 2,
            "pointer_assignments": 2,
            "pointers_traversed": 1
        })

        return {
            "operation": f"Delete Beginning ({old_head.value})",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_CIRCULAR_STRUCT,
            "complexity": {
                "time_best": "O(n)",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": 2,
                "traversals": 1,
                "pointer_assignments": 2,
                "total_nodes": self.get_length()
            }
        }

    def detect_cycle_floyd(self) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_CIRCULAR_SNIPPETS["detect_cycle"]

        if not self.head:
            return {"error": True, "message": "List is empty.", "steps": []}

        slow = self.head
        fast = self.head

        steps.append({
            "step_number": 1,
            "description": f"Floyd's Algorithm: Set SLOW (Tortoise 🐢) and FAST (Hare 🐇) at HEAD Node({self.head.value}).",
            "nodes": self._snapshot(slow_id=slow.id, fast_id=fast.id),
            "head_id": self.head.id,
            "c_line_number": 3,
            "c_line_explanation": "CNODE slow = head; CNODE fast = head;",
            "log_type": "info",
            "comparisons": 0,
            "pointer_assignments": 2,
            "pointers_traversed": 0
        })

        iteration = 1
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Iteration {iteration}: SLOW moved 1 step ➔ Node({slow.value}). FAST moved 2 steps ➔ Node({fast.value}).",
                "nodes": self._snapshot(slow_id=slow.id, fast_id=fast.id),
                "head_id": self.head.id,
                "c_line_number": 6,
                "c_line_explanation": "slow = slow->next; fast = fast->next->next;",
                "log_type": "traverse",
                "comparisons": iteration,
                "pointer_assignments": 2,
                "pointers_traversed": iteration * 3
            })
            iteration += 1

            if slow == fast:
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"🎯 CYCLE DETECTED! SLOW and FAST met at Node({slow.value}). Proven circular loop with infinite traversal prevention!",
                    "nodes": self._snapshot(slow_id=slow.id, fast_id=fast.id, active_id=slow.id),
                    "head_id": self.head.id,
                    "c_line_number": 8,
                    "c_line_explanation": "if (slow == fast) return 1; // Cycle confirmed by 2-pointer convergence",
                    "log_type": "success",
                    "comparisons": iteration,
                    "pointer_assignments": 2,
                    "pointers_traversed": iteration * 3
                })
                break

        return {
            "operation": "Floyd's Cycle Detection (Tortoise & Hare)",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_CIRCULAR_STRUCT,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": iteration,
                "traversals": iteration * 3,
                "pointer_assignments": 2,
                "total_nodes": self.get_length()
            }
        }

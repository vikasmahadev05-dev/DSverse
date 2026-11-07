"""
DSVERSE - Core Singly Linked List Data Structure & Execution Engine.
Executes underlying pointer manipulation in Python while generating synchronized
event steps mapped line-by-line to reference C programming language implementations.
"""

import uuid
from typing import List, Dict, Any, Optional


class Node:
    """A node in the Singly Linked List."""
    def __init__(self, value: int, node_id: Optional[str] = None):
        self.value: int = value
        self.next: Optional['Node'] = None
        self.id: str = node_id or f"node-{uuid.uuid4().hex[:6]}"

    def to_dict(
        self,
        is_active: bool = False,
        is_new: bool = False,
        is_deleted: bool = False,
        is_head: bool = False,
        is_slow: bool = False,
        is_fast: bool = False,
        is_target: bool = False
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
            "is_fast": is_fast,
            "is_target": is_target
        }


# =======================================================================
# REFERENCE C CODE IMPLEMENTATIONS
# Struct definition and ANSI C functions for each Linked List operation.
# =======================================================================

C_STRUCT_DEFINITION = """struct Node {
    int data;
    struct Node* next;
};
typedef struct Node* NODE;"""

C_CODE_SNIPPETS = {
    "insert_beginning": (
        "NODE insert_beginning(NODE start, int info)\n"
        "{\n"
        "    NODE temp;\n"
        "    temp = (NODE)malloc(sizeof(struct Node));\n"
        "    if (temp == NULL) {\n"
        "        printf(\"Memory allocation failed!\\n\");\n"
        "        return start;\n"
        "    }\n"
        "    temp->data = info;\n"
        "    temp->next = start;\n"
        "    start = temp;\n"
        "    return start;\n"
        "}"
    ),
    "insert_end": (
        "NODE insert_end(NODE start, int info)\n"
        "{\n"
        "    NODE temp, curr;\n"
        "    temp = (NODE)malloc(sizeof(struct Node));\n"
        "    temp->data = info;\n"
        "    temp->next = NULL;\n"
        "    if (start == NULL) {\n"
        "        start = temp;\n"
        "        return start;\n"
        "    }\n"
        "    curr = start;\n"
        "    while (curr->next != NULL) {\n"
        "        curr = curr->next;\n"
        "    }\n"
        "    curr->next = temp;\n"
        "    return start;\n"
        "}"
    ),
    "insert_position": (
        "NODE insert_at_position(NODE start, int info, int pos)\n"
        "{\n"
        "    NODE temp, curr;\n"
        "    int i;\n"
        "    if (pos == 0) {\n"
        "        return insert_beginning(start, info);\n"
        "    }\n"
        "    temp = (NODE)malloc(sizeof(struct Node));\n"
        "    temp->data = info;\n"
        "    curr = start;\n"
        "    for (i = 0; i < pos - 1 && curr != NULL; i++) {\n"
        "        curr = curr->next;\n"
        "    }\n"
        "    if (curr == NULL) {\n"
        "        free(temp);\n"
        "        return start;\n"
        "    }\n"
        "    temp->next = curr->next;\n"
        "    curr->next = temp;\n"
        "    return start;\n"
        "}"
    ),
    "delete_beginning": (
        "NODE delete_beginning(NODE start)\n"
        "{\n"
        "    NODE temp;\n"
        "    if (start == NULL) {\n"
        "        printf(\"List is empty.\\n\");\n"
        "        return NULL;\n"
        "    }\n"
        "    temp = start;\n"
        "    start = start->next;\n"
        "    printf(\"Deleted node: %d\\n\", temp->data);\n"
        "    free(temp);\n"
        "    return start;\n"
        "}"
    ),
    "delete_end": (
        "NODE delete_end(NODE start)\n"
        "{\n"
        "    NODE curr, prev = NULL;\n"
        "    if (start == NULL)\n"
        "        return NULL;\n"
        "    if (start->next == NULL) {\n"
        "        free(start);\n"
        "        return NULL;\n"
        "    }\n"
        "    curr = start;\n"
        "    while (curr->next != NULL) {\n"
        "        prev = curr;\n"
        "        curr = curr->next;\n"
        "    }\n"
        "    prev->next = NULL;\n"
        "    free(curr);\n"
        "    return start;\n"
        "}"
    ),
    "delete_position": (
        "NODE delete_at_position(NODE start, int pos)\n"
        "{\n"
        "    NODE curr, temp;\n"
        "    int i;\n"
        "    if (start == NULL) return NULL;\n"
        "    if (pos == 0) return delete_beginning(start);\n"
        "    curr = start;\n"
        "    for (i = 0; i < pos - 1 && curr->next != NULL; i++) {\n"
        "        curr = curr->next;\n"
        "    }\n"
        "    if (curr->next == NULL) return start;\n"
        "    temp = curr->next;\n"
        "    curr->next = temp->next;\n"
        "    free(temp);\n"
        "    return start;\n"
        "}"
    ),
    "delete_value": (
        "NODE delete_by_value(NODE start, int val)\n"
        "{\n"
        "    NODE curr, prev = NULL;\n"
        "    if (start == NULL) return NULL;\n"
        "    if (start->data == val) {\n"
        "        NODE temp = start;\n"
        "        start = start->next;\n"
        "        free(temp);\n"
        "        return start;\n"
        "    }\n"
        "    curr = start;\n"
        "    while (curr != NULL && curr->data != val) {\n"
        "        prev = curr;\n"
        "        curr = curr->next;\n"
        "    }\n"
        "    if (curr == NULL) return start;\n"
        "    prev->next = curr->next;\n"
        "    free(curr);\n"
        "    return start;\n"
        "}"
    ),
    "search": (
        "int search_element(NODE start, int key)\n"
        "{\n"
        "    NODE curr = start;\n"
        "    int index = 0;\n"
        "    while (curr != NULL) {\n"
        "        if (curr->data == key) {\n"
        "            return index; // Found\n"
        "        }\n"
        "        curr = curr->next;\n"
        "        index++;\n"
        "    }\n"
        "    return -1; // Not found\n"
        "}"
    ),
    "reverse": (
        "NODE reverse_list(NODE start)\n"
        "{\n"
        "    NODE prev = NULL;\n"
        "    NODE curr = start;\n"
        "    NODE next = NULL;\n"
        "    while (curr != NULL) {\n"
        "        next = curr->next;\n"
        "        curr->next = prev;\n"
        "        prev = curr;\n"
        "        curr = next;\n"
        "    }\n"
        "    start = prev;\n"
        "    return start;\n"
        "}"
    ),
    "find_middle": (
        "NODE find_middle(NODE start)\n"
        "{\n"
        "    NODE slow = start;\n"
        "    NODE fast = start;\n"
        "    while (fast != NULL && fast->next != NULL) {\n"
        "        slow = slow->next;\n"
        "        fast = fast->next->next;\n"
        "    }\n"
        "    return slow; // Points to middle node\n"
        "}"
    ),
    "detect_cycle": (
        "int detect_cycle(NODE start)\n"
        "{\n"
        "    NODE slow = start;\n"
        "    NODE fast = start;\n"
        "    while (fast != NULL && fast->next != NULL) {\n"
        "        slow = slow->next;\n"
        "        fast = fast->next->next;\n"
        "        if (slow == fast) {\n"
        "            return 1; // Cycle detected\n"
        "        }\n"
        "    }\n"
        "    return 0; // No cycle\n"
        "}"
    )
}


class ExecutionStep:
    """Represents a single atomic step synchronized with a C source line."""
    def __init__(
        self,
        step_number: int,
        description: str,
        nodes: List[Dict[str, Any]],
        head_id: Optional[str],
        active_node_id: Optional[str] = None,
        c_line_number: int = 1,
        c_line_explanation: str = "",
        log_type: str = "info",
        pointers_traversed: int = 0,
        comparisons: int = 0,
        pointer_assignments: int = 0,
        traversals: int = 0,
        **kwargs
    ):
        self.step_number = step_number
        self.description = description
        self.nodes = nodes
        self.head_id = head_id
        self.active_node_id = active_node_id
        self.c_line_number = c_line_number
        self.c_line_explanation = c_line_explanation
        self.log_type = log_type  # 'info', 'pointer', 'traverse', 'success', 'warning', 'error'
        self.pointers_traversed = pointers_traversed if pointers_traversed != 0 else traversals
        self.comparisons = comparisons
        self.pointer_assignments = pointer_assignments

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step_number": self.step_number,
            "description": self.description,
            "nodes": self.nodes,
            "head_id": self.head_id,
            "active_node_id": self.active_node_id,
            "c_line_number": self.c_line_number,
            "c_line_explanation": self.c_line_explanation,
            "log_type": self.log_type,
            "pointers_traversed": self.pointers_traversed,
            "comparisons": self.comparisons,
            "pointer_assignments": self.pointer_assignments
        }


class SinglyLinkedList:
    """
    Academic Singly Linked List with exact C source line-by-line event tracking.
    Does NOT use built-in Python lists for internal linked list storage.
    """

    def __init__(self, initial_values: Optional[List[int]] = None):
        self.head: Optional[Node] = None
        self.operation_count: int = 0
        if initial_values:
            for val in initial_values:
                self._raw_append(val)

    def _raw_append(self, value: int):
        new_node = Node(value)
        if not self.head:
            self.head = new_node
            return
        curr = self.head
        while curr.next:
            curr = curr.next
        curr.next = new_node

    def _snapshot(
        self,
        active_id: Optional[str] = None,
        new_node: Optional[Node] = None,
        deleted_id: Optional[str] = None,
        slow_id: Optional[str] = None,
        fast_id: Optional[str] = None,
        target_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        snapshots = []
        curr = self.head
        is_first = True

        while curr:
            snapshots.append(curr.to_dict(
                is_active=(curr.id == active_id),
                is_new=(new_node and curr.id == new_node.id),
                is_deleted=(curr.id == deleted_id),
                is_head=is_first,
                is_slow=(curr.id == slow_id),
                is_fast=(curr.id == fast_id),
                is_target=(curr.id == target_id)
            ))
            is_first = False
            curr = curr.next

        # Floating node not yet linked
        if new_node and not any(s["id"] == new_node.id for s in snapshots):
            snapshots.insert(0, new_node.to_dict(is_active=True, is_new=True, is_head=False))

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

    # -------------------------------------------------------------------
    # A. INSERTION OPERATIONS
    # -------------------------------------------------------------------

    def insert_beginning(self, value: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps: List[ExecutionStep] = []
        step_idx = 1

        # C Line 3: NODE temp;
        steps.append(ExecutionStep(
            step_number=step_idx,
            description="Declared pointer variable 'temp' of type NODE.",
            nodes=self._snapshot(),
            head_id=self.head.id if self.head else None,
            c_line_number=3,
            c_line_explanation="NODE temp; // Declaring a pointer to a struct Node",
            log_type="info"
        ))
        step_idx += 1

        # C Line 4: temp = (NODE)malloc(sizeof(struct Node));
        new_node = Node(value)
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Allocated memory using malloc({len(str(value))} bytes) for new Node({value}).",
            nodes=self._snapshot(active_id=new_node.id, new_node=new_node),
            head_id=self.head.id if self.head else None,
            active_node_id=new_node.id,
            c_line_number=4,
            c_line_explanation="temp = (NODE)malloc(sizeof(struct Node)); // Dynamic heap allocation",
            log_type="pointer"
        ))
        step_idx += 1

        # C Line 9: temp->data = info;
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Assigned data field: temp->data = {value}.",
            nodes=self._snapshot(active_id=new_node.id, new_node=new_node),
            head_id=self.head.id if self.head else None,
            active_node_id=new_node.id,
            c_line_number=9,
            c_line_explanation=f"temp->data = {value}; // Storing payload in newly created node",
            log_type="info",
            pointer_assignments=1
        ))
        step_idx += 1

        # C Line 10: temp->next = start;
        new_node.next = self.head
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Set temp->next = start (Pointing to {'Node(' + str(self.head.value) + ')' if self.head else 'NULL'}).",
            nodes=self._snapshot(active_id=new_node.id, new_node=new_node),
            head_id=self.head.id if self.head else None,
            active_node_id=new_node.id,
            c_line_number=10,
            c_line_explanation="temp->next = start; // Linking new node to previous head of list",
            log_type="pointer",
            pointer_assignments=2
        ))
        step_idx += 1

        # C Line 11: start = temp;
        self.head = new_node
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Updated start = temp. HEAD pointer moved to Node({value}). Prepending complete!",
            nodes=self._snapshot(active_id=self.head.id),
            head_id=self.head.id,
            active_node_id=self.head.id,
            c_line_number=11,
            c_line_explanation="start = temp; // Advancing head pointer to the new first node",
            log_type="success",
            pointer_assignments=3
        ))

        return {
            "operation": "Insert at Beginning",
            "steps": [s.to_dict() for s in steps],
            "c_code": C_CODE_SNIPPETS["insert_beginning"],
            "c_struct": C_STRUCT_DEFINITION,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(1)",
                "time_worst": "O(1)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": 0,
                "traversals": 0,
                "pointer_assignments": 3,
                "total_nodes": self.get_length()
            }
        }

    def insert_end(self, value: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps: List[ExecutionStep] = []
        step_idx = 1
        traversals = 0
        pointer_assignments = 0

        # C Line 4: temp = (NODE)malloc(sizeof(struct Node));
        new_node = Node(value)
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Allocated memory on heap for new node Node({value}).",
            nodes=self._snapshot(new_node=new_node),
            head_id=self.head.id if self.head else None,
            active_node_id=new_node.id,
            c_line_number=4,
            c_line_explanation="temp = (NODE)malloc(sizeof(struct Node)); // Heap memory allocation",
            log_type="info"
        ))
        step_idx += 1

        # C Line 5-6: temp->data = info; temp->next = NULL;
        pointer_assignments += 1
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Initialized temp->data = {value} and temp->next = NULL.",
            nodes=self._snapshot(new_node=new_node),
            head_id=self.head.id if self.head else None,
            active_node_id=new_node.id,
            c_line_number=6,
            c_line_explanation="temp->next = NULL; // New tail node must terminate with NULL",
            log_type="pointer",
            pointer_assignments=pointer_assignments
        ))
        step_idx += 1

        # C Line 7: if (start == NULL)
        if not self.head:
            self.head = new_node
            pointer_assignments += 1
            steps.append(ExecutionStep(
                step_number=step_idx,
                description="List is empty (start == NULL). Assigned start = temp.",
                nodes=self._snapshot(active_id=self.head.id),
                head_id=self.head.id,
                active_node_id=self.head.id,
                c_line_number=8,
                c_line_explanation="start = temp; // When list is empty, start points directly to temp",
                log_type="success",
                comparisons=1,
                pointer_assignments=pointer_assignments
            ))
            return {
                "operation": "Insert at End",
                "steps": [s.to_dict() for s in steps],
                "c_code": C_CODE_SNIPPETS["insert_end"],
                "c_struct": C_STRUCT_DEFINITION,
                "complexity": {
                    "time_best": "O(1)",
                    "time_avg": "O(n)",
                    "time_worst": "O(n)",
                    "space_auxiliary": "O(1)"
                },
                "metrics": {
                    "comparisons": 1,
                    "traversals": 0,
                    "pointer_assignments": pointer_assignments,
                    "total_nodes": 1
                }
            }

        # C Line 11: curr = start;
        curr = self.head
        pointer_assignments += 1
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Set curr = start at HEAD Node({curr.value}) to begin tail traversal.",
            nodes=self._snapshot(active_id=curr.id, new_node=new_node),
            head_id=self.head.id,
            active_node_id=curr.id,
            c_line_number=11,
            c_line_explanation="curr = start; // Initializing traversal pointer to head of list",
            log_type="traverse",
            pointer_assignments=pointer_assignments
        ))
        step_idx += 1

        comparisons = 1
        while curr.next:
            curr = curr.next
            traversals += 1
            comparisons += 1
            pointer_assignments += 1
            steps.append(ExecutionStep(
                step_number=step_idx,
                description=f"curr->next != NULL. Advanced curr = curr->next ➔ Node({curr.value}).",
                nodes=self._snapshot(active_id=curr.id, new_node=new_node),
                head_id=self.head.id,
                active_node_id=curr.id,
                c_line_number=13,
                c_line_explanation="curr = curr->next; // Advancing forward until reaching the tail node",
                log_type="traverse",
                traversals=traversals,
                comparisons=comparisons,
                pointer_assignments=pointer_assignments
            ))
            step_idx += 1

        # C Line 15: curr->next = temp;
        curr.next = new_node
        pointer_assignments += 1
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Reached tail Node({curr.value}). Assigned curr->next = temp ➔ Node({value}). Appending complete!",
            nodes=self._snapshot(active_id=new_node.id),
            head_id=self.head.id,
            active_node_id=new_node.id,
            c_line_number=15,
            c_line_explanation="curr->next = temp; // Connecting the former tail to the new node",
            log_type="success",
            traversals=traversals,
            comparisons=comparisons,
            pointer_assignments=pointer_assignments
        ))

        return {
            "operation": "Insert at End",
            "steps": [s.to_dict() for s in steps],
            "c_code": C_CODE_SNIPPETS["insert_end"],
            "c_struct": C_STRUCT_DEFINITION,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": traversals,
                "pointer_assignments": pointer_assignments,
                "total_nodes": self.get_length()
            }
        }

    def insert_at_position(self, value: int, position: int) -> Dict[str, Any]:
        self.operation_count += 1
        length = self.get_length()

        if position < 0 or position > length:
            return {
                "error": True,
                "message": f"Position {position} is out of bounds (Valid indices: 0 to {length}).",
                "steps": []
            }

        if position == 0:
            return self.insert_beginning(value)

        steps: List[ExecutionStep] = []
        step_idx = 1
        traversals = 0
        comparisons = 0
        pointer_assignments = 0

        # C Line 8: temp = (NODE)malloc(sizeof(struct Node));
        new_node = Node(value)
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Allocated memory for Node({value}) to insert at position {position}.",
            nodes=self._snapshot(new_node=new_node),
            head_id=self.head.id,
            active_node_id=new_node.id,
            c_line_number=8,
            c_line_explanation="temp = (NODE)malloc(sizeof(struct Node)); // Allocating new node",
            log_type="info"
        ))
        step_idx += 1

        # C Line 10: curr = start;
        curr = self.head
        pointer_assignments += 1
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Set curr = start at Node({curr.value}) to find insertion point (pos - 1 = {position - 1}).",
            nodes=self._snapshot(active_id=curr.id, new_node=new_node),
            head_id=self.head.id,
            active_node_id=curr.id,
            c_line_number=10,
            c_line_explanation="curr = start; // Setting up traversal pointer",
            log_type="traverse",
            pointer_assignments=pointer_assignments
        ))
        step_idx += 1

        # C Line 11: for (i = 0; i < pos - 1 && curr != NULL; i++)
        for p in range(position - 1):
            curr = curr.next
            traversals += 1
            comparisons += 1
            pointer_assignments += 1
            steps.append(ExecutionStep(
                step_number=step_idx,
                description=f"Loop index i={p}: Advanced curr ➔ Node({curr.value}).",
                nodes=self._snapshot(active_id=curr.id, new_node=new_node),
                head_id=self.head.id,
                active_node_id=curr.id,
                c_line_number=12,
                c_line_explanation="curr = curr->next; // Advancing forward by one position",
                log_type="traverse",
                traversals=traversals,
                comparisons=comparisons,
                pointer_assignments=pointer_assignments
            ))
            step_idx += 1

        # C Line 18: temp->next = curr->next;
        new_node.next = curr.next
        pointer_assignments += 1
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Assigned temp->next = curr->next (Pointing to {'Node(' + str(curr.next.value) + ')' if curr.next else 'NULL'}).",
            nodes=self._snapshot(active_id=new_node.id, new_node=new_node),
            head_id=self.head.id,
            active_node_id=new_node.id,
            c_line_number=18,
            c_line_explanation="temp->next = curr->next; // Linking new node forward to succeeding node",
            log_type="pointer",
            traversals=traversals,
            comparisons=comparisons,
            pointer_assignments=pointer_assignments
        ))
        step_idx += 1

        # C Line 19: curr->next = temp;
        curr.next = new_node
        pointer_assignments += 1
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Assigned curr->next = temp (Node({curr.value}) ➔ Node({value})). Insertion complete!",
            nodes=self._snapshot(active_id=new_node.id),
            head_id=self.head.id,
            active_node_id=new_node.id,
            c_line_number=19,
            c_line_explanation="curr->next = temp; // Splicing new node into the list chain",
            log_type="success",
            traversals=traversals,
            comparisons=comparisons,
            pointer_assignments=pointer_assignments
        ))

        return {
            "operation": f"Insert at Position {position}",
            "steps": [s.to_dict() for s in steps],
            "c_code": C_CODE_SNIPPETS["insert_position"],
            "c_struct": C_STRUCT_DEFINITION,
            "complexity": {
                "time_best": "O(1) [pos=0]",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": traversals,
                "pointer_assignments": pointer_assignments,
                "total_nodes": self.get_length()
            }
        }

    # -------------------------------------------------------------------
    # B. DELETION OPERATIONS
    # -------------------------------------------------------------------

    def delete_beginning(self) -> Dict[str, Any]:
        self.operation_count += 1
        if not self.head:
            return {
                "error": True,
                "message": "Cannot delete from an empty list (Underflow).",
                "steps": []
            }

        steps: List[ExecutionStep] = []
        step_idx = 1
        deleted_node = self.head

        # C Line 8: temp = start;
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Identified target for deletion: temp = start (Node({deleted_node.value})).",
            nodes=self._snapshot(active_id=deleted_node.id, deleted_id=deleted_node.id),
            head_id=self.head.id,
            active_node_id=deleted_node.id,
            c_line_number=8,
            c_line_explanation="temp = start; // Storing reference to first node before moving head",
            log_type="info",
            pointer_assignments=1
        ))
        step_idx += 1

        # C Line 9: start = start->next;
        self.head = self.head.next
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Updated start = start->next (New HEAD is {'Node(' + str(self.head.value) + ')' if self.head else 'NULL'}).",
            nodes=self._snapshot(active_id=self.head.id if self.head else None),
            head_id=self.head.id if self.head else None,
            active_node_id=self.head.id if self.head else None,
            c_line_number=9,
            c_line_explanation="start = start->next; // Advancing head pointer to bypass first node",
            log_type="pointer",
            pointer_assignments=2
        ))
        step_idx += 1

        # C Line 11: free(temp);
        deleted_node.next = None
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Called free(temp). Released Node({deleted_node.value}) from heap memory.",
            nodes=self._snapshot(),
            head_id=self.head.id if self.head else None,
            c_line_number=11,
            c_line_explanation="free(temp); // Deallocating heap memory occupied by deleted node",
            log_type="success",
            pointer_assignments=2
        ))

        return {
            "operation": "Delete from Beginning",
            "steps": [s.to_dict() for s in steps],
            "c_code": C_CODE_SNIPPETS["delete_beginning"],
            "c_struct": C_STRUCT_DEFINITION,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(1)",
                "time_worst": "O(1)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": 1,
                "traversals": 0,
                "pointer_assignments": 2,
                "total_nodes": self.get_length()
            }
        }

    def delete_end(self) -> Dict[str, Any]:
        self.operation_count += 1
        if not self.head:
            return {
                "error": True,
                "message": "Cannot delete from an empty list (Underflow).",
                "steps": []
            }

        if not self.head.next:
            return self.delete_beginning()

        steps: List[ExecutionStep] = []
        step_idx = 1
        traversals = 0
        comparisons = 2
        pointer_assignments = 0

        # C Line 10: curr = start;
        curr = self.head
        pointer_assignments += 1
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Initialized curr = start at HEAD Node({curr.value}) to find penultimate node.",
            nodes=self._snapshot(active_id=curr.id),
            head_id=self.head.id,
            active_node_id=curr.id,
            c_line_number=10,
            c_line_explanation="curr = start; // Setting traversal pointer",
            log_type="traverse",
            pointer_assignments=pointer_assignments
        ))
        step_idx += 1

        # C Line 11-14: while (curr->next != NULL) { prev = curr; curr = curr->next; }
        prev = None
        while curr.next:
            prev = curr
            curr = curr.next
            traversals += 1
            comparisons += 1
            pointer_assignments += 2
            steps.append(ExecutionStep(
                step_number=step_idx,
                description=f"Traversed: prev ➔ Node({prev.value}), curr ➔ Node({curr.value}).",
                nodes=self._snapshot(active_id=curr.id),
                head_id=self.head.id,
                active_node_id=curr.id,
                c_line_number=13,
                c_line_explanation="curr = curr->next; // Traversal step preserving predecessor pointer",
                log_type="traverse",
                traversals=traversals,
                comparisons=comparisons,
                pointer_assignments=pointer_assignments
            ))
            step_idx += 1

        # C Line 15: prev->next = NULL;
        tail_val = curr.value
        prev.next = None
        pointer_assignments += 1
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Reached tail. Set prev->next = NULL on Node({prev.value}) to detach tail.",
            nodes=self._snapshot(active_id=prev.id),
            head_id=self.head.id,
            active_node_id=prev.id,
            c_line_number=15,
            c_line_explanation="prev->next = NULL; // Severing link to terminal tail node",
            log_type="pointer",
            traversals=traversals,
            comparisons=comparisons,
            pointer_assignments=pointer_assignments
        ))
        step_idx += 1

        # C Line 16: free(curr);
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Called free(curr). Deallocated tail Node({tail_val}) from memory. Tail deleted!",
            nodes=self._snapshot(),
            head_id=self.head.id,
            c_line_number=16,
            c_line_explanation="free(curr); // Freeing memory of deleted tail",
            log_type="success",
            traversals=traversals,
            comparisons=comparisons,
            pointer_assignments=pointer_assignments
        ))

        return {
            "operation": "Delete from End",
            "steps": [s.to_dict() for s in steps],
            "c_code": C_CODE_SNIPPETS["delete_end"],
            "c_struct": C_STRUCT_DEFINITION,
            "complexity": {
                "time_best": "O(1) [1 node]",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": traversals,
                "pointer_assignments": pointer_assignments,
                "total_nodes": self.get_length()
            }
        }

    def delete_at_position(self, position: int) -> Dict[str, Any]:
        self.operation_count += 1
        length = self.get_length()

        if position < 0 or position >= length:
            return {
                "error": True,
                "message": f"Position {position} is out of bounds (Valid indices: 0 to {length - 1}).",
                "steps": []
            }

        if position == 0:
            return self.delete_beginning()

        steps: List[ExecutionStep] = []
        step_idx = 1
        traversals = 0
        comparisons = 0
        pointer_assignments = 0

        # C Line 7: curr = start;
        curr = self.head
        pointer_assignments += 1
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Set curr = start at HEAD Node({curr.value}) to find predecessor (index {position - 1}).",
            nodes=self._snapshot(active_id=curr.id),
            head_id=self.head.id,
            active_node_id=curr.id,
            c_line_number=7,
            c_line_explanation="curr = start; // Preparing traversal pointer",
            log_type="traverse",
            pointer_assignments=pointer_assignments
        ))
        step_idx += 1

        for p in range(position - 1):
            curr = curr.next
            traversals += 1
            comparisons += 1
            pointer_assignments += 1
            steps.append(ExecutionStep(
                step_number=step_idx,
                description=f"Traversed to index [{p + 1}]: Node({curr.value}).",
                nodes=self._snapshot(active_id=curr.id),
                head_id=self.head.id,
                active_node_id=curr.id,
                c_line_number=9,
                c_line_explanation="curr = curr->next; // Advancing to preceding node",
                log_type="traverse",
                traversals=traversals,
                comparisons=comparisons,
                pointer_assignments=pointer_assignments
            ))
            step_idx += 1

        # C Line 12: temp = curr->next;
        target_node = curr.next
        pointer_assignments += 1
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Identified target node for deletion at index [{position}]: temp = Node({target_node.value}).",
            nodes=self._snapshot(active_id=target_node.id, deleted_id=target_node.id),
            head_id=self.head.id,
            active_node_id=target_node.id,
            c_line_number=12,
            c_line_explanation="temp = curr->next; // Preserving reference to the node to delete",
            log_type="info",
            traversals=traversals,
            comparisons=comparisons,
            pointer_assignments=pointer_assignments
        ))
        step_idx += 1

        # C Line 13: curr->next = temp->next;
        curr.next = target_node.next
        pointer_assignments += 1
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Assigned curr->next = temp->next. Bypassed Node({target_node.value}).",
            nodes=self._snapshot(active_id=curr.id),
            head_id=self.head.id,
            active_node_id=curr.id,
            c_line_number=13,
            c_line_explanation="curr->next = temp->next; // Linking previous node over the deleted node",
            log_type="pointer",
            traversals=traversals,
            comparisons=comparisons,
            pointer_assignments=pointer_assignments
        ))
        step_idx += 1

        # C Line 14: free(temp);
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Called free(temp). Released Node({target_node.value}) from memory. Deletion complete!",
            nodes=self._snapshot(),
            head_id=self.head.id,
            c_line_number=14,
            c_line_explanation="free(temp); // Deallocating memory",
            log_type="success",
            traversals=traversals,
            comparisons=comparisons,
            pointer_assignments=pointer_assignments
        ))

        return {
            "operation": f"Delete at Position {position}",
            "steps": [s.to_dict() for s in steps],
            "c_code": C_CODE_SNIPPETS["delete_position"],
            "c_struct": C_STRUCT_DEFINITION,
            "complexity": {
                "time_best": "O(1) [pos=0]",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": traversals,
                "pointer_assignments": pointer_assignments,
                "total_nodes": self.get_length()
            }
        }

    def delete_by_value(self, target_value: int) -> Dict[str, Any]:
        """Deletes the first node containing target_value."""
        self.operation_count += 1
        if not self.head:
            return {
                "error": True,
                "message": "Cannot delete from an empty list.",
                "steps": []
            }

        steps: List[ExecutionStep] = []
        step_idx = 1
        traversals = 0
        comparisons = 0
        pointer_assignments = 0

        # C Line 5: if (start->data == val)
        comparisons += 1
        if self.head.value == target_value:
            deleted = self.head
            self.head = self.head.next
            pointer_assignments += 2
            steps.append(ExecutionStep(
                step_number=step_idx,
                description=f"HEAD contains target value {target_value}! Advanced start = start->next and freed old head.",
                nodes=self._snapshot(),
                head_id=self.head.id if self.head else None,
                c_line_number=7,
                c_line_explanation="start = start->next; free(temp); // Deleting matching head node",
                log_type="success",
                comparisons=comparisons,
                pointer_assignments=pointer_assignments
            ))
            return {
                "operation": f"Delete by Value ({target_value})",
                "steps": [s.to_dict() for s in steps],
                "c_code": C_CODE_SNIPPETS["delete_value"],
                "c_struct": C_STRUCT_DEFINITION,
                "complexity": {
                    "time_best": "O(1)",
                    "time_avg": "O(n)",
                    "time_worst": "O(n)",
                    "space_auxiliary": "O(1)"
                },
                "metrics": {
                    "comparisons": comparisons,
                    "traversals": 0,
                    "pointer_assignments": pointer_assignments,
                    "total_nodes": self.get_length()
                }
            }

        # C Line 11: curr = start;
        curr = self.head
        prev = None
        pointer_assignments += 1
        found = False

        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Starting linear search to locate node with value {target_value}.",
            nodes=self._snapshot(active_id=curr.id),
            head_id=self.head.id,
            active_node_id=curr.id,
            c_line_number=11,
            c_line_explanation="curr = start; // Initializing search pointer",
            log_type="traverse",
            pointer_assignments=pointer_assignments
        ))
        step_idx += 1

        while curr and curr.value != target_value:
            comparisons += 1
            prev = curr
            curr = curr.next
            traversals += 1
            pointer_assignments += 2
            steps.append(ExecutionStep(
                step_number=step_idx,
                description=f"Checking Node({prev.value}): value != {target_value}. Advanced to {'Node(' + str(curr.value) + ')' if curr else 'NULL'}.",
                nodes=self._snapshot(active_id=curr.id if curr else None),
                head_id=self.head.id,
                active_node_id=curr.id if curr else None,
                c_line_number=14,
                c_line_explanation="prev = curr; curr = curr->next; // Advancing forward",
                log_type="traverse",
                traversals=traversals,
                comparisons=comparisons,
                pointer_assignments=pointer_assignments
            ))
            step_idx += 1

        if not curr:
            steps.append(ExecutionStep(
                step_number=step_idx,
                description=f"Reached NULL. Value {target_value} was not found in the list.",
                nodes=self._snapshot(),
                head_id=self.head.id,
                c_line_number=16,
                c_line_explanation="if (curr == NULL) return start; // Target not found",
                log_type="error",
                traversals=traversals,
                comparisons=comparisons,
                pointer_assignments=pointer_assignments
            ))
        else:
            prev.next = curr.next
            pointer_assignments += 1
            steps.append(ExecutionStep(
                step_number=step_idx,
                description=f"Found match Node({target_value})! Executed prev->next = curr->next and free(curr). Node deleted!",
                nodes=self._snapshot(),
                head_id=self.head.id,
                c_line_number=18,
                c_line_explanation="prev->next = curr->next; free(curr); // Bypassing and freeing node",
                log_type="success",
                traversals=traversals,
                comparisons=comparisons,
                pointer_assignments=pointer_assignments
            ))

        return {
            "operation": f"Delete by Value ({target_value})",
            "steps": [s.to_dict() for s in steps],
            "c_code": C_CODE_SNIPPETS["delete_value"],
            "c_struct": C_STRUCT_DEFINITION,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": traversals,
                "pointer_assignments": pointer_assignments,
                "total_nodes": self.get_length()
            }
        }

    # -------------------------------------------------------------------
    # C. SEARCH OPERATION
    # -------------------------------------------------------------------

    def search(self, target: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps: List[ExecutionStep] = []
        step_idx = 1
        traversals = 0
        comparisons = 0

        # C Line 3: NODE curr = start;
        curr = self.head
        index = 0

        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Initialized curr = start at HEAD to search for key = {target}.",
            nodes=self._snapshot(active_id=curr.id if curr else None),
            head_id=self.head.id if self.head else None,
            active_node_id=curr.id if curr else None,
            c_line_number=3,
            c_line_explanation="NODE curr = start; // Setting traversal pointer to head",
            log_type="info",
            pointer_assignments=1
        ))
        step_idx += 1

        found = False
        while curr:
            comparisons += 1
            steps.append(ExecutionStep(
                step_number=step_idx,
                description=f"Comparing index [{index}]: curr->data ({curr.value}) == {target}?",
                nodes=self._snapshot(active_id=curr.id),
                head_id=self.head.id,
                active_node_id=curr.id,
                c_line_number=6,
                c_line_explanation=f"if (curr->data == key) // Testing if {curr.value} == {target}",
                log_type="traverse",
                traversals=traversals,
                comparisons=comparisons
            ))
            step_idx += 1

            if curr.value == target:
                found = True
                steps.append(ExecutionStep(
                    step_number=step_idx,
                    description=f"🎯 MATCH FOUND! Key {target} is present at index [{index}]. Comparisons: {comparisons}.",
                    nodes=self._snapshot(active_id=curr.id, target_id=curr.id),
                    head_id=self.head.id,
                    active_node_id=curr.id,
                    c_line_number=7,
                    c_line_explanation=f"return index; // Successfully matched target at index {index}",
                    log_type="success",
                    traversals=traversals,
                    comparisons=comparisons
                ))
                break

            curr = curr.next
            index += 1
            traversals += 1

        if not found:
            steps.append(ExecutionStep(
                step_number=step_idx,
                description=f"Reached NULL. Key {target} was not found after {comparisons} comparisons.",
                nodes=self._snapshot(),
                head_id=self.head.id if self.head else None,
                c_line_number=12,
                c_line_explanation="return -1; // Sentinel value indicating element not present",
                log_type="error",
                traversals=traversals,
                comparisons=comparisons
            ))

        return {
            "operation": f"Search Element ({target})",
            "steps": [s.to_dict() for s in steps],
            "c_code": C_CODE_SNIPPETS["search"],
            "c_struct": C_STRUCT_DEFINITION,
            "complexity": {
                "time_best": "O(1) [At head]",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": traversals,
                "pointer_assignments": 1,
                "total_nodes": self.get_length()
            }
        }

    # -------------------------------------------------------------------
    # D. REVERSE OPERATION
    # -------------------------------------------------------------------

    def reverse(self) -> Dict[str, Any]:
        self.operation_count += 1
        steps: List[ExecutionStep] = []
        step_idx = 1
        traversals = 0
        pointer_assignments = 0

        # C Line 3-5: NODE prev = NULL; NODE curr = start; NODE next = NULL;
        prev = None
        curr = self.head
        pointer_assignments += 2

        steps.append(ExecutionStep(
            step_number=step_idx,
            description="Initialized pointers for in-place reversal: prev = NULL, curr = start, next = NULL.",
            nodes=self._snapshot(active_id=curr.id if curr else None),
            head_id=self.head.id if self.head else None,
            active_node_id=curr.id if curr else None,
            c_line_number=4,
            c_line_explanation="NODE prev = NULL; NODE curr = start; // Pointers for three-way sliding window",
            log_type="info",
            pointer_assignments=pointer_assignments
        ))
        step_idx += 1

        while curr:
            # C Line 7: next = curr->next;
            next_temp = curr.next
            pointer_assignments += 1
            steps.append(ExecutionStep(
                step_number=step_idx,
                description=f"Cached next pointer: next = curr->next (Pointing to {'Node(' + str(next_temp.value) + ')' if next_temp else 'NULL'}).",
                nodes=self._snapshot(active_id=curr.id),
                head_id=self.head.id,
                active_node_id=curr.id,
                c_line_number=7,
                c_line_explanation="next = curr->next; // Storing rest of list before reversing current link",
                log_type="pointer",
                traversals=traversals,
                pointer_assignments=pointer_assignments
            ))
            step_idx += 1

            # C Line 8: curr->next = prev;
            curr.next = prev
            pointer_assignments += 1
            steps.append(ExecutionStep(
                step_number=step_idx,
                description=f"Reversed link: curr->next = prev (Node({curr.value}) now points back to {'Node(' + str(prev.value) + ')' if prev else 'NULL'}).",
                nodes=self._snapshot(active_id=curr.id),
                head_id=self.head.id,
                active_node_id=curr.id,
                c_line_number=8,
                c_line_explanation="curr->next = prev; // Reversing the directional link in-place",
                log_type="pointer",
                traversals=traversals,
                pointer_assignments=pointer_assignments
            ))
            step_idx += 1

            # C Line 9-10: prev = curr; curr = next;
            prev = curr
            curr = next_temp
            traversals += 1
            pointer_assignments += 2
            steps.append(ExecutionStep(
                step_number=step_idx,
                description=f"Slid window forward: prev ➔ Node({prev.value}), curr ➔ {'Node(' + str(curr.value) + ')' if curr else 'NULL'}.",
                nodes=self._snapshot(active_id=curr.id if curr else prev.id),
                head_id=self.head.id,
                active_node_id=curr.id if curr else prev.id,
                c_line_number=10,
                c_line_explanation="prev = curr; curr = next; // Moving sliding window pointers forward",
                log_type="traverse",
                traversals=traversals,
                pointer_assignments=pointer_assignments
            ))
            step_idx += 1

        # C Line 12: start = prev;
        self.head = prev
        pointer_assignments += 1
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Finished traversal. Assigned start = prev. New HEAD is Node({self.head.value}). Reversal complete!",
            nodes=self._snapshot(active_id=self.head.id),
            head_id=self.head.id,
            active_node_id=self.head.id,
            c_line_number=12,
            c_line_explanation="start = prev; // Updating head pointer to the new first node (formerly tail)",
            log_type="success",
            traversals=traversals,
            pointer_assignments=pointer_assignments
        ))

        return {
            "operation": "Reverse Linked List",
            "steps": [s.to_dict() for s in steps],
            "c_code": C_CODE_SNIPPETS["reverse"],
            "c_struct": C_STRUCT_DEFINITION,
            "complexity": {
                "time_best": "O(n)",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": traversals,
                "traversals": traversals,
                "pointer_assignments": pointer_assignments,
                "total_nodes": self.get_length()
            }
        }

    # -------------------------------------------------------------------
    # E. ADVANCED OPERATIONS (Find Middle, Detect Cycle, Count)
    # -------------------------------------------------------------------

    def find_middle(self) -> Dict[str, Any]:
        """Finds middle element using Tortoise & Hare (Slow/Fast pointer)."""
        self.operation_count += 1
        if not self.head:
            return {"error": True, "message": "List is empty.", "steps": []}

        steps: List[ExecutionStep] = []
        step_idx = 1
        slow = self.head
        fast = self.head
        traversals = 0
        comparisons = 0

        # C Line 3-4: NODE slow = start; NODE fast = start;
        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"Initialized SLOW (Tortoise 🐢) and FAST (Hare 🐇) at start: Node({self.head.value}).",
            nodes=self._snapshot(slow_id=slow.id, fast_id=fast.id),
            head_id=self.head.id,
            c_line_number=4,
            c_line_explanation="NODE slow = start; NODE fast = start; // Two-pointer technique initialization",
            log_type="info"
        ))
        step_idx += 1

        iteration = 1
        while fast and fast.next:
            comparisons += 2
            slow = slow.next
            fast = fast.next.next
            traversals += 3

            steps.append(ExecutionStep(
                step_number=step_idx,
                description=f"Round {iteration}: SLOW moved 1 step ➔ Node({slow.value}). FAST moved 2 steps ➔ {'Node(' + str(fast.value) + ')' if fast else 'NULL'}.",
                nodes=self._snapshot(slow_id=slow.id, fast_id=fast.id if fast else None),
                head_id=self.head.id,
                c_line_number=6,
                c_line_explanation="slow = slow->next; fast = fast->next->next; // Advancing at 1x and 2x speeds",
                log_type="traverse",
                traversals=traversals,
                comparisons=comparisons
            ))
            step_idx += 1
            iteration += 1

        steps.append(ExecutionStep(
            step_number=step_idx,
            description=f"🎯 Middle Node Found: Node({slow.value})! (When FAST reached end, SLOW is exactly in the middle).",
            nodes=self._snapshot(active_id=slow.id, target_id=slow.id),
            head_id=self.head.id,
            active_node_id=slow.id,
            c_line_number=9,
            c_line_explanation="return slow; // Points to the middle element of the linked list",
            log_type="success",
            traversals=traversals,
            comparisons=comparisons
        ))

        return {
            "operation": "Find Middle Node",
            "steps": [s.to_dict() for s in steps],
            "c_code": C_CODE_SNIPPETS["find_middle"],
            "c_struct": C_STRUCT_DEFINITION,
            "complexity": {
                "time_best": "O(n/2) = O(n)",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": traversals,
                "pointer_assignments": 2,
                "total_nodes": self.get_length()
            }
        }

    def detect_cycle(self) -> Dict[str, Any]:
        """Floyd's Cycle-Finding Algorithm."""
        self.operation_count += 1
        if not self.head:
            return {"error": True, "message": "List is empty.", "steps": []}

        steps: List[ExecutionStep] = []
        step_idx = 1
        slow = self.head
        fast = self.head
        traversals = 0
        comparisons = 0

        steps.append(ExecutionStep(
            step_number=step_idx,
            description="Initialized Floyd's Cycle Detection. slow = start, fast = start.",
            nodes=self._snapshot(slow_id=slow.id, fast_id=fast.id),
            head_id=self.head.id,
            c_line_number=4,
            c_line_explanation="NODE slow = start; NODE fast = start; // Cycle detection pointers",
            log_type="info"
        ))
        step_idx += 1

        cycle_found = False
        iteration = 1
        while fast and fast.next:
            comparisons += 2
            slow = slow.next
            fast = fast.next.next
            traversals += 3

            steps.append(ExecutionStep(
                step_number=step_idx,
                description=f"Step {iteration}: slow ➔ Node({slow.value}), fast ➔ {'Node(' + str(fast.value) + ')' if fast else 'NULL'}.",
                nodes=self._snapshot(slow_id=slow.id, fast_id=fast.id if fast else None),
                head_id=self.head.id,
                c_line_number=7,
                c_line_explanation="slow = slow->next; fast = fast->next->next;",
                log_type="traverse",
                traversals=traversals,
                comparisons=comparisons
            ))
            step_idx += 1
            iteration += 1

            if slow == fast:
                cycle_found = True
                steps.append(ExecutionStep(
                    step_number=step_idx,
                    description=f"🎯 Cycle detected! slow and fast met at Node({slow.value}).",
                    nodes=self._snapshot(active_id=slow.id),
                    head_id=self.head.id,
                    c_line_number=9,
                    c_line_explanation="if (slow == fast) return 1; // Cycle confirmed",
                    log_type="success",
                    traversals=traversals,
                    comparisons=comparisons
                ))
                break

        if not cycle_found:
            steps.append(ExecutionStep(
                step_number=step_idx,
                description="Fast pointer reached NULL. Verified: No cycle exists in this Singly Linked List (Acyclic).",
                nodes=self._snapshot(),
                head_id=self.head.id,
                c_line_number=13,
                c_line_explanation="return 0; // Acyclic list confirmed",
                log_type="success",
                traversals=traversals,
                comparisons=comparisons
            ))

        return {
            "operation": "Detect Cycle (Floyd's Algorithm)",
            "steps": [s.to_dict() for s in steps],
            "c_code": C_CODE_SNIPPETS["detect_cycle"],
            "c_struct": C_STRUCT_DEFINITION,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": traversals,
                "pointer_assignments": 2,
                "total_nodes": self.get_length()
            }
        }

    def clear(self) -> Dict[str, Any]:
        self.operation_count += 1
        self.head = None
        return {
            "operation": "Clear Linked List",
            "steps": [{
                "step_number": 1,
                "description": "Cleared all nodes. Set start = NULL.",
                "nodes": [],
                "head_id": None,
                "c_line_number": 1,
                "c_line_explanation": "start = NULL; // Head set to null, memory marked for reclaim",
                "log_type": "warning",
                "pointers_traversed": 0,
                "comparisons": 0,
                "pointer_assignments": 1
            }],
            "c_code": "NODE clear_list(NODE start) {\n    NODE curr = start, next;\n    while (curr != NULL) {\n        next = curr->next;\n        free(curr);\n        curr = next;\n    }\n    return NULL;\n}",
            "c_struct": C_STRUCT_DEFINITION,
            "complexity": {
                "time_best": "O(n)",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": 0,
                "traversals": 0,
                "pointer_assignments": 1,
                "total_nodes": 0
            }
        }

    def reset_default(self) -> Dict[str, Any]:
        self.head = None
        for val in [10, 20, 30, 40]:
            self._raw_append(val)
        return {
            "operation": "Reset to Default",
            "steps": [{
                "step_number": 1,
                "description": "Reset list to demonstration state: [10] ➔ [20] ➔ [30] ➔ [40] ➔ NULL.",
                "nodes": self._snapshot(active_id=self.head.id),
                "head_id": self.head.id,
                "c_line_number": 1,
                "c_line_explanation": "// Demonstrator setup: 10 -> 20 -> 30 -> 40 -> NULL",
                "log_type": "info",
                "pointers_traversed": 0,
                "comparisons": 0,
                "pointer_assignments": 0
            }],
            "c_code": C_CODE_SNIPPETS["insert_end"],
            "c_struct": C_STRUCT_DEFINITION,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(1)",
                "time_worst": "O(1)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": 0,
                "traversals": 0,
                "pointer_assignments": 0,
                "total_nodes": 4
            }
        }

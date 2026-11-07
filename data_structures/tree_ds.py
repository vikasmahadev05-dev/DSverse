"""
DSVERSE - Tree & Binary Heap Data Structures & Execution Engine.
Academic execution engine supporting Binary Search Trees (BST), Tree Traversals,
and Binary Min/Max Heaps with dual (Tree + Array) views and synchronized ANSI C line mapping.
"""

import uuid
from typing import List, Dict, Any, Optional

C_BST_STRUCT = """struct TreeNode {
    int data;
    struct TreeNode* left;
    struct TreeNode* right;
};
typedef struct TreeNode* BST_NODE;"""

C_BST_SNIPPETS = {
    "insert": (
        "BST_NODE insert_bst(BST_NODE root, int val) {\n"
        "    if (root == NULL) {\n"
        "        BST_NODE temp = (BST_NODE)malloc(sizeof(struct TreeNode));\n"
        "        temp->data = val;\n"
        "        temp->left = temp->right = NULL;\n"
        "        return temp;\n"
        "    }\n"
        "    if (val < root->data) {\n"
        "        root->left = insert_bst(root->left, val);\n"
        "    } else if (val > root->data) {\n"
        "        root->right = insert_bst(root->right, val);\n"
        "    }\n"
        "    return root;\n"
        "}"
    ),
    "search": (
        "BST_NODE search_bst(BST_NODE root, int key) {\n"
        "    if (root == NULL || root->data == key) return root;\n"
        "    if (key < root->data) {\n"
        "        return search_bst(root->left, key);\n"
        "    } else {\n"
        "        return search_bst(root->right, key);\n"
        "    }\n"
        "}"
    ),
    "inorder": (
        "void inorder(BST_NODE root) {\n"
        "    if (root != NULL) {\n"
        "        inorder(root->left);\n"
        "        printf(\"%d \", root->data);\n"
        "        inorder(root->right);\n"
        "    }\n"
        "}"
    ),
    "delete": (
        "BST_NODE find_min(BST_NODE root) {\n"
        "    while (root->left != NULL) root = root->left;\n"
        "    return root;\n"
        "}\n\n"
        "BST_NODE delete_bst(BST_NODE root, int key) {\n"
        "    if (root == NULL) return NULL;\n"
        "    if (key < root->data) root->left = delete_bst(root->left, key);\n"
        "    else if (key > root->data) root->right = delete_bst(root->right, key);\n"
        "    else {\n"
        "        if (root->left == NULL) { BST_NODE t = root->right; free(root); return t; }\n"
        "        else if (root->right == NULL) { BST_NODE t = root->left; free(root); return t; }\n"
        "        BST_NODE temp = find_min(root->right);\n"
        "        root->data = temp->data;\n"
        "        root->right = delete_bst(root->right, temp->data);\n"
        "    }\n"
        "    return root;\n"
        "}"
    )
}

C_HEAP_STRUCT = """#define MAX_HEAP_SIZE 15

typedef struct {
    int data[MAX_HEAP_SIZE];
    int size;
    int is_min_heap; // 1 for Min-Heap, 0 for Max-Heap
} BinaryHeap;"""

C_HEAP_SNIPPETS = {
    "insert_heap": (
        "void insert_heap(BinaryHeap *h, int val) {\n"
        "    if (h->size >= MAX_HEAP_SIZE) return;\n"
        "    int i = h->size;\n"
        "    h->data[i] = val;\n"
        "    h->size++;\n"
        "    while (i != 0 && h->data[(i - 1) / 2] > h->data[i]) {\n"
        "        int temp = h->data[i];\n"
        "        h->data[i] = h->data[(i - 1) / 2];\n"
        "        h->data[(i - 1) / 2] = temp;\n"
        "        i = (i - 1) / 2; // Bubble up\n"
        "    }\n"
        "}"
    ),
    "extract_min": (
        "int extract_min(BinaryHeap *h) {\n"
        "    if (h->size <= 0) return -1;\n"
        "    int root = h->data[0];\n"
        "    h->data[0] = h->data[h->size - 1];\n"
        "    h->size--;\n"
        "    heapify(h, 0); // Sift down\n"
        "    return root;\n"
        "}"
    )
}


class TreeNode:
    def __init__(self, value: int, node_id: Optional[str] = None):
        self.value: int = value
        self.left: Optional['TreeNode'] = None
        self.right: Optional['TreeNode'] = None
        self.id: str = node_id or f"node-{uuid.uuid4().hex[:6]}"
        self.x: float = 0.0
        self.y: float = 0.0

    def to_dict(
        self,
        active_id: Optional[str] = None,
        comparing_id: Optional[str] = None,
        visited_ids: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        visited = visited_ids or []
        return {
            "id": self.id,
            "value": self.value,
            "left_id": self.left.id if self.left else None,
            "right_id": self.right.id if self.right else None,
            "x": self.x,
            "y": self.y,
            "is_active": self.id == active_id,
            "is_comparing": self.id == comparing_id,
            "is_visited": self.id in visited
        }


class BST:
    """Academic Binary Search Tree with 2D coordinate calculation and C line tracking."""

    def __init__(self, initial_values: Optional[List[int]] = None):
        self.root: Optional[TreeNode] = None
        vals = initial_values if initial_values is not None else [50, 30, 70, 20, 40, 60, 80]
        for v in vals:
            self._insert_raw(v)
        self._recompute_coordinates()
        self.operation_count = 0

    def _insert_raw(self, value: int):
        def _ins(curr: Optional[TreeNode], val: int) -> TreeNode:
            if not curr:
                return TreeNode(val)
            if val < curr.value:
                curr.left = _ins(curr.left, val)
            elif val > curr.value:
                curr.right = _ins(curr.right, val)
            return curr
        self.root = _ins(self.root, value)

    def _recompute_coordinates(self):
        """Calculates normalized (x, y) coordinates for responsive canvas rendering."""
        if not self.root:
            return

        def _assign_coords(node: Optional[TreeNode], depth: int, left: float, right: float):
            if not node:
                return
            node.x = (left + right) / 2.0
            node.y = depth * 70.0 + 40.0
            _assign_coords(node.left, depth + 1, left, node.x)
            _assign_coords(node.right, depth + 1, node.x, right)

        _assign_coords(self.root, 0, 20.0, 780.0)

    def _snapshot(
        self,
        active_id: Optional[str] = None,
        comparing_id: Optional[str] = None,
        visited_ids: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        self._recompute_coordinates()
        nodes_list = []

        def _collect(curr: Optional[TreeNode]):
            if not curr:
                return
            nodes_list.append(curr.to_dict(active_id, comparing_id, visited_ids))
            _collect(curr.left)
            _collect(curr.right)

        _collect(self.root)
        return nodes_list

    def get_state(self) -> Dict[str, Any]:
        return {
            "nodes": self._snapshot(),
            "root_id": self.root.id if self.root else None,
            "total_nodes": len(self._snapshot()),
            "c_struct": C_BST_STRUCT
        }

    def reset_default(self) -> Dict[str, Any]:
        self.root = None
        for v in [50, 30, 70, 20, 40, 60, 80]:
            self._insert_raw(v)
        self._recompute_coordinates()
        self.operation_count = 0
        return self.get_state()

    def insert(self, value: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_BST_SNIPPETS["insert"]
        comparisons = 0
        traversals = 0

        if not self.root:
            new_node = TreeNode(value)
            self.root = new_node
            self._recompute_coordinates()
            steps.append({
                "step_number": 1,
                "description": f"Root was NULL. Allocated new TreeNode with value {value} as tree root.",
                "nodes": self._snapshot(active_id=new_node.id),
                "c_line_number": 4,
                "c_line_explanation": "temp = (BST_NODE)malloc(sizeof(struct TreeNode)); Root initialized.",
                "log_type": "success",
                "comparisons": 0,
                "traversals": 1
            })
            return {
                "operation": f"Insert {value} into BST",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_BST_STRUCT,
                "metrics": {"comparisons": 0, "traversals": 1, "pointer_assignments": 1, "total_nodes": 1}
            }

        curr = self.root
        parent = None
        is_left_child = False

        steps.append({
            "step_number": 1,
            "description": f"Starting BST insertion for value {value} beginning at root (value {curr.value}).",
            "nodes": self._snapshot(active_id=curr.id),
            "c_line_number": 2,
            "c_line_explanation": "Comparing value against current node to decide left or right branch.",
            "log_type": "info",
            "comparisons": 0,
            "traversals": 1
        })

        while curr:
            comparisons += 1
            traversals += 1
            parent = curr
            if value == curr.value:
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"Value {value} already exists in BST at node {curr.id}. BSTs store distinct keys.",
                    "nodes": self._snapshot(active_id=curr.id),
                    "c_line_number": 12,
                    "c_line_explanation": "Key already exists. Duplicate ignored.",
                    "log_type": "warning",
                    "comparisons": comparisons,
                    "traversals": traversals
                })
                return {
                    "operation": f"Insert {value}",
                    "steps": steps,
                    "c_code": c_code,
                    "c_struct": C_BST_STRUCT,
                    "error": True,
                    "message": "Duplicate key: BST already contains this value."
                }
            elif value < curr.value:
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"Comparing: {value} < {curr.value}. Moving to left subtree.",
                    "nodes": self._snapshot(comparing_id=curr.id),
                    "c_line_number": 9,
                    "c_line_explanation": "val < root->data: Branching to root->left.",
                    "log_type": "traverse",
                    "comparisons": comparisons,
                    "traversals": traversals
                })
                curr = curr.left
                is_left_child = True
            else:
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"Comparing: {value} > {curr.value}. Moving to right subtree.",
                    "nodes": self._snapshot(comparing_id=curr.id),
                    "c_line_number": 11,
                    "c_line_explanation": "val > root->data: Branching to root->right.",
                    "log_type": "traverse",
                    "comparisons": comparisons,
                    "traversals": traversals
                })
                curr = curr.right
                is_left_child = False

        new_node = TreeNode(value)
        if is_left_child and parent:
            parent.left = new_node
        elif parent:
            parent.right = new_node

        self._recompute_coordinates()

        steps.append({
            "step_number": len(steps) + 1,
            "description": f"Reached NULL leaf pointer. Linked new node {value} to parent {parent.value}'s {'left' if is_left_child else 'right'} pointer.",
            "nodes": self._snapshot(active_id=new_node.id),
            "c_line_number": 5,
            "c_line_explanation": "Allocated and attached new TreeNode. Subtree returned to caller.",
            "log_type": "success",
            "comparisons": comparisons,
            "traversals": traversals
        })

        return {
            "operation": f"Insert {value} into BST",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_BST_STRUCT,
            "complexity": {
                "time_best": "O(log n)",
                "time_avg": "O(log n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": traversals,
                "pointer_assignments": 2,
                "total_nodes": len(self._snapshot())
            }
        }

    def search(self, key: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_BST_SNIPPETS["search"]
        curr = self.root
        comparisons = 0
        traversals = 0

        steps.append({
            "step_number": 1,
            "description": f"Initiating BST search for key {key} starting at root.",
            "nodes": self._snapshot(active_id=curr.id if curr else None),
            "c_line_number": 2,
            "c_line_explanation": "if (root == NULL || root->data == key) return root;",
            "log_type": "info",
            "comparisons": 0,
            "traversals": 0
        })

        found = False
        while curr:
            comparisons += 1
            traversals += 1
            if curr.value == key:
                found = True
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"Key {key} found at node {curr.id}!",
                    "nodes": self._snapshot(active_id=curr.id),
                    "c_line_number": 2,
                    "c_line_explanation": "root->data == key. Found match; returning node pointer.",
                    "log_type": "success",
                    "comparisons": comparisons,
                    "traversals": traversals
                })
                break
            elif key < curr.value:
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"Comparing: {key} < {curr.value}. Traversing down left branch.",
                    "nodes": self._snapshot(comparing_id=curr.id),
                    "c_line_number": 4,
                    "c_line_explanation": "key < root->data: Recursing down root->left.",
                    "log_type": "traverse",
                    "comparisons": comparisons,
                    "traversals": traversals
                })
                curr = curr.left
            else:
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"Comparing: {key} > {curr.value}. Traversing down right branch.",
                    "nodes": self._snapshot(comparing_id=curr.id),
                    "c_line_number": 6,
                    "c_line_explanation": "key > root->data: Recursing down root->right.",
                    "log_type": "traverse",
                    "comparisons": comparisons,
                    "traversals": traversals
                })
                curr = curr.right

        if not found:
            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Key {key} not found in BST (reached NULL leaf pointer).",
                "nodes": self._snapshot(),
                "c_line_number": 2,
                "c_line_explanation": "root == NULL. Key absent from tree.",
                "log_type": "warning",
                "comparisons": comparisons,
                "traversals": traversals
            })

        return {
            "operation": f"Search key {key} in BST",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_BST_STRUCT,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(log n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": traversals,
                "pointer_assignments": 0,
                "total_nodes": len(self._snapshot())
            }
        }

    def traverse(self, mode: str = "inorder") -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_BST_SNIPPETS.get("inorder", "")
        visited_nodes: List[TreeNode] = []

        if mode == "inorder":
            def _in(curr: Optional[TreeNode]):
                if not curr:
                    return
                _in(curr.left)
                visited_nodes.append(curr)
                _in(curr.right)
            _in(self.root)
        elif mode == "preorder":
            def _pre(curr: Optional[TreeNode]):
                if not curr:
                    return
                visited_nodes.append(curr)
                _pre(curr.left)
                _pre(curr.right)
            _pre(self.root)
        elif mode == "postorder":
            def _post(curr: Optional[TreeNode]):
                if not curr:
                    return
                _post(curr.left)
                _post(curr.right)
                visited_nodes.append(curr)
            _post(self.root)
        elif mode == "level_order":
            queue = [self.root] if self.root else []
            while queue:
                curr = queue.pop(0)
                visited_nodes.append(curr)
                if curr.left:
                    queue.append(curr.left)
                if curr.right:
                    queue.append(curr.right)

        visited_ids = []
        for i, node in enumerate(visited_nodes):
            visited_ids.append(node.id)
            steps.append({
                "step_number": i + 1,
                "description": f"{mode.upper()} Traversal Step {i + 1}: Visited node {node.value} (id {node.id}).",
                "nodes": self._snapshot(active_id=node.id, visited_ids=list(visited_ids)),
                "c_line_number": 4,
                "c_line_explanation": f"Processed node with data {node.value}.",
                "log_type": "traverse",
                "comparisons": 0,
                "traversals": i + 1
            })

        return {
            "operation": f"{mode.replace('_', ' ').title()} Traversal",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_BST_STRUCT,
            "complexity": {
                "time_best": "O(n)",
                "time_avg": "O(n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(n)"
            },
            "metrics": {
                "comparisons": 0,
                "traversals": len(visited_nodes),
                "pointer_assignments": 0,
                "total_nodes": len(self._snapshot())
            }
        }


class BinaryHeapDS:
    """Min / Max Binary Heap with Dual Tree & Array Representation."""

    def __init__(self, is_min_heap: bool = True):
        self.is_min_heap = is_min_heap
        self.data: List[int] = [10, 20, 15, 30, 40] if is_min_heap else [90, 70, 80, 40, 50]
        self.operation_count = 0

    def _snapshot(
        self,
        active_index: Optional[int] = None,
        comparing_index: Optional[int] = None
    ) -> Dict[str, Any]:
        # Generate tree node coordinates based on binary heap index
        nodes = []
        for i, val in enumerate(self.data):
            # Compute depth and position
            import math
            depth = int(math.floor(math.log2(i + 1)))
            num_nodes_at_depth = 2 ** depth
            pos_in_depth = i - (num_nodes_at_depth - 1)
            spacing = 800.0 / (num_nodes_at_depth + 1)
            x = (pos_in_depth + 1) * spacing
            y = depth * 75.0 + 40.0

            left_idx = 2 * i + 1
            right_idx = 2 * i + 2

            nodes.append({
                "id": f"heap-node-{i}",
                "index": i,
                "value": val,
                "left_index": left_idx if left_idx < len(self.data) else None,
                "right_index": right_idx if right_idx < len(self.data) else None,
                "parent_index": (i - 1) // 2 if i > 0 else None,
                "x": x,
                "y": y,
                "is_active": i == active_index,
                "is_comparing": i == comparing_index
            })

        return {
            "nodes": nodes,
            "array": [{"index": i, "value": v, "is_active": i == active_index} for i, v in enumerate(self.data)],
            "size": len(self.data),
            "is_min_heap": self.is_min_heap
        }

    def get_state(self) -> Dict[str, Any]:
        return {
            **self._snapshot(),
            "c_struct": C_HEAP_STRUCT
        }

    def insert(self, value: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_HEAP_SNIPPETS["insert_heap"]

        self.data.append(value)
        curr_idx = len(self.data) - 1

        steps.append({
            "step_number": 1,
            "description": f"Appended {value} at the next complete tree leaf position: index {curr_idx}.",
            "heap_state": self._snapshot(active_index=curr_idx),
            "c_line_number": 4,
            "c_line_explanation": f"h->data[{curr_idx}] = {value}; h->size++;",
            "log_type": "info",
            "comparisons": 0,
            "traversals": 1
        })

        # Bubble up
        comparisons = 0
        swaps = 0
        while curr_idx > 0:
            parent_idx = (curr_idx - 1) // 2
            comparisons += 1

            should_swap = (
                self.data[curr_idx] < self.data[parent_idx]
                if self.is_min_heap
                else self.data[curr_idx] > self.data[parent_idx]
            )

            if should_swap:
                swaps += 1
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"Violation of Heap Property: child {self.data[curr_idx]} at index {curr_idx} violates heap order with parent {self.data[parent_idx]} at index {parent_idx}. Swapping.",
                    "heap_state": self._snapshot(active_index=curr_idx, comparing_index=parent_idx),
                    "c_line_number": 7,
                    "c_line_explanation": "Swapping child with parent to restore heap order.",
                    "log_type": "pointer",
                    "comparisons": comparisons,
                    "traversals": swaps
                })

                self.data[curr_idx], self.data[parent_idx] = self.data[parent_idx], self.data[curr_idx]
                curr_idx = parent_idx
            else:
                break

        steps.append({
            "step_number": len(steps) + 1,
            "description": f"Heap invariant verified. Element {value} settled at index {curr_idx}.",
            "heap_state": self._snapshot(active_index=curr_idx),
            "c_line_number": 11,
            "c_line_explanation": "Heap property successfully satisfied.",
            "log_type": "success",
            "comparisons": comparisons,
            "traversals": swaps
        })

        return {
            "operation": f"Insert {value} into {'Min' if self.is_min_heap else 'Max'} Heap",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_HEAP_STRUCT,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(log n)",
                "time_worst": "O(log n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": swaps,
                "pointer_assignments": swaps * 2,
                "total_nodes": len(self.data)
            }
        }


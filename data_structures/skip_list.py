"""
DSVERSE - Skip List Data Structure & Execution Engine.
Academic execution engine supporting multi-level forward pointer manipulation,
probabilistic level generation, express lane traversal, and synchronized ANSI C line mapping.
"""

import random
import uuid
from typing import List, Dict, Any, Optional

MAX_SKIP_LEVEL = 4
PROBABILITY = 0.5

C_SKIP_STRUCT = """#define MAX_LEVEL 4

struct SkipNode {
    int key;
    int value;
    struct SkipNode* forward[MAX_LEVEL];
};
typedef struct SkipNode* SKIP_NODE;

typedef struct {
    int level;
    struct SkipNode* header;
} SkipList;"""

C_SKIP_SNIPPETS = {
    "search": (
        "SKIP_NODE search_skiplist(SkipList *list, int key) {\n"
        "    SKIP_NODE curr = list->header;\n"
        "    for (int i = list->level - 1; i >= 0; i--) {\n"
        "        while (curr->forward[i] != NULL && curr->forward[i]->key < key) {\n"
        "            curr = curr->forward[i]; // Move forward on express lane\n"
        "        }\n"
        "    }\n"
        "    curr = curr->forward[0]; // Drop to base level 0\n"
        "    if (curr != NULL && curr->key == key) return curr; // Match found\n"
        "    return NULL; // Key absent\n"
        "}"
    ),
    "insert": (
        "void insert_skiplist(SkipList *list, int key, int val) {\n"
        "    SKIP_NODE update[MAX_LEVEL];\n"
        "    SKIP_NODE curr = list->header;\n"
        "    for (int i = list->level - 1; i >= 0; i--) {\n"
        "        while (curr->forward[i] != NULL && curr->forward[i]->key < key) {\n"
        "            curr = curr->forward[i];\n"
        "        }\n"
        "        update[i] = curr; // Track predecessor at level i\n"
        "    }\n"
        "    int rlevel = random_level(); // Coin toss geometric distribution\n"
        "    SKIP_NODE newNode = create_node(key, val, rlevel);\n"
        "    for (int i = 0; i < rlevel; i++) {\n"
        "        newNode->forward[i] = update[i]->forward[i];\n"
        "        update[i]->forward[i] = newNode;\n"
        "    }\n"
        "}"
    ),
    "delete": (
        "void delete_skiplist(SkipList *list, int key) {\n"
        "    SKIP_NODE update[MAX_LEVEL];\n"
        "    SKIP_NODE curr = list->header;\n"
        "    for (int i = list->level - 1; i >= 0; i--) {\n"
        "        while (curr->forward[i] != NULL && curr->forward[i]->key < key) {\n"
        "            curr = curr->forward[i];\n"
        "        }\n"
        "        update[i] = curr;\n"
        "    }\n"
        "    curr = curr->forward[0];\n"
        "    if (curr != NULL && curr->key == key) {\n"
        "        for (int i = 0; i < list->level; i++) {\n"
        "            if (update[i]->forward[i] != curr) break;\n"
        "            update[i]->forward[i] = curr->forward[i];\n"
        "        }\n"
        "        free(curr);\n"
        "    }\n"
        "}"
    )
}


class SkipNode:
    def __init__(self, key: int, value: int, level: int, node_id: Optional[str] = None):
        self.key: int = key
        self.value: int = value
        self.level: int = level  # number of levels this node participates in (1 to MAX_LEVEL)
        self.forward: List[Optional['SkipNode']] = [None] * MAX_SKIP_LEVEL
        self.id: str = node_id or f"snode-{uuid.uuid4().hex[:6]}"


class SkipListDS:
    def __init__(self):
        self.max_level: int = MAX_SKIP_LEVEL
        self.current_level: int = 3
        self.header: SkipNode = SkipNode(-1, -1, MAX_SKIP_LEVEL, "header-node")
        self.operation_count: int = 0
        self._seed_defaults()

    def _random_level(self) -> int:
        lvl = 1
        while random.random() < PROBABILITY and lvl < self.max_level:
            lvl += 1
        return lvl

    def _seed_defaults(self):
        defaults = [
            (10, 100, 1),
            (20, 200, 3),
            (30, 300, 2),
            (40, 400, 1),
            (50, 500, 4),
            (60, 600, 2)
        ]
        for k, v, lvl in defaults:
            self._insert_with_level(k, v, lvl)

    def _insert_with_level(self, key: int, value: int, rlevel: int):
        update: List[Optional[SkipNode]] = [None] * self.max_level
        curr: Optional[SkipNode] = self.header

        for i in range(self.max_level - 1, -1, -1):
            while curr.forward[i] is not None and curr.forward[i].key < key:
                curr = curr.forward[i]
            update[i] = curr

        new_node = SkipNode(key, value, rlevel)
        for i in range(rlevel):
            new_node.forward[i] = update[i].forward[i]
            update[i].forward[i] = new_node

    def _collect_nodes(self) -> List[SkipNode]:
        nodes = []
        curr = self.header.forward[0]
        while curr:
            nodes.append(curr)
            curr = curr.forward[0]
        return nodes

    def _snapshot(
        self,
        active_node_id: Optional[str] = None,
        active_level: Optional[int] = None,
        visited_path: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        node_objs = self._collect_nodes()
        nodes_data = []

        # Header node representation
        header_data = {
            "id": self.header.id,
            "key": "HEAD",
            "value": "HEADER",
            "level": self.max_level,
            "is_header": True,
            "is_active": self.header.id == active_node_id,
            "forward_ids": [f.id if f else None for f in self.header.forward[:self.max_level]]
        }

        for n in node_objs:
            nodes_data.append({
                "id": n.id,
                "key": n.key,
                "value": n.value,
                "level": n.level,
                "is_header": False,
                "is_active": n.id == active_node_id,
                "forward_ids": [n.forward[i].id if n.forward[i] else None for i in range(n.level)]
            })

        return {
            "header": header_data,
            "nodes": nodes_data,
            "max_level": self.max_level,
            "current_level": self.current_level,
            "active_level": active_level,
            "visited_path": visited_path or []
        }

    def get_state(self) -> Dict[str, Any]:
        return {
            **self._snapshot(),
            "c_struct": C_SKIP_STRUCT
        }

    def reset_default(self) -> Dict[str, Any]:
        self.header = SkipNode(-1, -1, MAX_SKIP_LEVEL, "header-node")
        self.current_level = 3
        self._seed_defaults()
        self.operation_count = 0
        return self.get_state()

    def search(self, key: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_SKIP_SNIPPETS["search"]
        curr: SkipNode = self.header
        comparisons = 0
        traversals = 0
        visited_path = []

        steps.append({
            "step_number": 1,
            "description": f"Initiating Skip List search for key {key}. Beginning at header node, top express level {self.max_level - 1}.",
            "skip_state": self._snapshot(
                active_node_id=curr.id,
                active_level=self.max_level - 1,
                visited_path=list(visited_path)
            ),
            "c_line_number": 2,
            "c_line_explanation": "SKIP_NODE curr = list->header; Starting pointer initialization.",
            "log_type": "info",
            "comparisons": 0,
            "traversals": 1
        })

        for i in range(self.max_level - 1, -1, -1):
            visited_path.append({"node_id": curr.id, "level": i})

            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Evaluating Level {i} express lane. Current position: Node({curr.key if curr.key != -1 else 'HEAD'}).",
                "skip_state": self._snapshot(
                    active_node_id=curr.id,
                    active_level=i,
                    visited_path=list(visited_path)
                ),
                "c_line_number": 3,
                "c_line_explanation": f"for (int i = {i}; i >= 0; i--); Scanning express lane at level {i}.",
                "log_type": "pointer",
                "comparisons": comparisons,
                "traversals": traversals
            })

            while curr.forward[i] is not None and curr.forward[i].key < key:
                comparisons += 1
                traversals += 1
                next_node = curr.forward[i]
                visited_path.append({"node_id": next_node.id, "level": i})

                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"Level {i}: {next_node.key} < target {key}. Fast-forwarding along express lane to Node({next_node.key}).",
                    "skip_state": self._snapshot(
                        active_node_id=next_node.id,
                        active_level=i,
                        visited_path=list(visited_path)
                    ),
                    "c_line_number": 5,
                    "c_line_explanation": f"curr = curr->forward[{i}]; Skipping intermediate elements.",
                    "log_type": "traverse",
                    "comparisons": comparisons,
                    "traversals": traversals
                })
                curr = next_node

            if curr.forward[i] is not None:
                comparisons += 1
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"Level {i}: Forward node {curr.forward[i].key} >= target {key}. Cannot advance further at Level {i}; dropping down.",
                    "skip_state": self._snapshot(
                        active_node_id=curr.id,
                        active_level=i,
                        visited_path=list(visited_path)
                    ),
                    "c_line_number": 7,
                    "c_line_explanation": "Dropping down to next lower level with finer granularity.",
                    "log_type": "pointer",
                    "comparisons": comparisons,
                    "traversals": traversals
                })

        # At base level 0, move to the actual candidate
        target_node = curr.forward[0]
        if target_node is not None and target_node.key == key:
            visited_path.append({"node_id": target_node.id, "level": 0})
            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Success! Key {key} discovered at Node({target_node.key}) with value {target_node.value} (Level {target_node.level}).",
                "skip_state": self._snapshot(
                    active_node_id=target_node.id,
                    active_level=0,
                    visited_path=list(visited_path)
                ),
                "c_line_number": 8,
                "c_line_explanation": "if (curr != NULL && curr->key == key) return curr; Key matched in O(log n) expected steps.",
                "log_type": "success",
                "comparisons": comparisons + 1,
                "traversals": traversals + 1
            })
        else:
            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Search concluded: Key {key} does not exist in Skip List.",
                "skip_state": self._snapshot(
                    active_node_id=curr.id,
                    active_level=0,
                    visited_path=list(visited_path)
                ),
                "c_line_number": 9,
                "c_line_explanation": "return NULL; Reached element boundary without key match.",
                "log_type": "warning",
                "comparisons": comparisons + 1,
                "traversals": traversals
            })

        return {
            "operation": f"Skip List Search for Key {key}",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_SKIP_STRUCT,
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
                "total_nodes": len(self._collect_nodes())
            }
        }

    def insert(self, key: int, value: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_SKIP_SNIPPETS["insert"]

        update: List[Optional[SkipNode]] = [None] * self.max_level
        curr: Optional[SkipNode] = self.header
        comparisons = 0
        traversals = 0

        steps.append({
            "step_number": 1,
            "description": f"Initiating insertion of key {key} (val: {value}). Finding predecessors on each level.",
            "skip_state": self._snapshot(active_node_id=curr.id, active_level=self.max_level - 1),
            "c_line_number": 2,
            "c_line_explanation": "SKIP_NODE update[MAX_LEVEL]; Tracking predecessor pointers at all levels.",
            "log_type": "info",
            "comparisons": 0,
            "traversals": 1
        })

        for i in range(self.max_level - 1, -1, -1):
            while curr.forward[i] is not None and curr.forward[i].key < key:
                comparisons += 1
                traversals += 1
                curr = curr.forward[i]
            update[i] = curr

        # Check duplicate
        if curr.forward[0] is not None and curr.forward[0].key == key:
            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Key {key} already exists in Skip List. Updating existing value to {value}.",
                "skip_state": self._snapshot(active_node_id=curr.forward[0].id),
                "c_line_number": 8,
                "c_line_explanation": "Duplicate key found; overwrote value.",
                "log_type": "warning",
                "comparisons": comparisons,
                "traversals": traversals
            })
            curr.forward[0].value = value
            return {
                "operation": f"Update key {key}",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_SKIP_STRUCT,
                "metrics": {"comparisons": comparisons, "traversals": traversals, "pointer_assignments": 1, "total_nodes": len(self._collect_nodes())}
            }

        # Roll random level
        rlevel = self._random_level()
        new_node = SkipNode(key, value, rlevel)

        steps.append({
            "step_number": len(steps) + 1,
            "description": f"Probabilistic level generation: Coin tosses yielded Level {rlevel} (out of max {self.max_level}). Allocated new SkipNode.",
            "skip_state": self._snapshot(active_level=rlevel - 1),
            "c_line_number": 10,
            "c_line_explanation": f"int rlevel = {rlevel}; create_node({key}, {value}, {rlevel});",
            "log_type": "pointer",
            "comparisons": comparisons,
            "traversals": traversals
        })

        # Splice pointers across all assigned levels
        for i in range(rlevel):
            new_node.forward[i] = update[i].forward[i]
            update[i].forward[i] = new_node

            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Splicing Level {i} forward pointer: update[{i}] ({update[i].key if update[i].key != -1 else 'HEAD'}) -> Node({key}) -> {new_node.forward[i].key if new_node.forward[i] else 'NULL'}.",
                "skip_state": self._snapshot(active_node_id=new_node.id, active_level=i),
                "c_line_number": 13,
                "c_line_explanation": f"newNode->forward[{i}] = update[{i}]->forward[{i}]; update[{i}]->forward[{i}] = newNode;",
                "log_type": "success",
                "comparisons": comparisons,
                "traversals": traversals
            })

        return {
            "operation": f"Insert {key} (Level {rlevel}) into Skip List",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_SKIP_STRUCT,
            "complexity": {
                "time_best": "O(log n)",
                "time_avg": "O(log n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": traversals,
                "pointer_assignments": rlevel * 2,
                "total_nodes": len(self._collect_nodes())
            }
        }

    def delete(self, key: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_SKIP_SNIPPETS["delete"]

        update: List[Optional[SkipNode]] = [None] * self.max_level
        curr: Optional[SkipNode] = self.header
        comparisons = 0
        traversals = 0

        for i in range(self.max_level - 1, -1, -1):
            while curr.forward[i] is not None and curr.forward[i].key < key:
                comparisons += 1
                traversals += 1
                curr = curr.forward[i]
            update[i] = curr

        target = curr.forward[0]
        if target is None or target.key != key:
            steps.append({
                "step_number": 1,
                "description": f"Deletion failed: Key {key} does not exist in Skip List.",
                "skip_state": self._snapshot(),
                "c_line_number": 8,
                "c_line_explanation": "Target key not present; aborted deletion.",
                "log_type": "error",
                "comparisons": comparisons + 1,
                "traversals": traversals
            })
            return {
                "operation": f"Delete Key {key}",
                "steps": steps,
                "c_code": c_code,
                "c_struct": C_SKIP_STRUCT,
                "error": True,
                "message": f"Key {key} not found."
            }

        steps.append({
            "step_number": 1,
            "description": f"Found target Node({key}) spanning {target.level} levels. Unlinking pointers across all levels.",
            "skip_state": self._snapshot(active_node_id=target.id),
            "c_line_number": 9,
            "c_line_explanation": f"if (curr != NULL && curr->key == {key}); Beginning multi-level unlinking.",
            "log_type": "pointer",
            "comparisons": comparisons,
            "traversals": traversals
        })

        for i in range(target.level):
            if update[i].forward[i] == target:
                update[i].forward[i] = target.forward[i]
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"Bypassed target Node({key}) at Level {i}: update[{i}] now points directly to {target.forward[i].key if target.forward[i] else 'NULL'}.",
                    "skip_state": self._snapshot(active_level=i),
                    "c_line_number": 12,
                    "c_line_explanation": f"update[{i}]->forward[{i}] = curr->forward[{i}];",
                    "log_type": "success",
                    "comparisons": comparisons,
                    "traversals": traversals
                })

        return {
            "operation": f"Delete Key {key} from Skip List",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_SKIP_STRUCT,
            "complexity": {
                "time_best": "O(log n)",
                "time_avg": "O(log n)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": traversals,
                "pointer_assignments": target.level,
                "total_nodes": len(self._collect_nodes())
            }
        }


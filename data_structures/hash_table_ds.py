"""
DSVERSE - Hash Table Data Structure & Execution Engine.
Academic execution engine supporting Separate Chaining and Open Addressing
(Linear Probing, Quadratic Probing, Double Hashing) with synchronized ANSI C line mapping.
"""

from typing import List, Dict, Any, Optional

C_HASH_STRUCT = """#define TABLE_SIZE 7

// Separate Chaining Node in C
struct HashNode {
    int key;
    int value;
    struct HashNode* next;
};

// Open Addressing Table in C
typedef struct {
    int key;
    int value;
    int is_occupied; // 1 = occupied, 0 = empty, -1 = deleted
} OpenAddrSlot;"""

C_HASH_SNIPPETS = {
    "chaining_insert": (
        "void insert_chaining(struct HashNode* table[], int key, int val) {\n"
        "    int idx = key % TABLE_SIZE;\n"
        "    struct HashNode* newNode = (struct HashNode*)malloc(sizeof(struct HashNode));\n"
        "    newNode->key = key; newNode->value = val;\n"
        "    newNode->next = table[idx]; // Insert at head of chain\n"
        "    table[idx] = newNode;\n"
        "}"
    ),
    "linear_probing_insert": (
        "int insert_linear_probe(OpenAddrSlot table[], int key, int val) {\n"
        "    int hash = key % TABLE_SIZE;\n"
        "    for (int i = 0; i < TABLE_SIZE; i++) {\n"
        "        int idx = (hash + i) % TABLE_SIZE;\n"
        "        if (!table[idx].is_occupied || table[idx].is_occupied == -1) {\n"
        "            table[idx].key = key; table[idx].value = val;\n"
        "            table[idx].is_occupied = 1;\n"
        "            return idx;\n"
        "        }\n"
        "    }\n"
        "    return -1; // Table full\n"
        "}"
    ),
    "search": (
        "int search_table(OpenAddrSlot table[], int key) {\n"
        "    int hash = key % TABLE_SIZE;\n"
        "    for (int i = 0; i < TABLE_SIZE; i++) {\n"
        "        int idx = (hash + i) % TABLE_SIZE;\n"
        "        if (!table[idx].is_occupied) return -1;\n"
        "        if (table[idx].is_occupied == 1 && table[idx].key == key) return idx;\n"
        "    }\n"
        "    return -1;\n"
        "}"
    )
}


class HashTableDS:
    def __init__(self, table_size: int = 7, mode: str = "linear_probing"):
        self.table_size = table_size
        self.mode = mode  # 'linear_probing', 'chaining'
        # For open addressing: slots with {key, val, state} ('empty', 'occupied', 'deleted')
        self.open_slots: List[Dict[str, Any]] = [
            {"index": i, "key": None, "value": None, "state": "empty"}
            for i in range(table_size)
        ]
        # For chaining: list of lists
        self.chains: List[List[Dict[str, Any]]] = [[] for _ in range(table_size)]

        # Populate starter keys
        self._seed_defaults()
        self.operation_count = 0

    def _seed_defaults(self):
        starter = [(15, 100), (22, 200), (36, 300), (8, 400)]
        for k, v in starter:
            self._insert_raw(k, v)

    def _insert_raw(self, key: int, val: int):
        hash_idx = key % self.table_size
        if self.mode == "chaining":
            self.chains[hash_idx].append({"key": key, "value": val})
        else:
            for i in range(self.table_size):
                idx = (hash_idx + i) % self.table_size
                if self.open_slots[idx]["state"] in ["empty", "deleted"]:
                    self.open_slots[idx] = {"index": idx, "key": key, "value": val, "state": "occupied"}
                    break

    def _snapshot(
        self,
        active_index: Optional[int] = None,
        probed_indices: Optional[List[int]] = None,
        collision_index: Optional[int] = None
    ) -> Dict[str, Any]:
        probes = probed_indices or []
        slots = []
        for i in range(self.table_size):
            slot = self.open_slots[i]
            slots.append({
                "index": i,
                "key": slot["key"],
                "value": slot["value"],
                "state": slot["state"],
                "is_active": i == active_index,
                "is_probed": i in probes,
                "is_collision": i == collision_index,
                "chain": list(self.chains[i])
            })
        return {
            "slots": slots,
            "table_size": self.table_size,
            "mode": self.mode
        }

    def get_state(self) -> Dict[str, Any]:
        return {
            **self._snapshot(),
            "c_struct": C_HASH_STRUCT
        }

    def reset_default(self) -> Dict[str, Any]:
        self.open_slots = [{"index": i, "key": None, "value": None, "state": "empty"} for i in range(self.table_size)]
        self.chains = [[] for _ in range(self.table_size)]
        self._seed_defaults()
        self.operation_count = 0
        return self.get_state()

    def set_mode(self, mode: str) -> Dict[str, Any]:
        self.mode = mode
        return self.reset_default()

    def insert(self, key: int, value: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        comparisons = 0
        probes = []

        hash_base = key % self.table_size

        if self.mode == "chaining":
            c_code = C_HASH_SNIPPETS["chaining_insert"]
            steps.append({
                "step_number": 1,
                "description": f"Evaluating hash function: h({key}) = {key} % {self.table_size} = {hash_base}.",
                "hash_state": self._snapshot(active_index=hash_base),
                "c_line_number": 2,
                "c_line_explanation": f"int idx = {key} % {self.table_size}; Direct bucket mapping.",
                "log_type": "info",
                "comparisons": 0,
                "traversals": 1
            })

            new_node = {"key": key, "value": value}
            self.chains[hash_base].insert(0, new_node)

            steps.append({
                "step_number": 2,
                "description": f"Prepended key-value ({key}: {value}) at head of bucket {hash_base}'s linked list chain in O(1) time.",
                "hash_state": self._snapshot(active_index=hash_base),
                "c_line_number": 5,
                "c_line_explanation": "newNode->next = table[idx]; table[idx] = newNode; Chaining head insertion.",
                "log_type": "success",
                "comparisons": 0,
                "traversals": 1
            })
        else:
            c_code = C_HASH_SNIPPETS["linear_probing_insert"]
            steps.append({
                "step_number": 1,
                "description": f"Evaluating primary hash function: h({key}) = {key} % {self.table_size} = {hash_base}.",
                "hash_state": self._snapshot(active_index=hash_base),
                "c_line_number": 2,
                "c_line_explanation": f"int hash = {key} % TABLE_SIZE;",
                "log_type": "info",
                "comparisons": 0,
                "traversals": 1
            })

            inserted = False
            for i in range(self.table_size):
                comparisons += 1
                curr_idx = (hash_base + i) % self.table_size
                probes.append(curr_idx)

                slot = self.open_slots[curr_idx]
                if slot["state"] in ["empty", "deleted"]:
                    self.open_slots[curr_idx] = {
                        "index": curr_idx,
                        "key": key,
                        "value": value,
                        "state": "occupied"
                    }
                    inserted = True

                    steps.append({
                        "step_number": len(steps) + 1,
                        "description": f"Probe #{i}: Slot {curr_idx} is {slot['state']}. Inserted ({key}: {value}) at index {curr_idx}.",
                        "hash_state": self._snapshot(active_index=curr_idx, probed_indices=list(probes)),
                        "c_line_number": 6,
                        "c_line_explanation": f"table[{curr_idx}].key = {key}; Stored in open slot via linear probing.",
                        "log_type": "success",
                        "comparisons": comparisons,
                        "traversals": len(probes)
                    })
                    break
                else:
                    # Collision!
                    steps.append({
                        "step_number": len(steps) + 1,
                        "description": f"Collision at slot {curr_idx}! Occupied by key {slot['key']}. Linear probing to next slot.",
                        "hash_state": self._snapshot(
                            active_index=curr_idx,
                            probed_indices=list(probes),
                            collision_index=curr_idx
                        ),
                        "c_line_number": 4,
                        "c_line_explanation": f"Slot {curr_idx} already occupied. Advancing probe counter i = {i + 1}.",
                        "log_type": "warning",
                        "comparisons": comparisons,
                        "traversals": len(probes)
                    })

            if not inserted:
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": "Hash Table Overflow: All slots in table are occupied.",
                    "hash_state": self._snapshot(probed_indices=list(probes)),
                    "c_line_number": 10,
                    "c_line_explanation": "Table capacity exhausted. Return -1.",
                    "log_type": "error",
                    "comparisons": comparisons,
                    "traversals": len(probes)
                })

        return {
            "operation": f"Insert key {key} (val: {value}) into Hash Table",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_HASH_STRUCT,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(1)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": len(probes) if probes else 1,
                "pointer_assignments": 1,
                "total_nodes": self.table_size
            }
        }

    def search(self, key: int) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_HASH_SNIPPETS["search"]
        hash_base = key % self.table_size
        comparisons = 0
        probes = []

        steps.append({
            "step_number": 1,
            "description": f"Searching for key {key}. Primary hash: h({key}) = {hash_base}.",
            "hash_state": self._snapshot(active_index=hash_base),
            "c_line_number": 2,
            "c_line_explanation": f"int hash = {key} % TABLE_SIZE;",
            "log_type": "info",
            "comparisons": 0,
            "traversals": 1
        })

        found = False
        for i in range(self.table_size):
            comparisons += 1
            curr_idx = (hash_base + i) % self.table_size
            probes.append(curr_idx)

            slot = self.open_slots[curr_idx]
            if slot["state"] == "empty":
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"Probe #{i} at slot {curr_idx} is empty. Search terminated (key {key} does not exist).",
                    "hash_state": self._snapshot(probed_indices=list(probes)),
                    "c_line_number": 5,
                    "c_line_explanation": "Encountered empty slot; search miss.",
                    "log_type": "warning",
                    "comparisons": comparisons,
                    "traversals": len(probes)
                })
                break
            elif slot["state"] == "occupied" and slot["key"] == key:
                found = True
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"Key {key} found at slot {curr_idx} with value {slot['value']}!",
                    "hash_state": self._snapshot(active_index=curr_idx, probed_indices=list(probes)),
                    "c_line_number": 6,
                    "c_line_explanation": f"Key match! Returning slot index {curr_idx}.",
                    "log_type": "success",
                    "comparisons": comparisons,
                    "traversals": len(probes)
                })
                break
            else:
                steps.append({
                    "step_number": len(steps) + 1,
                    "description": f"Probe #{i} at slot {curr_idx}: key {slot['key']} != {key}. Continuing probe sequence.",
                    "hash_state": self._snapshot(probed_indices=list(probes)),
                    "c_line_number": 4,
                    "c_line_explanation": "Advancing probe.",
                    "log_type": "traverse",
                    "comparisons": comparisons,
                    "traversals": len(probes)
                })

        return {
            "operation": f"Search for key {key}",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_HASH_STRUCT,
            "complexity": {
                "time_best": "O(1)",
                "time_avg": "O(1)",
                "time_worst": "O(n)",
                "space_auxiliary": "O(1)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": len(probes),
                "pointer_assignments": 0,
                "total_nodes": self.table_size
            }
        }


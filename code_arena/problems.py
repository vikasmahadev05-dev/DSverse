"""
Problem Library and Test Harness Repository for DSVERSE Code Arena.
Contains LeetCode-style C problems with function signatures, test cases, and C test harnesses.
"""

from typing import Dict, Any, List, Optional

PROBLEMS: Dict[str, Dict[str, Any]] = {
    # ==========================================
    # LINKED LISTS
    # ==========================================
    "ll-insert-beginning": {
        "id": "ll-insert-beginning",
        "title": "Insert at Beginning of Singly Linked List",
        "category": "Linked Lists",
        "difficulty": "Easy",
        "visualizer_type": "linked-list",
        "description": (
            "Write a C function to insert a new node with the specified integer `info` "
            "at the beginning of an existing singly linked list.\n\n"
            "The function must allocate dynamic heap memory using `malloc`, initialize its `info` "
            "field, configure its `next` pointer to point to the current `start` node, and return "
            "the updated head pointer."
        ),
        "struct_definition": (
            "struct node {\n"
            "    int info;\n"
            "    struct node *next;\n"
            "};\n"
            "typedef struct node *NODE;"
        ),
        "function_signature": "NODE insert_beginning(NODE start, int info);",
        "starter_code": (
            "#include <stdio.h>\n"
            "#include <stdlib.h>\n\n"
            "struct node {\n"
            "    int info;\n"
            "    struct node *next;\n"
            "};\n"
            "typedef struct node *NODE;\n\n"
            "NODE insert_beginning(NODE start, int info) {\n"
            "    // Allocate heap memory for new node\n"
            "    NODE temp = (NODE)malloc(sizeof(struct node));\n"
            "    if (temp == NULL) {\n"
            "        return start;\n"
            "    }\n"
            "    temp->info = info;\n"
            "    temp->next = start;\n"
            "    return temp;\n"
            "}\n"
        ),
        "solution_code": (
            "#include <stdio.h>\n"
            "#include <stdlib.h>\n\n"
            "struct node {\n"
            "    int info;\n"
            "    struct node *next;\n"
            "};\n"
            "typedef struct node *NODE;\n\n"
            "NODE insert_beginning(NODE start, int info) {\n"
            "    NODE temp = (NODE)malloc(sizeof(struct node));\n"
            "    if (!temp) return start;\n"
            "    temp->info = info;\n"
            "    temp->next = start;\n"
            "    return temp;\n"
            "}\n"
        ),
        "examples": [
            {
                "input": "Initial List: [10, 20, 30], info = 5",
                "output": "[5, 10, 20, 30]",
                "explanation": "Node with value 5 is created and linked to point to 10. Head now points to 5."
            },
            {
                "input": "Initial List: [], info = 42",
                "output": "[42]",
                "explanation": "Inserting into an empty list returns a single node whose next pointer is NULL."
            }
        ],
        "constraints": [
            "The initial linked list may contain 0 to 1000 nodes.",
            "-10000 <= node.info <= 10000",
            "Time Complexity must be O(1).",
            "Auxiliary Space Complexity must be O(1)."
        ],
        "hints": [
            "Remember to check if malloc returned NULL before dereferencing the pointer.",
            "Make sure to link temp->next = start BEFORE returning temp.",
            "Do NOT lose the existing start pointer before connecting the new node."
        ],
        "visible_tests": [
            {"initial": [10, 20, 30], "info": 5, "expected": [5, 10, 20, 30], "label": "Standard insertion into non-empty list"},
            {"initial": [], "info": 42, "expected": [42], "label": "Insert into empty list (start == NULL)"},
            {"initial": [100], "info": 50, "expected": [50, 100], "label": "Single element existing list"}
        ],
        "hidden_tests": [
            {"initial": [1, 2, 3, 4, 5], "info": 0, "expected": [0, 1, 2, 3, 4, 5], "label": "Multiple elements prepend"},
            {"initial": [-10, -20], "info": -5, "expected": [-5, -10, -20], "label": "Negative integers"},
            {"initial": [], "info": 0, "expected": [0], "label": "Empty list with zero value"}
        ],
        "harness_type": "singly_linked_list_insert_beginning"
    },

    "ll-insert-end": {
        "id": "ll-insert-end",
        "title": "Insert at End of Singly Linked List",
        "category": "Linked Lists",
        "difficulty": "Easy",
        "visualizer_type": "linked-list",
        "description": (
            "Write a C function to append a new node with value `info` at the end of a singly linked list.\n\n"
            "If the linked list is empty (`start == NULL`), return the new node as the head. "
            "Otherwise, traverse to the last node and update its `next` pointer to the newly allocated node."
        ),
        "struct_definition": (
            "struct node {\n"
            "    int info;\n"
            "    struct node *next;\n"
            "};\n"
            "typedef struct node *NODE;"
        ),
        "function_signature": "NODE insert_end(NODE start, int info);",
        "starter_code": (
            "#include <stdio.h>\n"
            "#include <stdlib.h>\n\n"
            "struct node {\n"
            "    int info;\n"
            "    struct node *next;\n"
            "};\n"
            "typedef struct node *NODE;\n\n"
            "NODE insert_end(NODE start, int info) {\n"
            "    NODE temp = (NODE)malloc(sizeof(struct node));\n"
            "    temp->info = info;\n"
            "    temp->next = NULL;\n"
            "    \n"
            "    if (start == NULL) {\n"
            "        return temp;\n"
            "    }\n"
            "    \n"
            "    NODE curr = start;\n"
            "    while (curr->next != NULL) {\n"
            "        curr = curr->next;\n"
            "    }\n"
            "    curr->next = temp;\n"
            "    return start;\n"
            "}\n"
        ),
        "solution_code": (
            "#include <stdio.h>\n"
            "#include <stdlib.h>\n\n"
            "struct node {\n"
            "    int info;\n"
            "    struct node *next;\n"
            "};\n"
            "typedef struct node *NODE;\n\n"
            "NODE insert_end(NODE start, int info) {\n"
            "    NODE temp = (NODE)malloc(sizeof(struct node));\n"
            "    if (!temp) return start;\n"
            "    temp->info = info;\n"
            "    temp->next = NULL;\n"
            "    if (start == NULL) return temp;\n"
            "    NODE curr = start;\n"
            "    while (curr->next != NULL) {\n"
            "        curr = curr->next;\n"
            "    }\n"
            "    curr->next = temp;\n"
            "    return start;\n"
            "}\n"
        ),
        "examples": [
            {
                "input": "Initial List: [10, 20], info = 30",
                "output": "[10, 20, 30]",
                "explanation": "Traverses to node 20, points 20->next to new node 30."
            }
        ],
        "constraints": ["0 <= list size <= 500", "Time Complexity O(N)"],
        "hints": ["Traverse until `curr->next == NULL`, not `curr == NULL`."],
        "visible_tests": [
            {"initial": [10, 20], "info": 30, "expected": [10, 20, 30], "label": "Normal append"},
            {"initial": [], "info": 99, "expected": [99], "label": "Append to empty list"}
        ],
        "hidden_tests": [
            {"initial": [1], "info": 2, "expected": [1, 2], "label": "Single element list"},
            {"initial": [5, 4, 3, 2], "info": 1, "expected": [5, 4, 3, 2, 1], "label": "Multiple elements append"}
        ],
        "harness_type": "singly_linked_list_insert_end"
    },

    "ll-reverse": {
        "id": "ll-reverse",
        "title": "Reverse a Singly Linked List In-Place",
        "category": "Linked Lists",
        "difficulty": "Medium",
        "visualizer_type": "linked-list",
        "description": (
            "Given the head pointer `start` of a singly linked list, reverse the list in-place and return the new head pointer.\n\n"
            "You must modify the node pointers directly using three pointers (`prev`, `curr`, `next_node`). "
            "Do not allocate new nodes or copy data."
        ),
        "struct_definition": (
            "struct node {\n"
            "    int info;\n"
            "    struct node *next;\n"
            "};\n"
            "typedef struct node *NODE;"
        ),
        "function_signature": "NODE reverse_list(NODE start);",
        "starter_code": (
            "#include <stdio.h>\n"
            "#include <stdlib.h>\n\n"
            "struct node {\n"
            "    int info;\n"
            "    struct node *next;\n"
            "};\n"
            "typedef struct node *NODE;\n\n"
            "NODE reverse_list(NODE start) {\n"
            "    NODE prev = NULL;\n"
            "    NODE curr = start;\n"
            "    NODE next_node = NULL;\n"
            "    \n"
            "    while (curr != NULL) {\n"
            "        next_node = curr->next;\n"
            "        curr->next = prev;\n"
            "        prev = curr;\n"
            "        curr = next_node;\n"
            "    }\n"
            "    return prev;\n"
            "}\n"
        ),
        "solution_code": (
            "#include <stdio.h>\n"
            "#include <stdlib.h>\n\n"
            "struct node {\n"
            "    int info;\n"
            "    struct node *next;\n"
            "};\n"
            "typedef struct node *NODE;\n\n"
            "NODE reverse_list(NODE start) {\n"
            "    NODE prev = NULL, curr = start, next_node = NULL;\n"
            "    while (curr != NULL) {\n"
            "        next_node = curr->next;\n"
            "        curr->next = prev;\n"
            "        prev = curr;\n"
            "        curr = next_node;\n"
            "    }\n"
            "    return prev;\n"
            "}\n"
        ),
        "examples": [
            {
                "input": "Initial List: [10, 20, 30, 40]",
                "output": "[40, 30, 20, 10]",
                "explanation": "All next pointers inverted. Node 40 becomes the new head, and node 10 points to NULL."
            }
        ],
        "constraints": ["List size: 0 to 500", "Must be O(N) time and O(1) auxiliary space."],
        "hints": ["Store `curr->next` in `next_node` before pointing `curr->next = prev`."],
        "visible_tests": [
            {"initial": [10, 20, 30, 40], "expected": [40, 30, 20, 10], "label": "Four node list"},
            {"initial": [100], "expected": [100], "label": "Single node list"},
            {"initial": [], "expected": [], "label": "Empty list"}
        ],
        "hidden_tests": [
            {"initial": [1, 2], "expected": [2, 1], "label": "Two elements"},
            {"initial": [5, 15, 25, 35, 45], "expected": [45, 35, 25, 15, 5], "label": "Odd number of elements"}
        ],
        "harness_type": "singly_linked_list_reverse"
    },

    "ll-delete-val": {
        "id": "ll-delete-val",
        "title": "Delete a Node by Value",
        "category": "Linked Lists",
        "difficulty": "Easy",
        "visualizer_type": "linked-list",
        "description": (
            "Given head pointer `start` and an integer `val`, remove the first node containing `info == val`. "
            "Free the deleted node's memory and return the updated head."
        ),
        "struct_definition": (
            "struct node {\n"
            "    int info;\n"
            "    struct node *next;\n"
            "};\n"
            "typedef struct node *NODE;"
        ),
        "function_signature": "NODE delete_value(NODE start, int val);",
        "starter_code": (
            "#include <stdio.h>\n"
            "#include <stdlib.h>\n\n"
            "struct node {\n"
            "    int info;\n"
            "    struct node *next;\n"
            "};\n"
            "typedef struct node *NODE;\n\n"
            "NODE delete_value(NODE start, int val) {\n"
            "    if (start == NULL) return NULL;\n"
            "    if (start->info == val) {\n"
            "        NODE temp = start;\n"
            "        start = start->next;\n"
            "        free(temp);\n"
            "        return start;\n"
            "    }\n"
            "    NODE curr = start;\n"
            "    while (curr->next != NULL && curr->next->info != val) {\n"
            "        curr = curr->next;\n"
            "    }\n"
            "    if (curr->next != NULL) {\n"
            "        NODE temp = curr->next;\n"
            "        curr->next = temp->next;\n"
            "        free(temp);\n"
            "    }\n"
            "    return start;\n"
            "}\n"
        ),
        "solution_code": (
            "#include <stdio.h>\n"
            "#include <stdlib.h>\n\n"
            "struct node {\n"
            "    int info;\n"
            "    struct node *next;\n"
            "};\n"
            "typedef struct node *NODE;\n\n"
            "NODE delete_value(NODE start, int val) {\n"
            "    if (!start) return NULL;\n"
            "    if (start->info == val) {\n"
            "        NODE t = start;\n"
            "        start = start->next;\n"
            "        free(t);\n"
            "        return start;\n"
            "    }\n"
            "    NODE curr = start;\n"
            "    while (curr->next && curr->next->info != val) curr = curr->next;\n"
            "    if (curr->next) {\n"
            "        NODE t = curr->next;\n"
            "        curr->next = t->next;\n"
            "        free(t);\n"
            "    }\n"
            "    return start;\n"
            "}\n"
        ),
        "examples": [
            {"input": "[10, 20, 30], val = 20", "output": "[10, 30]", "explanation": "Node 20 deleted, 10 connects directly to 30."}
        ],
        "constraints": ["List size 0 to 500"],
        "hints": ["Handle the edge case where the head node contains the value."],
        "visible_tests": [
            {"initial": [10, 20, 30], "val": 20, "expected": [10, 30], "label": "Delete middle node"},
            {"initial": [10, 20, 30], "val": 10, "expected": [20, 30], "label": "Delete head node"},
            {"initial": [10, 20, 30], "val": 99, "expected": [10, 20, 30], "label": "Value not in list"}
        ],
        "hidden_tests": [
            {"initial": [50], "val": 50, "expected": [], "label": "Single element becomes empty"},
            {"initial": [1, 2, 3], "val": 3, "expected": [1, 2], "label": "Delete tail node"}
        ],
        "harness_type": "singly_linked_list_delete_val"
    },

    # ==========================================
    # ARRAYS
    # ==========================================
    "arr-reverse": {
        "id": "arr-reverse",
        "title": "Reverse an Array In-Place",
        "category": "Arrays",
        "difficulty": "Easy",
        "visualizer_type": "array",
        "description": (
            "Write a C function to reverse an integer array `arr` of size `n` in-place using two-pointer swapping.\n\n"
            "The function must not allocate an auxiliary array. Swap elements between `left` and `right` indices until they meet."
        ),
        "struct_definition": "// Standard integer array and length",
        "function_signature": "void reverse_array(int arr[], int n);",
        "starter_code": (
            "#include <stdio.h>\n\n"
            "void reverse_array(int arr[], int n) {\n"
            "    int left = 0;\n"
            "    int right = n - 1;\n"
            "    while (left < right) {\n"
            "        int temp = arr[left];\n"
            "        arr[left] = arr[right];\n"
            "        arr[right] = temp;\n"
            "        left++;\n"
            "        right--;\n"
            "    }\n"
            "}\n"
        ),
        "solution_code": (
            "#include <stdio.h>\n\n"
            "void reverse_array(int arr[], int n) {\n"
            "    int l = 0, r = n - 1;\n"
            "    while (l < r) {\n"
            "        int t = arr[l];\n"
            "        arr[l] = arr[r];\n"
            "        arr[r] = t;\n"
            "        l++; r--;\n"
            "    }\n"
            "}\n"
        ),
        "examples": [
            {"input": "arr = [1, 2, 3, 4, 5], n = 5", "output": "[5, 4, 3, 2, 1]", "explanation": "Array elements inverted in-place."}
        ],
        "constraints": ["1 <= n <= 1000", "O(1) auxiliary space."],
        "hints": ["Use while(left < right) with two index pointers."],
        "visible_tests": [
            {"initial": [1, 2, 3, 4, 5], "expected": [5, 4, 3, 2, 1], "label": "Odd length array"},
            {"initial": [10, 20, 30, 40], "expected": [40, 30, 20, 10], "label": "Even length array"}
        ],
        "hidden_tests": [
            {"initial": [7], "expected": [7], "label": "Single element"},
            {"initial": [-3, 0, 8, -12], "expected": [-12, 8, 0, -3], "label": "Mixed negative values"}
        ],
        "harness_type": "array_reverse"
    },

    "arr-find-max": {
        "id": "arr-find-max",
        "title": "Find Maximum Element in Array",
        "category": "Arrays",
        "difficulty": "Easy",
        "visualizer_type": "array",
        "description": (
            "Write a C function to traverse an integer array `arr` of size `n` and return its maximum element."
        ),
        "struct_definition": "// Standard integer array",
        "function_signature": "int find_maximum(int arr[], int n);",
        "starter_code": (
            "#include <stdio.h>\n\n"
            "int find_maximum(int arr[], int n) {\n"
            "    int max_val = arr[0];\n"
            "    for (int i = 1; i < n; i++) {\n"
            "        if (arr[i] > max_val) {\n"
            "            max_val = arr[i];\n"
            "        }\n"
            "    }\n"
            "    return max_val;\n"
            "}\n"
        ),
        "solution_code": (
            "#include <stdio.h>\n\n"
            "int find_maximum(int arr[], int n) {\n"
            "    int m = arr[0];\n"
            "    for (int i = 1; i < n; i++) if (arr[i] > m) m = arr[i];\n"
            "    return m;\n"
            "}\n"
        ),
        "examples": [
            {"input": "arr = [3, 7, 2, 9, 5], n = 5", "output": "9", "explanation": "Maximum element is 9."}
        ],
        "constraints": ["1 <= n <= 1000"],
        "hints": ["Initialize max_val with arr[0]."],
        "visible_tests": [
            {"initial": [3, 7, 2, 9, 5], "expected": 9, "label": "Unsorted array with maximum in middle"},
            {"initial": [10, 8, 6, 4], "expected": 10, "label": "Maximum at start"}
        ],
        "hidden_tests": [
            {"initial": [-20, -5, -100, -1], "expected": -1, "label": "All negative numbers"},
            {"initial": [42], "expected": 42, "label": "Single element"}
        ],
        "harness_type": "array_find_max"
    },

    "arr-binary-search": {
        "id": "arr-binary-search",
        "title": "Binary Search in Sorted Array",
        "category": "Arrays",
        "difficulty": "Easy",
        "visualizer_type": "array",
        "description": (
            "Given a sorted integer array `arr` of size `n` and a target value `target`, "
            "implement binary search to return the 0-based index of `target`. "
            "Return -1 if `target` does not exist in the array."
        ),
        "struct_definition": "// Sorted array",
        "function_signature": "int binary_search(int arr[], int n, int target);",
        "starter_code": (
            "#include <stdio.h>\n\n"
            "int binary_search(int arr[], int n, int target) {\n"
            "    int low = 0;\n"
            "    int high = n - 1;\n"
            "    while (low <= high) {\n"
            "        int mid = low + (high - low) / 2;\n"
            "        if (arr[mid] == target) return mid;\n"
            "        if (arr[mid] < target) low = mid + 1;\n"
            "        else high = mid - 1;\n"
            "    }\n"
            "    return -1;\n"
            "}\n"
        ),
        "solution_code": (
            "#include <stdio.h>\n\n"
            "int binary_search(int arr[], int n, int target) {\n"
            "    int l = 0, h = n - 1;\n"
            "    while (l <= h) {\n"
            "        int m = l + (h - l) / 2;\n"
            "        if (arr[m] == target) return m;\n"
            "        if (arr[m] < target) l = m + 1;\n"
            "        else h = m - 1;\n"
            "    }\n"
            "    return -1;\n"
            "}\n"
        ),
        "examples": [
            {"input": "arr = [2, 5, 8, 12, 16, 23, 38], target = 16", "output": "4", "explanation": "Target 16 found at index 4."}
        ],
        "constraints": ["Array is sorted in ascending order.", "O(log n) time."],
        "hints": ["Use mid = low + (high - low) / 2 to prevent integer overflow."],
        "visible_tests": [
            {"initial": [2, 5, 8, 12, 16, 23, 38], "target": 16, "expected": 4, "label": "Target in upper half"},
            {"initial": [10, 20, 30, 40], "target": 10, "expected": 0, "label": "Target at index 0"},
            {"initial": [10, 20, 30, 40], "target": 99, "expected": -1, "label": "Target not present"}
        ],
        "hidden_tests": [
            {"initial": [5], "target": 5, "expected": 0, "label": "Single element hit"},
            {"initial": [1, 3, 5, 7, 9], "target": 9, "expected": 4, "label": "Target at last index"}
        ],
        "harness_type": "array_binary_search"
    },

    # ==========================================
    # STACKS
    # ==========================================
    "stack-parentheses": {
        "id": "stack-parentheses",
        "title": "Valid Balanced Parentheses",
        "category": "Stacks",
        "difficulty": "Medium",
        "visualizer_type": "stack",
        "description": (
            "Given a string `s` containing only brackets '(', ')', '{', '}', '[' and ']', "
            "determine if the input string is valid.\n\n"
            "A string is valid if open brackets are closed by the same type of brackets in the correct LIFO order."
        ),
        "struct_definition": "// Character LIFO stack",
        "function_signature": "int is_valid_parentheses(const char *s);",
        "starter_code": (
            "#include <stdio.h>\n"
            "#include <stdbool.h>\n"
            "#include <string.h>\n\n"
            "int is_valid_parentheses(const char *s) {\n"
            "    char stack[1024];\n"
            "    int top = -1;\n"
            "    \n"
            "    for (int i = 0; s[i] != '\\0'; i++) {\n"
            "        char c = s[i];\n"
            "        if (c == '(' || c == '{' || c == '[') {\n"
            "            stack[++top] = c;\n"
            "        } else {\n"
            "            if (top == -1) return 0;\n"
            "            char open = stack[top--];\n"
            "            if ((c == ')' && open != '(') ||\n"
            "                (c == '}' && open != '{') ||\n"
            "                (c == ']' && open != '[')) {\n"
            "                return 0;\n"
            "            }\n"
            "        }\n"
            "    }\n"
            "    return top == -1 ? 1 : 0;\n"
            "}\n"
        ),
        "solution_code": (
            "#include <stdio.h>\n"
            "#include <stdbool.h>\n\n"
            "int is_valid_parentheses(const char *s) {\n"
            "    char st[1024]; int top = -1;\n"
            "    for (int i = 0; s[i]; i++) {\n"
            "        char c = s[i];\n"
            "        if (c == '(' || c == '{' || c == '[') st[++top] = c;\n"
            "        else {\n"
            "            if (top == -1) return 0;\n"
            "            char o = st[top--];\n"
            "            if ((c == ')' && o != '(') || (c == '}' && o != '{') || (c == ']' && o != '[')) return 0;\n"
            "        }\n"
            "    }\n"
            "    return top == -1 ? 1 : 0;\n"
            "}\n"
        ),
        "examples": [
            {"input": "s = \"()[]{}\"", "output": "1 (True)", "explanation": "All bracket pairs matched properly."},
            {"input": "s = \"(]\"", "output": "0 (False)", "explanation": "Mismatched bracket type."}
        ],
        "constraints": ["1 <= strlen(s) <= 1000"],
        "hints": ["Push opening brackets; pop and compare matching closing brackets."],
        "visible_tests": [
            {"str": "()[]{}", "expected": 1, "label": "Standard matching sequence"},
            {"str": "(]", "expected": 0, "label": "Mismatched closing bracket"},
            {"str": "([{}])", "expected": 1, "label": "Nested matching brackets"}
        ],
        "hidden_tests": [
            {"str": "((((", "expected": 0, "label": "Unclosed openers"},
            {"str": ")))", "expected": 0, "label": "Closing without opener"},
            {"str": "", "expected": 1, "label": "Empty string is valid"}
        ],
        "harness_type": "stack_parentheses"
    },

    # ==========================================
    # TREES
    # ==========================================
    "tree-bst-insert": {
        "id": "tree-bst-insert",
        "title": "Insert into a Binary Search Tree (BST)",
        "category": "Trees",
        "difficulty": "Medium",
        "visualizer_type": "tree",
        "description": (
            "Given the root node `root` of a Binary Search Tree and a value `val` to insert, "
            "insert the value into the BST and return the root of the modified BST.\n\n"
            "Values smaller than the current node must be placed in the left subtree, "
            "and values greater must be placed in the right subtree."
        ),
        "struct_definition": (
            "struct tnode {\n"
            "    int info;\n"
            "    struct tnode *left;\n"
            "    struct tnode *right;\n"
            "};\n"
            "typedef struct tnode *TNODE;"
        ),
        "function_signature": "TNODE bst_insert(TNODE root, int val);",
        "starter_code": (
            "#include <stdio.h>\n"
            "#include <stdlib.h>\n\n"
            "struct tnode {\n"
            "    int info;\n"
            "    struct tnode *left;\n"
            "    struct tnode *right;\n"
            "};\n"
            "typedef struct tnode *TNODE;\n\n"
            "TNODE bst_insert(TNODE root, int val) {\n"
            "    if (root == NULL) {\n"
            "        TNODE temp = (TNODE)malloc(sizeof(struct tnode));\n"
            "        temp->info = val;\n"
            "        temp->left = NULL;\n"
            "        temp->right = NULL;\n"
            "        return temp;\n"
            "    }\n"
            "    if (val < root->info) {\n"
            "        root->left = bst_insert(root->left, val);\n"
            "    } else if (val > root->info) {\n"
            "        root->right = bst_insert(root->right, val);\n"
            "    }\n"
            "    return root;\n"
            "}\n"
        ),
        "solution_code": (
            "#include <stdio.h>\n"
            "#include <stdlib.h>\n\n"
            "struct tnode {\n"
            "    int info;\n"
            "    struct tnode *left;\n"
            "    struct tnode *right;\n"
            "};\n"
            "typedef struct tnode *TNODE;\n\n"
            "TNODE bst_insert(TNODE root, int val) {\n"
            "    if (!root) {\n"
            "        TNODE t = (TNODE)malloc(sizeof(struct tnode));\n"
            "        t->info = val; t->left = t->right = NULL;\n"
            "        return t;\n"
            "    }\n"
            "    if (val < root->info) root->left = bst_insert(root->left, val);\n"
            "    else if (val > root->info) root->right = bst_insert(root->right, val);\n"
            "    return root;\n"
            "}\n"
        ),
        "examples": [
            {"input": "BST: [4, 2, 7], insert: 5", "output": "In-order: [2, 4, 5, 7]", "explanation": "5 inserted as left child of 7."}
        ],
        "constraints": ["BST property holds for all nodes."],
        "hints": ["Base case: root == NULL allocates a new tree leaf."],
        "visible_tests": [
            {"initial": [4, 2, 7], "val": 5, "expected": [2, 4, 5, 7], "label": "Insert into standard BST"},
            {"initial": [], "val": 10, "expected": [10], "label": "Insert into empty tree"}
        ],
        "hidden_tests": [
            {"initial": [50, 30, 70, 20, 40], "val": 35, "expected": [20, 30, 35, 40, 50, 70], "label": "Insert into multi-level tree"}
        ],
        "harness_type": "tree_bst_insert"
    }
}


def get_all_problems() -> List[Dict[str, Any]]:
    """Returns problem summaries for the problem catalog table."""
    summaries = []
    for pid, prob in PROBLEMS.items():
        summaries.append({
            "id": pid,
            "title": prob["title"],
            "category": prob["category"],
            "difficulty": prob["difficulty"],
            "visualizer_type": prob.get("visualizer_type", "generic"),
            "function_signature": prob["function_signature"],
            "examples_count": len(prob.get("examples", [])),
            "test_cases_count": len(prob.get("visible_tests", [])) + len(prob.get("hidden_tests", []))
        })
    return summaries


def get_problem_by_id(problem_id: str) -> Optional[Dict[str, Any]]:
    return PROBLEMS.get(problem_id)


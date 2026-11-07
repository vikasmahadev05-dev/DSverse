"""
DSVERSE - DS Detective: Computer Science Debugging & Code Analysis Laboratory.
Pure academic diagnostic modules without gamification or XP.
"""

from typing import List, Dict, Any

DEBUG_CASES: List[Dict[str, Any]] = [
    {
        "id": "c_ptr_01",
        "title": "Diagnosis #01: Dangling Pointer & Premature Free",
        "category": "Pointer Manipulation",
        "difficulty": "Intermediate",
        "scenario": (
            "A student wrote a function in C to delete a node at a given position in a Singly Linked List. "
            "Under valgrind / memory sanitizer, the program encounters 'Segmentation Fault: Use After Free'. "
            "Inspect the C source code and pinpoint the defect."
        ),
        "c_code": (
            "NODE delete_at_pos(NODE start, int pos) {\n"
            "    NODE curr = start, temp;\n"
            "    for (int i = 0; i < pos - 1 && curr != NULL; i++) {\n"
            "        curr = curr->next;\n"
            "    }\n"
            "    temp = curr->next;\n"
            "    free(temp);             // <-- Line 7: Look closely!\n"
            "    curr->next = temp->next;// <-- Line 8: Accessing freed memory!\n"
            "    return start;\n"
            "}"
        ),
        "options": [
            "Line 7 deallocates 'temp' before Line 8 reads 'temp->next', creating an undefined 'Use-After-Free' memory corruption.",
            "The loop condition 'curr != NULL' causes an off-by-one pointer bypass.",
            "The function signature should return void instead of NODE.",
            "free() cannot be invoked on a pointer to a struct in C."
        ],
        "correct_option": 0,
        "academic_explanation": (
            "CRITICAL POINTER ERROR (Use-After-Free): In line 7, free(temp) immediately returns the memory block to the "
            "heap allocator. In line 8, temp->next dereferences a pointer that is no longer valid. The correct sequence is "
            "to bridge the link first (curr->next = temp->next;) and only then release the node memory (free(temp);)."
        )
    },
    {
        "id": "c_ptr_02",
        "title": "Diagnosis #02: Unchecked malloc() Null Dereference",
        "category": "Memory Allocation",
        "difficulty": "Beginner",
        "scenario": (
            "Review this C insertion function. Under constrained memory environments, this function triggers an immediate "
            "kernel panic / crash. Identify the missing safeguard."
        ),
        "c_code": (
            "NODE insert_head(NODE start, int data) {\n"
            "    NODE new_node = (NODE)malloc(sizeof(struct Node));\n"
            "    new_node->data = data; // Crash if malloc returns NULL!\n"
            "    new_node->next = start;\n"
            "    start = new_node;\n"
            "    return start;\n"
            "}"
        ),
        "options": [
            "Missing NULL pointer check: If heap allocation fails, malloc() returns NULL, and new_node->data dereferences address 0x0.",
            "new_node->next should be set to NULL before start.",
            "malloc() requires the stdio.h header instead of stdlib.h.",
            "Type casting (NODE) is invalid syntax in ANSI C."
        ],
        "correct_option": 0,
        "academic_explanation": (
            "DEFENSIVE PROGRAMMING VIOLATION: malloc() can fail if the heap is exhausted, in which case it returns NULL. "
            "Dereferencing a NULL pointer (new_node->data) causes an immediate segmentation violation (SIGSEGV). A professional "
            "C implementation must always verify 'if (new_node == NULL) { return start; }' before accessing fields."
        )
    },
    {
        "id": "c_ptr_03",
        "title": "Diagnosis #03: Fast/Slow Pointer Null Dereference",
        "category": "Cycle Detection & Fast/Slow Pointer",
        "difficulty": "Advanced",
        "scenario": (
            "A linked list cycle detection routine crashes on lists with an odd number of nodes. Identify the exact condition fault."
        ),
        "c_code": (
            "int has_cycle(NODE start) {\n"
            "    NODE slow = start, fast = start;\n"
            "    while (fast != NULL) {        // <-- Line 3: Look at the while guard\n"
            "        slow = slow->next;\n"
            "        fast = fast->next->next;  // <-- Line 5: What if fast->next is NULL?\n"
            "        if (slow == fast) return 1;\n"
            "    }\n"
            "    return 0;\n"
            "}"
        ),
        "options": [
            "Line 3 only verifies 'fast != NULL', but Line 5 advances by two steps ('fast->next->next'). If fast is the tail node, fast->next is NULL, so fast->next->next dereferences NULL.",
            "slow and fast must be initialized to start and start->next respectively.",
            "Floyd's algorithm requires O(n) auxiliary space.",
            "slow pointer moves too quickly relative to fast."
        ],
        "correct_option": 0,
        "academic_explanation": (
            "GUARD CONDITION FLAW: Because 'fast' takes two steps per iteration, we must guarantee both that 'fast' is not NULL "
            "AND that 'fast->next' is not NULL before attempting to read 'fast->next->next'. The correct guard is "
            "'while (fast != NULL && fast->next != NULL)'."
        )
    }
]


def get_diagnostic_cases() -> List[Dict[str, Any]]:
    return DEBUG_CASES


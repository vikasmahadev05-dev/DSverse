"""
DS Detective - Interactive Code Debugging & Mystery Cases.
Users inspect buggy DSA code snippets, diagnose the root cause, and earn XP.
"""

CASES = [
    {
        "id": "case_1",
        "title": "Case #101: The Vanishing Base Case",
        "difficulty": "Easy",
        "reward_xp": 50,
        "story": "A junior developer built a recursive function to compute the factorial of a number, but when users submit requests, the entire server crashes with a 'RecursionError: maximum recursion depth exceeded'. Can you find the culprit?",
        "buggy_code": """def factorial(n):
    # Bug here: what happens when n reaches 0 or 1?
    return n * factorial(n - 1)
""",
        "options": [
            "Missing base case: It needs `if n <= 1: return 1` to stop infinite recursion",
            "It should be `n + factorial(n - 1)` instead of multiplication",
            "Factorial cannot be solved with recursion in Python",
            "The argument should be `factorial(n + 1)`"
        ],
        "correct_option": 0,
        "explanation": "Without a base case (`if n <= 1: return 1`), the recursion continues indefinitely until Python's call stack reaches its recursion limit and throws a RecursionError."
    },
    {
        "id": "case_2",
        "title": "Case #102: The Elusive Target",
        "difficulty": "Medium",
        "reward_xp": 75,
        "story": "A search module is occasionally getting stuck in an infinite loop when a number isn't present in the array. Inspect this Binary Search implementation and identify the bug.",
        "buggy_code": """def binary_search(arr, target):
    left = 0
    right = len(arr) - 1

    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid     # <-- Look closely!
        else:
            right = mid    # <-- Look closely!
    return -1
""",
        "options": [
            "The loop condition should be `while left < right` only",
            "`left` and `right` should be updated to `mid + 1` and `mid - 1` to shrink the search space",
            "Array must be reverse sorted for binary search",
            "`mid` should be `(left - right) // 2`"
        ],
        "correct_option": 1,
        "explanation": "If `left = mid` or `right = mid`, when `right - left == 1`, `mid` never changes, leading to an infinite while loop. Updating `left = mid + 1` and `right = mid - 1` excludes the already-checked `mid` and ensures convergence."
    },
    {
        "id": "case_3",
        "title": "Case #103: The Phantom Cycle",
        "difficulty": "Hard",
        "reward_xp": 100,
        "story": "A linked list cycle detection algorithm (Floyd's Tortoise and Hare) was written, but it causes an 'AttributeError: 'NoneType' object has no attribute 'next'' on short linked lists. Find the error.",
        "buggy_code": """def has_cycle(head):
    slow = head
    fast = head

    while fast.next is not None:  # <-- Bug!
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False
""",
        "options": [
            "`fast` must move 3 steps instead of 2 steps",
            "The loop condition must also check `while fast and fast.next:` before accessing `fast.next.next`",
            "The algorithm should compare `slow.val == fast.val` instead of node references",
            "Cycle detection is impossible without a HashSet"
        ],
        "correct_option": 1,
        "explanation": "Because `fast` moves by two steps (`fast.next.next`), we must verify that both `fast` AND `fast.next` are not None before checking or advancing, otherwise accessing `fast.next.next` crashes on odd-length lists."
    }
]


def get_case(case_id):
    """Retrieve case details by id."""
    for c in CASES:
        if c["id"] == case_id:
            return c
    return None


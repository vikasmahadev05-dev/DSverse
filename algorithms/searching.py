"""
Searching algorithms with step-by-step state recording for visualizers.
"""

def linear_search_steps(arr, target):
    """Yields steps of Linear Search: (arr, current_idx, found_idx, status_message)"""
    for i, val in enumerate(arr):
        if val == target:
            yield arr, i, i, f"Target {target} found at index [{i}]!"
            return
        else:
            yield arr, i, None, f"Checking index [{i}]: {val} != {target}"
    yield arr, None, None, f"Target {target} was not found in the array."


def binary_search_steps(sorted_arr, target):
    """Yields steps of Binary Search: (arr, left, mid, right, found_idx, status_message)"""
    left = 0
    right = len(sorted_arr) - 1

    yield sorted_arr, left, None, right, None, f"Initial search range: indices [{left}] to [{right}]."

    while left <= right:
        mid = (left + right) // 2
        mid_val = sorted_arr[mid]

        yield sorted_arr, left, mid, right, None, f"Calculated mid = [{mid}] with value {mid_val}."

        if mid_val == target:
            yield sorted_arr, left, mid, right, mid, f"Target {target} found at index [{mid}]!"
            return
        elif mid_val < target:
            left = mid + 1
            yield sorted_arr, left, mid, right, None, f"{mid_val} < {target}. Target must be in the right half. New left = [{left}]."
        else:
            right = mid - 1
            yield sorted_arr, left, mid, right, None, f"{mid_val} > {target}. Target must be in the left half. New right = [{right}]."

    yield sorted_arr, left, None, right, None, f"Target {target} not found in the array."


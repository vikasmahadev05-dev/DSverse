"""
DSVERSE - Algorithm Lab: Searching Algorithms Engine.
Step-by-step state tracker with 1-to-1 C Source Code line mapping.
"""

from typing import List, Dict, Any

C_SEARCH_SNIPPETS = {
    "linear_search": (
        "int linear_search(int arr[], int n, int key)\n"
        "{\n"
        "    int i;\n"
        "    for (i = 0; i < n; i++) {\n"
        "        if (arr[i] == key) {\n"
        "            return i; // Found target at index i\n"
        "        }\n"
        "    }\n"
        "    return -1; // Element not found\n"
        "}"
    ),
    "binary_search": (
        "int binary_search(int arr[], int n, int key)\n"
        "{\n"
        "    int low = 0, high = n - 1, mid;\n"
        "    while (low <= high) {\n"
        "        mid = low + (high - low) / 2;\n"
        "        if (arr[mid] == key)\n"
        "            return mid; // Match found\n"
        "        else if (arr[mid] < key)\n"
        "            low = mid + 1; // Narrow to right half\n"
        "        else\n"
        "            high = mid - 1; // Narrow to left half\n"
        "    }\n"
        "    return -1; // Target not found\n"
        "}"
    )
}


def run_linear_search(arr: List[int], key: int) -> Dict[str, Any]:
    n = len(arr)
    steps = []
    step_num = 1
    comparisons = 0
    found_idx = -1

    steps.append({
        "step_number": step_num,
        "description": f"Beginning sequential scan across array of size {n} for target key = {key}.",
        "array": arr.copy(),
        "active_index": None,
        "found_index": None,
        "c_line": 4,
        "c_explanation": "for (i = 0; i < n; i++) // Starting linear scan from index 0",
        "comparisons": comparisons
    })
    step_num += 1

    for i in range(n):
        comparisons += 1
        steps.append({
            "step_number": step_num,
            "description": f"Checking index [{i}]: arr[{i}] = {arr[i]} vs key = {key}.",
            "array": arr.copy(),
            "active_index": i,
            "found_index": None,
            "c_line": 5,
            "c_explanation": f"if (arr[{i}] == key) // Testing equality",
            "comparisons": comparisons
        })
        step_num += 1

        if arr[i] == key:
            found_idx = i
            steps.append({
                "step_number": step_num,
                "description": f"🎯 Element found at index [{i}]! Total comparisons: {comparisons}.",
                "array": arr.copy(),
                "active_index": i,
                "found_index": i,
                "c_line": 6,
                "c_explanation": f"return {i}; // Target match found at index {i}",
                "comparisons": comparisons
            })
            break

    if found_idx == -1:
        steps.append({
            "step_number": step_num,
            "description": f"Exhausted all elements. Key {key} is NOT present in array.",
            "array": arr.copy(),
            "active_index": None,
            "found_index": None,
            "c_line": 9,
            "c_explanation": "return -1; // Returning sentinel indicating key absent",
            "comparisons": comparisons
        })

    return {
        "algorithm": "Linear Search",
        "steps": steps,
        "c_code": C_SEARCH_SNIPPETS["linear_search"],
        "found": found_idx != -1,
        "found_index": found_idx,
        "complexity": {
            "time_best": "O(1) [First element]",
            "time_avg": "O(n)",
            "time_worst": "O(n)",
            "space_auxiliary": "O(1)"
        },
        "metrics": {
            "total_comparisons": comparisons,
            "element_count": n
        }
    }


def run_binary_search(arr: List[int], key: int) -> Dict[str, Any]:
    sorted_arr = sorted(arr)
    n = len(sorted_arr)
    steps = []
    step_num = 1
    comparisons = 0
    found_idx = -1

    low = 0
    high = n - 1

    steps.append({
        "step_number": step_num,
        "description": f"Initialized search window: low = 0, high = {high}. Target = {key}.",
        "array": sorted_arr.copy(),
        "low": low,
        "high": high,
        "mid": None,
        "found_index": None,
        "c_line": 3,
        "c_explanation": f"int low = 0, high = {high}; // Window bounded between index 0 and {high}",
        "comparisons": comparisons
    })
    step_num += 1

    while low <= high:
        mid = (low + high) // 2
        comparisons += 1

        steps.append({
            "step_number": step_num,
            "description": f"Calculated mid = ({low} + {high}) / 2 = {mid}. arr[{mid}] = {sorted_arr[mid]}.",
            "array": sorted_arr.copy(),
            "low": low,
            "high": high,
            "mid": mid,
            "found_index": None,
            "c_line": 5,
            "c_explanation": f"mid = low + (high - low) / 2; // Midpoint is index {mid}",
            "comparisons": comparisons
        })
        step_num += 1

        if sorted_arr[mid] == key:
            found_idx = mid
            steps.append({
                "step_number": step_num,
                "description": f"🎯 MATCH FOUND! arr[{mid}] == {key}. Success in {comparisons} comparisons!",
                "array": sorted_arr.copy(),
                "low": low,
                "high": high,
                "mid": mid,
                "found_index": mid,
                "c_line": 7,
                "c_explanation": f"return {mid}; // Found key at mid index",
                "comparisons": comparisons
            })
            break
        elif sorted_arr[mid] < key:
            low = mid + 1
            steps.append({
                "step_number": step_num,
                "description": f"arr[{mid}] ({sorted_arr[mid]}) < {key}. Key must be in right half. New low = {low}.",
                "array": sorted_arr.copy(),
                "low": low,
                "high": high,
                "mid": mid,
                "found_index": None,
                "c_line": 9,
                "c_explanation": f"low = mid + 1; // Discarding left half (indices <= {mid})",
                "comparisons": comparisons
            })
            step_num += 1
        else:
            high = mid - 1
            steps.append({
                "step_number": step_num,
                "description": f"arr[{mid}] ({sorted_arr[mid]}) > {key}. Key must be in left half. New high = {high}.",
                "array": sorted_arr.copy(),
                "low": low,
                "high": high,
                "mid": mid,
                "found_index": None,
                "c_line": 11,
                "c_explanation": f"high = mid - 1; // Discarding right half (indices >= {mid})",
                "comparisons": comparisons
            })
            step_num += 1

    if found_idx == -1:
        steps.append({
            "step_number": step_num,
            "description": f"Search window empty (low > high). Target {key} not found.",
            "array": sorted_arr.copy(),
            "low": low,
            "high": high,
            "mid": None,
            "found_index": None,
            "c_line": 13,
            "c_explanation": "return -1; // Search concluded without finding key",
            "comparisons": comparisons
        })

    return {
        "algorithm": "Binary Search",
        "steps": steps,
        "c_code": C_SEARCH_SNIPPETS["binary_search"],
        "found": found_idx != -1,
        "found_index": found_idx,
        "complexity": {
            "time_best": "O(1) [Exact middle]",
            "time_avg": "O(log n)",
            "time_worst": "O(log n)",
            "space_auxiliary": "O(1)"
        },
        "metrics": {
            "total_comparisons": comparisons,
            "element_count": n
        }
    }


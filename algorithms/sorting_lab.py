"""
DSVERSE - Algorithm Lab: Sorting Algorithms Engine.
Step-by-step state tracker with 1-to-1 C Source Code line mapping.
"""

from typing import List, Dict, Any, Generator, Tuple

C_SORT_SNIPPETS = {
    "bubble_sort": (
        "void bubble_sort(int arr[], int n)\n"
        "{\n"
        "    int i, j, temp;\n"
        "    for (i = 0; i < n - 1; i++) {\n"
        "        for (j = 0; j < n - i - 1; j++) {\n"
        "            if (arr[j] > arr[j + 1]) {\n"
        "                temp = arr[j];\n"
        "                arr[j] = arr[j + 1];\n"
        "                arr[j + 1] = temp;\n"
        "            }\n"
        "        }\n"
        "    }\n"
        "}"
    ),
    "selection_sort": (
        "void selection_sort(int arr[], int n)\n"
        "{\n"
        "    int i, j, min_idx, temp;\n"
        "    for (i = 0; i < n - 1; i++) {\n"
        "        min_idx = i;\n"
        "        for (j = i + 1; j < n; j++) {\n"
        "            if (arr[j] < arr[min_idx])\n"
        "                min_idx = j;\n"
        "        }\n"
        "        temp = arr[min_idx];\n"
        "        arr[min_idx] = arr[i];\n"
        "        arr[i] = temp;\n"
        "    }\n"
        "}"
    ),
    "insertion_sort": (
        "void insertion_sort(int arr[], int n)\n"
        "{\n"
        "    int i, key, j;\n"
        "    for (i = 1; i < n; i++) {\n"
        "        key = arr[i];\n"
        "        j = i - 1;\n"
        "        while (j >= 0 && arr[j] > key) {\n"
        "            arr[j + 1] = arr[j];\n"
        "            j = j - 1;\n"
        "        }\n"
        "        arr[j + 1] = key;\n"
        "    }\n"
        "}"
    ),
    "quick_sort": (
        "void quick_sort(int arr[], int low, int high)\n"
        "{\n"
        "    if (low < high) {\n"
        "        int pi = partition(arr, low, high);\n"
        "        quick_sort(arr, low, pi - 1);\n"
        "        quick_sort(arr, pi + 1, high);\n"
        "    }\n"
        "}\n"
        "int partition(int arr[], int low, int high) {\n"
        "    int pivot = arr[high], i = (low - 1), j, temp;\n"
        "    for (j = low; j < high; j++) {\n"
        "        if (arr[j] < pivot) {\n"
        "            i++;\n"
        "            temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;\n"
        "        }\n"
        "    }\n"
        "    temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;\n"
        "    return (i + 1);\n"
        "}"
    )
}


def run_bubble_sort(arr: List[int]) -> Dict[str, Any]:
    a = arr.copy()
    n = len(a)
    steps = []
    step_num = 1
    comparisons = 0
    swaps = 0
    sorted_idx = []

    steps.append({
        "step_number": step_num,
        "description": "Initial array state before Bubble Sort.",
        "array": a.copy(),
        "active_indices": [],
        "sorted_indices": sorted_idx.copy(),
        "c_line": 4,
        "c_explanation": "for (i = 0; i < n - 1; i++) // Outer pass loop initialization",
        "comparisons": comparisons,
        "swaps": swaps
    })
    step_num += 1

    for i in range(n - 1):
        for j in range(n - i - 1):
            comparisons += 1
            steps.append({
                "step_number": step_num,
                "description": f"Comparing arr[{j}] ({a[j]}) and arr[{j+1}] ({a[j+1]}).",
                "array": a.copy(),
                "active_indices": [j, j + 1],
                "sorted_indices": sorted_idx.copy(),
                "c_line": 6,
                "c_explanation": f"if (arr[{j}] > arr[{j+1}]) // Checking if {a[j]} > {a[j+1]}",
                "comparisons": comparisons,
                "swaps": swaps
            })
            step_num += 1

            if a[j] > a[j + 1]:
                swaps += 1
                a[j], a[j + 1] = a[j + 1], a[j]
                steps.append({
                    "step_number": step_num,
                    "description": f"Swapped arr[{j}] and arr[{j+1}]. Inversion corrected.",
                    "array": a.copy(),
                    "active_indices": [j, j + 1],
                    "sorted_indices": sorted_idx.copy(),
                    "c_line": 8,
                    "c_explanation": "temp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = temp; // In-place element swap",
                    "comparisons": comparisons,
                    "swaps": swaps
                })
                step_num += 1

        sorted_idx.append(n - i - 1)

    sorted_idx = list(range(n))
    steps.append({
        "step_number": step_num,
        "description": "Bubble Sort completed. All elements in monotonic non-decreasing order.",
        "array": a.copy(),
        "active_indices": [],
        "sorted_indices": sorted_idx,
        "c_line": 13,
        "c_explanation": "} // End of function bubble_sort",
        "comparisons": comparisons,
        "swaps": swaps
    })

    return {
        "algorithm": "Bubble Sort",
        "steps": steps,
        "c_code": C_SORT_SNIPPETS["bubble_sort"],
        "complexity": {
            "time_best": "O(n)",
            "time_avg": "O(n²)",
            "time_worst": "O(n²)",
            "space_auxiliary": "O(1)"
        },
        "metrics": {
            "total_comparisons": comparisons,
            "total_swaps": swaps,
            "element_count": n
        }
    }


def run_selection_sort(arr: List[int]) -> Dict[str, Any]:
    a = arr.copy()
    n = len(a)
    steps = []
    step_num = 1
    comparisons = 0
    swaps = 0
    sorted_idx = []

    steps.append({
        "step_number": step_num,
        "description": "Initial array state before Selection Sort.",
        "array": a.copy(),
        "active_indices": [],
        "sorted_indices": sorted_idx.copy(),
        "c_line": 4,
        "c_explanation": "for (i = 0; i < n - 1; i++) // Starting pass to find minimum element",
        "comparisons": comparisons,
        "swaps": swaps
    })
    step_num += 1

    for i in range(n - 1):
        min_idx = i
        steps.append({
            "step_number": step_num,
            "description": f"Pass {i+1}: Assumed minimum at index [{i}] (value {a[i]}).",
            "array": a.copy(),
            "active_indices": [min_idx],
            "sorted_indices": sorted_idx.copy(),
            "c_line": 5,
            "c_explanation": f"min_idx = {i}; // Initializing min_idx to start of unsorted subarray",
            "comparisons": comparisons,
            "swaps": swaps
        })
        step_num += 1

        for j in range(i + 1, n):
            comparisons += 1
            steps.append({
                "step_number": step_num,
                "description": f"Scanning arr[{j}] ({a[j]}) vs current min arr[{min_idx}] ({a[min_idx]}).",
                "array": a.copy(),
                "active_indices": [min_idx, j],
                "sorted_indices": sorted_idx.copy(),
                "c_line": 7,
                "c_explanation": f"if (arr[{j}] < arr[{min_idx}]) // Checking for new minimum",
                "comparisons": comparisons,
                "swaps": swaps
            })
            step_num += 1

            if a[j] < a[min_idx]:
                min_idx = j
                steps.append({
                    "step_number": step_num,
                    "description": f"New minimum found: arr[{min_idx}] = {a[min_idx]}.",
                    "array": a.copy(),
                    "active_indices": [min_idx],
                    "sorted_indices": sorted_idx.copy(),
                    "c_line": 8,
                    "c_explanation": f"min_idx = {min_idx}; // Updated index of minimum element",
                    "comparisons": comparisons,
                    "swaps": swaps
                })
                step_num += 1

        if min_idx != i:
            swaps += 1
            a[i], a[min_idx] = a[min_idx], a[i]
            steps.append({
                "step_number": step_num,
                "description": f"Placed minimum value {a[i]} into sorted position index [{i}].",
                "array": a.copy(),
                "active_indices": [i, min_idx],
                "sorted_indices": sorted_idx.copy(),
                "c_line": 11,
                "c_explanation": "temp = arr[min_idx]; arr[min_idx] = arr[i]; arr[i] = temp; // Swapping minimum into place",
                "comparisons": comparisons,
                "swaps": swaps
            })
            step_num += 1

        sorted_idx.append(i)

    sorted_idx = list(range(n))
    steps.append({
        "step_number": step_num,
        "description": "Selection Sort completed.",
        "array": a.copy(),
        "active_indices": [],
        "sorted_indices": sorted_idx,
        "c_line": 14,
        "c_explanation": "} // End of function selection_sort",
        "comparisons": comparisons,
        "swaps": swaps
    })

    return {
        "algorithm": "Selection Sort",
        "steps": steps,
        "c_code": C_SORT_SNIPPETS["selection_sort"],
        "complexity": {
            "time_best": "O(n²)",
            "time_avg": "O(n²)",
            "time_worst": "O(n²)",
            "space_auxiliary": "O(1)"
        },
        "metrics": {
            "total_comparisons": comparisons,
            "total_swaps": swaps,
            "element_count": n
        }
    }


def run_insertion_sort(arr: List[int]) -> Dict[str, Any]:
    a = arr.copy()
    n = len(a)
    steps = []
    step_num = 1
    comparisons = 0
    swaps = 0
    sorted_idx = [0]

    steps.append({
        "step_number": step_num,
        "description": "Initial array state. Element arr[0] is trivially sorted.",
        "array": a.copy(),
        "active_indices": [0],
        "sorted_indices": sorted_idx.copy(),
        "c_line": 4,
        "c_explanation": "for (i = 1; i < n; i++) // Starting insertion from index 1",
        "comparisons": comparisons,
        "swaps": swaps
    })
    step_num += 1

    for i in range(1, n):
        key = a[i]
        j = i - 1
        steps.append({
            "step_number": step_num,
            "description": f"Selected key = arr[{i}] ({key}) to insert into sorted prefix.",
            "array": a.copy(),
            "active_indices": [i],
            "sorted_indices": sorted_idx.copy(),
            "c_line": 5,
            "c_explanation": f"key = arr[{i}]; // Storing value to insert",
            "comparisons": comparisons,
            "swaps": swaps
        })
        step_num += 1

        while j >= 0:
            comparisons += 1
            if a[j] > key:
                swaps += 1
                a[j + 1] = a[j]
                steps.append({
                    "step_number": step_num,
                    "description": f"arr[{j}] ({a[j]}) > key ({key}): Shifted arr[{j}] right to index [{j+1}].",
                    "array": a.copy(),
                    "active_indices": [j, j + 1],
                    "sorted_indices": sorted_idx.copy(),
                    "c_line": 8,
                    "c_explanation": "arr[j + 1] = arr[j]; // Shifting greater element forward",
                    "comparisons": comparisons,
                    "swaps": swaps
                })
                step_num += 1
                j -= 1
            else:
                break

        a[j + 1] = key
        sorted_idx.append(i)
        steps.append({
            "step_number": step_num,
            "description": f"Inserted key ({key}) into correct position index [{j+1}].",
            "array": a.copy(),
            "active_indices": [j + 1],
            "sorted_indices": sorted_idx.copy(),
            "c_line": 11,
            "c_explanation": f"arr[{j + 1}] = key; // Inserting key into calculated spot",
            "comparisons": comparisons,
            "swaps": swaps
        })
        step_num += 1

    sorted_idx = list(range(n))
    return {
        "algorithm": "Insertion Sort",
        "steps": steps,
        "c_code": C_SORT_SNIPPETS["insertion_sort"],
        "complexity": {
            "time_best": "O(n)",
            "time_avg": "O(n²)",
            "time_worst": "O(n²)",
            "space_auxiliary": "O(1)"
        },
        "metrics": {
            "total_comparisons": comparisons,
            "total_swaps": swaps,
            "element_count": n
        }
    }


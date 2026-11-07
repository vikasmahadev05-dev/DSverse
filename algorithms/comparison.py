"""
DSVERSE - Algorithm Performance Comparison Engine.
Executes dual algorithms side-by-side on identical input arrays to compare
theoretical complexity, exact operation counts (comparisons/swaps), and execution time.
"""

import time
from typing import List, Dict, Any


def compare_sorting_algorithms(arr: List[int], algo1: str, algo2: str) -> Dict[str, Any]:
    """Runs two sorting algorithms on identical data and produces side-by-side analysis."""
    
    results = {}
    for name in [algo1, algo2]:
        a = arr.copy()
        n = len(a)
        comps = 0
        swaps = 0
        t0 = time.perf_counter()

        if name == "bubble_sort":
            for i in range(n - 1):
                swapped = False
                for j in range(n - i - 1):
                    comps += 1
                    if a[j] > a[j + 1]:
                        a[j], a[j + 1] = a[j + 1], a[j]
                        swaps += 1
                        swapped = True
                if not swapped:
                    break
            results[name] = {
                "display_name": "Bubble Sort",
                "comparisons": comps,
                "swaps": swaps,
                "time_ms": round((time.perf_counter() - t0) * 1000, 4),
                "time_complexity": "O(n²)",
                "space_complexity": "O(1)",
                "stable": True
            }

        elif name == "selection_sort":
            for i in range(n - 1):
                min_idx = i
                for j in range(i + 1, n):
                    comps += 1
                    if a[j] < a[min_idx]:
                        min_idx = j
                if min_idx != i:
                    a[i], a[min_idx] = a[min_idx], a[i]
                    swaps += 1
            results[name] = {
                "display_name": "Selection Sort",
                "comparisons": comps,
                "swaps": swaps,
                "time_ms": round((time.perf_counter() - t0) * 1000, 4),
                "time_complexity": "O(n²)",
                "space_complexity": "O(1)",
                "stable": False
            }

        elif name == "insertion_sort":
            for i in range(1, n):
                key = a[i]
                j = i - 1
                while j >= 0:
                    comps += 1
                    if a[j] > key:
                        a[j + 1] = a[j]
                        swaps += 1
                        j -= 1
                    else:
                        break
                a[j + 1] = key
            results[name] = {
                "display_name": "Insertion Sort",
                "comparisons": comps,
                "swaps": swaps,
                "time_ms": round((time.perf_counter() - t0) * 1000, 4),
                "time_complexity": "O(n²)",
                "space_complexity": "O(1)",
                "stable": True
            }

        elif name == "quick_sort":
            def qsort(lst, low, high):
                nonlocal comps, swaps
                if low < high:
                    pivot = lst[high]
                    i = low - 1
                    for j in range(low, high):
                        comps += 1
                        if lst[j] < pivot:
                            i += 1
                            lst[i], lst[j] = lst[j], lst[i]
                            swaps += 1
                    lst[i + 1], lst[high] = lst[high], lst[i + 1]
                    swaps += 1
                    p_idx = i + 1
                    qsort(lst, low, p_idx - 1)
                    qsort(lst, p_idx + 1, high)

            qsort(a, 0, n - 1)
            results[name] = {
                "display_name": "Quick Sort",
                "comparisons": comps,
                "swaps": swaps,
                "time_ms": round((time.perf_counter() - t0) * 1000, 4),
                "time_complexity": "O(n log n)",
                "space_complexity": "O(log n)",
                "stable": False
            }

    # Comparative analysis synthesis
    r1 = results[algo1]
    r2 = results[algo2]

    explanation = ""
    if r1["comparisons"] < r2["comparisons"]:
        explanation = f"{r1['display_name']} performed fewer comparisons ({r1['comparisons']} vs {r2['comparisons']}). "
    elif r2["comparisons"] < r1["comparisons"]:
        explanation = f"{r2['display_name']} performed fewer comparisons ({r2['comparisons']} vs {r1['comparisons']}). "
    else:
        explanation = f"Both algorithms required identical comparison counts ({r1['comparisons']}). "

    if r1["swaps"] < r2["swaps"]:
        explanation += f"However, {r1['display_name']} was more efficient in memory writes/swaps ({r1['swaps']} vs {r2['swaps']})."
    elif r2["swaps"] < r1["swaps"]:
        explanation += f"However, {r2['display_name']} was more efficient in memory writes/swaps ({r2['swaps']} vs {r1['swaps']})."

    return {
        "input_size": len(arr),
        "input_sample": arr[:15],
        "algorithm_1": r1,
        "algorithm_2": r2,
        "comparative_analysis": explanation
    }


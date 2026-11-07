"""
Sorting algorithms with step-by-step state recording for visualizers.
Each function yields a tuple: (current_array_state, active_indices, sorted_indices, description)
"""

def bubble_sort_steps(arr):
    """Yields steps of Bubble Sort."""
    a = arr.copy()
    n = len(a)
    sorted_idx = []

    yield a.copy(), [], sorted_idx.copy(), "Initial unsorted array."

    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            yield a.copy(), [j, j + 1], sorted_idx.copy(), f"Comparing {a[j]} and {a[j+1]}"
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
                yield a.copy(), [j, j + 1], sorted_idx.copy(), f"Swapped {a[j+1]} and {a[j]}"
        sorted_idx.append(n - i - 1)
        yield a.copy(), [], sorted_idx.copy(), f"Element {a[n - i - 1]} is in its sorted position."
        if not swapped:
            break

    sorted_idx = list(range(n))
    yield a.copy(), [], sorted_idx, "Sorting complete!"


def selection_sort_steps(arr):
    """Yields steps of Selection Sort."""
    a = arr.copy()
    n = len(a)
    sorted_idx = []

    yield a.copy(), [], sorted_idx.copy(), "Initial unsorted array."

    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            yield a.copy(), [min_idx, j], sorted_idx.copy(), f"Comparing min element {a[min_idx]} with {a[j]}"
            if a[j] < a[min_idx]:
                min_idx = j
                yield a.copy(), [min_idx], sorted_idx.copy(), f"New minimum found: {a[min_idx]}"

        if min_idx != i:
            a[i], a[min_idx] = a[min_idx], a[i]
            yield a.copy(), [i, min_idx], sorted_idx.copy(), f"Swapped {a[min_idx]} with {a[i]}"
        
        sorted_idx.append(i)
        yield a.copy(), [], sorted_idx.copy(), f"Element {a[i]} is in its sorted position."

    sorted_idx = list(range(n))
    yield a.copy(), [], sorted_idx, "Sorting complete!"


def insertion_sort_steps(arr):
    """Yields steps of Insertion Sort."""
    a = arr.copy()
    n = len(a)
    sorted_idx = [0]

    yield a.copy(), [0], sorted_idx.copy(), "Initial array. First element is considered sorted."

    for i in range(1, n):
        key = a[i]
        j = i - 1
        yield a.copy(), [i], sorted_idx.copy(), f"Selected key {key} to insert into sorted portion."
        
        while j >= 0 and a[j] > key:
            yield a.copy(), [j, j + 1], sorted_idx.copy(), f"{a[j]} > {key}, shifting {a[j]} to the right."
            a[j + 1] = a[j]
            j -= 1
            yield a.copy(), [j + 1], sorted_idx.copy(), "Shifted element."
        
        a[j + 1] = key
        sorted_idx.append(i)
        yield a.copy(), [j + 1], sorted_idx.copy(), f"Inserted key {key} at index {j + 1}."

    sorted_idx = list(range(n))
    yield a.copy(), [], sorted_idx, "Sorting complete!"


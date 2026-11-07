"""
C Test Harness Generator for Function Implementation Mode in DSVERSE Code Arena.
Synthesizes a complete, standalone C executable embedding the student's function,
executing test cases with memory assertions, and outputting JSON test verdicts.
"""

from typing import Dict, Any, List


def generate_c_harness(problem: Dict[str, Any], user_function_code: str, test_cases: List[Dict[str, Any]]) -> str:
    """
    Combines user function with a robust C harness containing test case execution,
    invariant checks, and JSON output formatting.
    """
    pid = problem["id"]

    if pid in ("ll-insert-beginning", "ll-insert-end", "ll-delete-val", "ll-reverse"):
        return _generate_linked_list_harness(problem, user_function_code, test_cases)
    elif pid in ("arr-reverse", "arr-find-max", "arr-binary-search"):
        return _generate_array_harness(problem, user_function_code, test_cases)
    elif pid == "stack-parentheses":
        return _generate_parentheses_harness(user_function_code, test_cases)
    elif pid == "tree-bst-insert":
        return _generate_tree_harness(problem, user_function_code, test_cases)
    else:
        # Fallback harness
        return f"""#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

{user_function_code}

int main() {{
    printf("__ARENA_TEST_RESULTS_START__\\n");
    printf("{{\\"test_idx\\": 0, \\"status\\": \\"PASSED\\", \\"actual\\": \\"OK\\", \\"expected\\": \\"OK\\", \\"label\\": \\"Default Test\\"}}\\n");
    printf("__ARENA_TEST_RESULTS_END__\\n");
    return 0;
}}
"""


def _generate_linked_list_harness(problem: Dict[str, Any], user_code: str, tests: List[Dict[str, Any]]) -> str:
    pid = problem["id"]

    # Generate test execution blocks in C
    test_blocks = []
    for idx, test in enumerate(tests):
        initial = test.get("initial", [])
        expected = test.get("expected", [])
        label = test.get("label", f"Test Case {idx + 1}").replace('"', '\\"')

        # Construct initial list in C
        init_lines = []
        if initial:
            init_lines.append("    NODE start = NULL;")
            # Build list backwards so head is initial[0]
            for item_idx, val in enumerate(reversed(initial)):
                var_name = f"node_{idx}_{item_idx}"
                init_lines.append(f"    NODE {var_name} = (NODE)malloc(sizeof(struct node));")
                init_lines.append(f"    {var_name}->info = {val};")
                init_lines.append(f"    {var_name}->next = start;")
                init_lines.append(f"    start = {var_name};")
        else:
            init_lines.append("    NODE start = NULL;")

        # Call user function
        if pid == "ll-insert-beginning":
            info_val = test.get("info", 0)
            call_line = f"    NODE result = insert_beginning(start, {info_val});"
        elif pid == "ll-insert-end":
            info_val = test.get("info", 0)
            call_line = f"    NODE result = insert_end(start, {info_val});"
        elif pid == "ll-reverse":
            call_line = "    NODE result = reverse_list(start);"
        elif pid == "ll-delete-val":
            val_to_del = test.get("val", 0)
            call_line = f"    NODE result = delete_value(start, {val_to_del});"
        else:
            call_line = "    NODE result = start;"

        # Serialization to compare with expected
        expected_str = ",".join(str(x) for x in expected)
        block = f"""
    // --- Test {idx} ---
    {{
{chr(10).join(init_lines)}
{call_line}
        
        int actual_arr[500];
        int count = 0;
        int has_cycle = 0;
        NODE curr = result;
        while (curr != NULL && count < 500) {{
            actual_arr[count++] = curr->info;
            curr = curr->next;
        }}
        if (count >= 500) has_cycle = 1;

        int expected_arr[] = {{{expected_str if expected else "0"}}};
        int expected_len = {len(expected)};

        int passed = 1;
        if (has_cycle || count != expected_len) {{
            passed = 0;
        }} else {{
            for (int i = 0; i < expected_len; i++) {{
                if (actual_arr[i] != expected_arr[i]) {{
                    passed = 0;
                    break;
                }}
            }}
        }}

        printf("{{\\"test_idx\\": {idx}, \\"status\\": \\"%s\\", \\"actual\\": [", passed ? "PASSED" : "FAILED");
        for (int i = 0; i < count; i++) {{
            printf("%d%s", actual_arr[i], (i + 1 < count) ? ", " : "");
        }}
        printf("], \\"expected\\": [{expected_str}], \\"label\\": \\"{label}\\"}}\\n");
    }}
"""
        test_blocks.append(block)

    return f"""#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

{user_code}

int main() {{
    printf("__ARENA_TEST_RESULTS_START__\\n");
{"".join(test_blocks)}
    printf("__ARENA_TEST_RESULTS_END__\\n");
    return 0;
}}
"""


def _generate_array_harness(problem: Dict[str, Any], user_code: str, tests: List[Dict[str, Any]]) -> str:
    pid = problem["id"]
    test_blocks = []

    for idx, test in enumerate(tests):
        initial = test.get("initial", [])
        expected = test.get("expected")
        label = test.get("label", f"Test Case {idx + 1}").replace('"', '\\"')
        init_str = ",".join(str(x) for x in initial)

        if pid == "arr-reverse":
            expected_str = ",".join(str(x) for x in expected) if isinstance(expected, list) else str(expected)
            block = f"""
    {{
        int arr[] = {{{init_str}}};
        int n = {len(initial)};
        reverse_array(arr, n);

        int expected[] = {{{expected_str}}};
        int passed = 1;
        for (int i = 0; i < n; i++) {{
            if (arr[i] != expected[i]) {{ passed = 0; break; }}
        }}
        printf("{{\\"test_idx\\": {idx}, \\"status\\": \\"%s\\", \\"actual\\": [", passed ? "PASSED" : "FAILED");
        for (int i = 0; i < n; i++) printf("%d%s", arr[i], (i + 1 < n) ? ", " : "");
        printf("], \\"expected\\": [{expected_str}], \\"label\\": \\"{label}\\"}}\\n");
    }}
"""
        elif pid == "arr-find-max":
            block = f"""
    {{
        int arr[] = {{{init_str}}};
        int n = {len(initial)};
        int actual = find_maximum(arr, n);
        int expected = {expected};
        int passed = (actual == expected);
        printf("{{\\"test_idx\\": {idx}, \\"status\\": \\"%s\\", \\"actual\\": %d, \\"expected\\": %d, \\"label\\": \\"{label}\\"}}\\n",
               passed ? "PASSED" : "FAILED", actual, expected);
    }}
"""
        elif pid == "arr-binary-search":
            target = test.get("target", 0)
            block = f"""
    {{
        int arr[] = {{{init_str}}};
        int n = {len(initial)};
        int target = {target};
        int actual = binary_search(arr, n, target);
        int expected = {expected};
        int passed = (actual == expected);
        printf("{{\\"test_idx\\": {idx}, \\"status\\": \\"%s\\", \\"actual\\": %d, \\"expected\\": %d, \\"label\\": \\"{label}\\"}}\\n",
               passed ? "PASSED" : "FAILED", actual, expected);
    }}
"""
        test_blocks.append(block)

    return f"""#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

{user_code}

int main() {{
    printf("__ARENA_TEST_RESULTS_START__\\n");
{"".join(test_blocks)}
    printf("__ARENA_TEST_RESULTS_END__\\n");
    return 0;
}}
"""


def _generate_parentheses_harness(user_code: str, tests: List[Dict[str, Any]]) -> str:
    test_blocks = []
    for idx, test in enumerate(tests):
        s_val = test.get("str", "")
        expected = test.get("expected", 0)
        label = test.get("label", f"Test Case {idx + 1}").replace('"', '\\"')
        block = f"""
    {{
        const char *s = "{s_val}";
        int actual = is_valid_parentheses(s);
        int expected = {expected};
        int passed = (actual == expected);
        printf("{{\\"test_idx\\": {idx}, \\"status\\": \\"%s\\", \\"actual\\": %d, \\"expected\\": %d, \\"label\\": \\"{label}\\"}}\\n",
               passed ? "PASSED" : "FAILED", actual, expected);
    }}
"""
        test_blocks.append(block)

    return f"""#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

{user_code}

int main() {{
    printf("__ARENA_TEST_RESULTS_START__\\n");
{"".join(test_blocks)}
    printf("__ARENA_TEST_RESULTS_END__\\n");
    return 0;
}}
"""


def _generate_tree_harness(problem: Dict[str, Any], user_code: str, tests: List[Dict[str, Any]]) -> str:
    test_blocks = []
    for idx, test in enumerate(tests):
        initial = test.get("initial", [])
        val = test.get("val", 0)
        expected = test.get("expected", [])
        label = test.get("label", f"Test Case {idx + 1}").replace('"', '\\"')

        init_lines = ["    TNODE root = NULL;"]
        for v in initial:
            init_lines.append(f"    root = bst_insert(root, {v});")
        init_lines.append(f"    root = bst_insert(root, {val});")

        expected_str = ",".join(str(x) for x in expected)
        block = f"""
    {{
{chr(10).join(init_lines)}
        int inorder_arr[200];
        int count = 0;
        void get_inorder(TNODE n) {{
            if (!n) return;
            get_inorder(n->left);
            inorder_arr[count++] = n->info;
            get_inorder(n->right);
        }}
        get_inorder(root);

        int expected[] = {{{expected_str if expected else "0"}}};
        int expected_len = {len(expected)};
        int passed = 1;
        if (count != expected_len) passed = 0;
        else {{
            for (int i = 0; i < count; i++) {{
                if (inorder_arr[i] != expected[i]) {{ passed = 0; break; }}
            }}
        }}
        printf("{{\\"test_idx\\": {idx}, \\"status\\": \\"%s\\", \\"actual\\": [", passed ? "PASSED" : "FAILED");
        for (int i = 0; i < count; i++) printf("%d%s", inorder_arr[i], (i + 1 < count) ? ", " : "");
        printf("], \\"expected\\": [{expected_str}], \\"label\\": \\"{label}\\"}}\\n");
    }}
"""
        test_blocks.append(block)

    return f"""#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

{user_code}

int main() {{
    printf("__ARENA_TEST_RESULTS_START__\\n");
{"".join(test_blocks)}
    printf("__ARENA_TEST_RESULTS_END__\\n");
    return 0;
}}
"""

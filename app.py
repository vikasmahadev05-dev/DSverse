"""
DSVERSE - Data Structures & Algorithms Computer Science Laboratory.
Tagline: Understand. Visualize. Execute. Master.
"""

import streamlit as st
import time
import pandas as pd
from database.db_manager import get_or_create_user, save_experiment, get_experiments, is_postgres_available
from visualization.visualizers import (
    create_array_figure,
    create_stack_figure,
    create_queue_figure,
    create_sorting_bars
)
from algorithms.sorting_lab import run_bubble_sort, run_selection_sort, run_insertion_sort
from algorithms.searching_lab import run_linear_search, run_binary_search
from algorithms.comparison import compare_sorting_algorithms
from modules.ds_detective import get_diagnostic_cases

# Page Configuration
st.set_page_config(
    page_title="DSVERSE — Computer Science Laboratory",
    page_icon="💠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Session State
if "username" not in st.session_state:
    st.session_state.username = "Vikas"
if "experiments_count" not in st.session_state:
    st.session_state.experiments_count = 0

# Load Academic Profile
user_profile = get_or_create_user(st.session_state.username)

# Sidebar Navigation & Session Info
with st.sidebar:
    st.title("🔬 DSVERSE")
    st.caption("Understand. Visualize. Execute. Master.")
    st.markdown("---")
    
    # Academic Researcher Profile (No XP, No Levels)
    st.markdown(f"**Researcher:** `{user_profile['username']}`")
    st.markdown(f"**Role:** `{user_profile['role']}`")
    db_status = "🟢 PostgreSQL (Production)" if is_postgres_available() else "🟡 SQLite (Local Persistent)"
    st.caption(f"Backend DB: {db_status}")
    st.markdown("---")

    menu = st.radio(
        "Laboratory Navigation",
        [
            "🔬 Overview",
            "🔗 Singly Linked List Lab",
            "⚡ Algorithm Lab",
            "📊 Algorithm Comparison",
            "🕵️‍♂️ DS Detective (C Code Analysis)",
            "📁 Saved Experiments"
        ]
    )

# -------------------------------------------------------------
# MODULE 1: OVERVIEW
# -------------------------------------------------------------
if menu == "🔬 Overview":
    st.title("DSVERSE — Computer Science Laboratory")
    st.markdown(
        "An interactive visualization and algorithm execution platform designed to explore "
        "internal pointer manipulations, memory allocations, and empirical time/space complexity."
    )

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Architecture", "C & Python")
    col2.metric("Sync Engine", "Line-by-Line")
    col3.metric("Data Structures", "Pointers / Dynamic")
    col4.metric("Database", user_profile["backend"])

    st.markdown("---")
    st.subheader("📚 Platform Modules")

    m_col1, m_col2, m_col3 = st.columns(3)
    with m_col1:
        st.info(
            "### 🔗 Linked List Lab\n"
            "Atomic pointer manipulation canvas, dynamic memory allocation (`malloc`/`free`), "
            "and synchronized ANSI C statement highlighting."
        )
    with m_col2:
        st.success(
            "### ⚡ Algorithm Lab\n"
            "Step through Sorting & Searching algorithms with exact comparison counters, memory write counters, "
            "and C code line tracking."
        )
    with m_col3:
        st.warning(
            "### 📊 Benchmark Comparison\n"
            "Run dual algorithms side-by-side on identical input arrays to compare theoretical vs empirical performance."
        )

# -------------------------------------------------------------
# MODULE 2: SINGLY LINKED LIST LAB
# -------------------------------------------------------------
elif menu == "🔗 Singly Linked List Lab":
    st.title("Singly Linked List Visualizer (ANSI C Mapped)")
    st.caption("Interactive execution engine synchronized line-by-line with ANSI C reference code.")
    st.markdown("[🚀 **Open Full-Screen Standalone Lab (http://localhost:8000)**](http://localhost:8000)")

    import streamlit.components.v1 as components
    components.iframe("http://localhost:8000", height=880, scrolling=True)

# -------------------------------------------------------------
# MODULE 3: ALGORITHM LAB
# -------------------------------------------------------------
elif menu == "⚡ Algorithm Lab":
    st.title("⚡ Algorithm Execution Laboratory")
    algo_type = st.radio("Category", ["Sorting Algorithms", "Searching Algorithms"], horizontal=True)

    if algo_type == "Sorting Algorithms":
        s_algo = st.selectbox("Select Sorting Algorithm", ["Bubble Sort", "Selection Sort", "Insertion Sort"])
        input_data = st.text_input("Input Array (comma-separated)", "45, 12, 89, 34, 23, 7, 56")

        try:
            arr_to_sort = [int(x.strip()) for x in input_data.split(",") if x.strip()]
        except ValueError:
            arr_to_sort = [45, 12, 89, 34, 23, 7, 56]

        if s_algo == "Bubble Sort":
            data = run_bubble_sort(arr_to_sort)
        elif s_algo == "Selection Sort":
            data = run_selection_sort(arr_to_sort)
        else:
            data = run_insertion_sort(arr_to_sort)

        steps = data["steps"]
        step_idx = st.slider("Execution Step", 0, len(steps) - 1, 0)
        curr_step = steps[step_idx]

        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Time (Best)", data["complexity"]["time_best"])
        c2.metric("Time (Worst)", data["complexity"]["time_worst"])
        c3.metric("Comparisons", curr_step["comparisons"])
        c4.metric("Swaps / Writes", curr_step["swaps"])

        st.info(f"**Step {step_idx + 1}/{len(steps)}:** {curr_step['description']}")
        st.plotly_chart(create_sorting_bars(curr_step["array"], active_indices=curr_step["active_indices"], sorted_indices=curr_step["sorted_indices"]), use_container_width=True)

        st.markdown("#### 💻 Synchronized C Source Code")
        c_lines = data["c_code"].split("\n")
        active_line = curr_step["c_line"]
        formatted_code = ""
        for idx, line in enumerate(c_lines):
            line_no = idx + 1
            marker = "➔ " if line_no == active_line else "   "
            formatted_code += f"{marker}{line_no:02d} | {line}\n"
        st.code(formatted_code, language="c")
        st.caption(f"Highlighted Line {active_line}: {curr_step['c_explanation']}")

    else:
        search_algo = st.selectbox("Select Search Algorithm", ["Binary Search (Sorted)", "Linear Search"])
        s_arr_input = st.text_input("Input Array (comma-separated)", "10, 25, 33, 47, 52, 68, 79, 91")
        target_val = st.number_input("Target Key", value=47, step=1)

        try:
            arr_to_search = [int(x.strip()) for x in s_arr_input.split(",") if x.strip()]
        except ValueError:
            arr_to_search = [10, 25, 33, 47, 52, 68, 79, 91]

        if "Binary" in search_algo:
            data = run_binary_search(arr_to_search, int(target_val))
        else:
            data = run_linear_search(arr_to_search, int(target_val))

        steps = data["steps"]
        step_idx = st.slider("Execution Step", 0, len(steps) - 1, 0)
        curr_step = steps[step_idx]

        st.info(f"**Step {step_idx + 1}/{len(steps)}:** {curr_step['description']}")
        st.code(data["c_code"], language="c")

# -------------------------------------------------------------
# MODULE 4: ALGORITHM COMPARISON
# -------------------------------------------------------------
elif menu == "📊 Algorithm Comparison":
    st.title("📊 Empirical Algorithm Performance Benchmark")
    st.caption("Compare execution performance of two sorting algorithms side-by-side on identical datasets.")

    col_a, col_b = st.columns(2)
    with col_a:
        algo1 = st.selectbox("Algorithm A (Baseline)", ["bubble_sort", "selection_sort", "insertion_sort"], index=0)
    with col_b:
        algo2 = st.selectbox("Algorithm B (Challenger)", ["quick_sort", "selection_sort", "insertion_sort"], index=0)

    dataset_str = st.text_input("Dataset Array", "84, 19, 45, 62, 31, 95, 12, 70, 53, 28, 4, 38")
    if st.button("Run Side-by-Side Benchmark"):
        try:
            arr = [int(x.strip()) for x in dataset_str.split(",") if x.strip()]
            res = compare_sorting_algorithms(arr, algo1, algo2)

            res_c1, res_c2 = st.columns(2)
            with res_c1:
                st.subheader(res["algorithm_1"]["display_name"])
                st.write(f"**Theoretical:** `{res['algorithm_1']['time_complexity']}`")
                st.metric("Comparisons", res["algorithm_1"]["comparisons"])
                st.metric("Memory Swaps", res["algorithm_1"]["swaps"])
                st.metric("Execution Time", f"{res['algorithm_1']['time_ms']} ms")

            with res_c2:
                st.subheader(res["algorithm_2"]["display_name"])
                st.write(f"**Theoretical:** `{res['algorithm_2']['time_complexity']}`")
                st.metric("Comparisons", res["algorithm_2"]["comparisons"])
                st.metric("Memory Swaps", res["algorithm_2"]["swaps"])
                st.metric("Execution Time", f"{res['algorithm_2']['time_ms']} ms")

            st.success(f"**Pedagogical Analysis:** {res['comparative_analysis']}")
            save_experiment(user_profile["username"], "Comparison", f"{algo1} vs {algo2}", dataset_str, res)
            st.toast("Saved trial to database!", icon="💾")
        except Exception as e:
            st.error(f"Execution error: {e}")

# -------------------------------------------------------------
# MODULE 5: DS DETECTIVE
# -------------------------------------------------------------
elif menu == "🕵️‍♂️ DS Detective (C Code Analysis)":
    st.title("🕵️‍♂️ DS Detective: Academic Code Inspection")
    st.markdown("Identify critical memory bugs, dangling pointers, and boundary errors in standard C implementations.")

    cases = get_diagnostic_cases()
    case_names = [f"{c['title']} ({c['difficulty']})" for c in cases]
    sel_name = st.selectbox("Select Diagnostic Case", case_names)
    sel_case = cases[case_names.index(sel_name)]

    st.subheader(sel_case["title"])
    st.write(sel_case["scenario"])
    st.markdown("#### Faulty C Source Code")
    st.code(sel_case["c_code"], language="c")

    st.markdown("#### Select Root Cause Diagnosis")
    choice = st.radio("Options:", sel_case["options"], index=None)

    if st.button("Verify Diagnostic Hypothesis"):
        if choice is None:
            st.warning("Please select a diagnosis first.")
        else:
            chosen_idx = sel_case["options"].index(choice)
            if chosen_idx == sel_case["correct_option"]:
                st.success("✅ **DIAGNOSIS CONFIRMED CORRECT**")
                st.write(sel_case["academic_explanation"])
            else:
                st.error("❌ **HYPOTHESIS REFUTED**")
                st.write("This hypothesis does not address the underlying memory or condition error. Review the pointers carefully!")

# -------------------------------------------------------------
# MODULE 6: SAVED EXPERIMENTS
# -------------------------------------------------------------
elif menu == "📁 Saved Experiments":
    st.title("📁 Saved Laboratory Experiments")
    st.markdown("Historical benchmark trials stored in the configured database.")

    exps = get_experiments(user_profile["username"])
    if exps:
        df = pd.DataFrame(exps)
        st.dataframe(df, use_container_width=True)
    else:
        st.info("No experiments recorded yet. Run a benchmark comparison to save empirical results.")

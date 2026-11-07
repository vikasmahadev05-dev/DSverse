"""
Interactive Plotly visualizations for Data Structures and Algorithms.
"""

import plotly.graph_objects as go


def create_array_figure(arr, highlights=None):
    """
    Renders an array as indexed rectangular blocks.
    highlights: dict of index -> color or role (e.g. {2: 'orange', 4: 'lightgreen'})
    """
    if highlights is None:
        highlights = {}

    if not arr:
        fig = go.Figure()
        fig.add_annotation(text="Array is empty", showarrow=False, font=dict(size=18, color="gray"))
        fig.update_layout(xaxis=dict(visible=False), yaxis=dict(visible=False), height=180)
        return fig

    n = len(arr)
    x_positions = list(range(n))
    y_positions = [1] * n

    colors = [highlights.get(i, "#4F46E5") for i in range(n)]

    fig = go.Figure()

    # Block boxes
    for i, val in enumerate(arr):
        color = highlights.get(i, "#6366F1")
        fig.add_trace(go.Scatter(
            x=[i],
            y=[1],
            mode="markers+text",
            marker=dict(
                symbol="square",
                size=55,
                color=color,
                line=dict(color="#1E1B4B", width=2)
            ),
            text=[f"<b>{val}</b>"],
            textposition="middle center",
            textfont=dict(color="white", size=16),
            hoverinfo="text",
            hovertext=f"Index: {i}<br>Value: {val}",
            showlegend=False
        ))
        # Index labels
        fig.add_annotation(
            x=i,
            y=0.72,
            text=f"[{i}]",
            showarrow=False,
            font=dict(size=12, color="#94A3B8")
        )

    fig.update_layout(
        xaxis=dict(visible=False, range=[-0.8, n - 0.2]),
        yaxis=dict(visible=False, range=[0.5, 1.4]),
        height=190,
        margin=dict(l=20, r=20, t=20, b=20),
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)"
    )
    return fig


def create_stack_figure(stack, highlight_top=True):
    """
    Renders a Stack (LIFO) vertically from bottom to top.
    """
    if not stack:
        fig = go.Figure()
        fig.add_annotation(text="Stack is empty (Underflow)", showarrow=False, font=dict(size=16, color="gray"))
        fig.update_layout(xaxis=dict(visible=False), yaxis=dict(visible=False), height=250)
        return fig

    fig = go.Figure()
    n = len(stack)

    for i, val in enumerate(stack):
        is_top = (i == n - 1)
        color = "#10B981" if is_top and highlight_top else "#3B82F6"

        fig.add_trace(go.Scatter(
            x=[0],
            y=[i],
            mode="markers+text",
            marker=dict(
                symbol="square",
                size=50,
                color=color,
                line=dict(color="#1E293B", width=2)
            ),
            text=[f"<b>{val}</b>"],
            textposition="middle center",
            textfont=dict(color="white", size=14),
            showlegend=False
        ))

        if is_top:
            fig.add_annotation(
                x=0.35,
                y=i,
                text="<b>TOP ➔</b>",
                showarrow=False,
                font=dict(color="#10B981", size=14)
            )

    fig.update_layout(
        xaxis=dict(visible=False, range=[-0.5, 0.8]),
        yaxis=dict(visible=False, range=[-0.5, n + 0.5]),
        height=max(250, n * 50 + 60),
        margin=dict(l=10, r=10, t=10, b=10),
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)"
    )
    return fig


def create_queue_figure(queue):
    """
    Renders a Queue (FIFO) horizontally with Front and Rear indicators.
    """
    if not queue:
        fig = go.Figure()
        fig.add_annotation(text="Queue is empty", showarrow=False, font=dict(size=16, color="gray"))
        fig.update_layout(xaxis=dict(visible=False), yaxis=dict(visible=False), height=190)
        return fig

    n = len(queue)
    fig = go.Figure()

    for i, val in enumerate(queue):
        is_front = (i == 0)
        is_rear = (i == n - 1)
        color = "#EC4899" if is_front else ("#F59E0B" if is_rear else "#8B5CF6")

        fig.add_trace(go.Scatter(
            x=[i],
            y=[1],
            mode="markers+text",
            marker=dict(
                symbol="square",
                size=50,
                color=color,
                line=dict(color="#334155", width=2)
            ),
            text=[f"<b>{val}</b>"],
            textposition="middle center",
            textfont=dict(color="white", size=14),
            showlegend=False
        ))

        label = []
        if is_front:
            label.append("FRONT (Exit)")
        if is_rear:
            label.append("REAR (Entry)")
        if label:
            fig.add_annotation(
                x=i,
                y=1.28,
                text="<br>".join(label),
                showarrow=False,
                font=dict(size=11, color=color, family="monospace")
            )

    fig.update_layout(
        xaxis=dict(visible=False, range=[-0.8, n - 0.2]),
        yaxis=dict(visible=False, range=[0.6, 1.5]),
        height=210,
        margin=dict(l=20, r=20, t=20, b=20),
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)"
    )
    return fig


def create_linked_list_figure(nodes):
    """
    Renders a Singly Linked List with node data, next pointers and arrows.
    """
    if not nodes:
        fig = go.Figure()
        fig.add_annotation(text="Linked List is empty (HEAD ➔ NULL)", showarrow=False, font=dict(size=16, color="gray"))
        fig.update_layout(xaxis=dict(visible=False), yaxis=dict(visible=False), height=180)
        return fig

    n = len(nodes)
    fig = go.Figure()

    for i, val in enumerate(nodes):
        # Data block
        fig.add_trace(go.Scatter(
            x=[i * 2],
            y=[1],
            mode="markers+text",
            marker=dict(symbol="square", size=50, color="#2563EB", line=dict(color="#1E3A8A", width=2)),
            text=[f"<b>{val}</b>"],
            textposition="middle center",
            textfont=dict(color="white", size=14),
            showlegend=False
        ))

        # Pointer arrow to next
        if i < n - 1:
            fig.add_annotation(
                x=(i * 2) + 1.4,
                y=1,
                ax=(i * 2) + 0.6,
                ay=1,
                xref="x",
                yref="y",
                axref="x",
                ayref="y",
                showarrow=True,
                arrowhead=2,
                arrowsize=1.2,
                arrowwidth=2.5,
                arrowcolor="#38BDF8"
            )

        # HEAD label
        if i == 0:
            fig.add_annotation(x=0, y=1.3, text="HEAD", showarrow=False, font=dict(color="#38BDF8", size=13))

    # NULL terminal block
    null_x = (n - 1) * 2 + 1.8
    fig.add_annotation(
        x=null_x,
        y=1,
        ax=(n - 1) * 2 + 0.6,
        ay=1,
        xref="x",
        yref="y",
        axref="x",
        ayref="y",
        showarrow=True,
        arrowhead=2,
        arrowcolor="#64748B"
    )
    fig.add_trace(go.Scatter(
        x=[null_x + 0.3],
        y=[1],
        mode="text",
        text=["<b>NULL</b>"],
        textfont=dict(color="#EF4444", size=14),
        showlegend=False
    ))

    fig.update_layout(
        xaxis=dict(visible=False, range=[-0.8, null_x + 1.0]),
        yaxis=dict(visible=False, range=[0.6, 1.5]),
        height=190,
        margin=dict(l=20, r=20, t=10, b=10),
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)"
    )
    return fig


def create_sorting_bars(values, active_indices=None, sorted_indices=None):
    """
    Renders bar chart for sorting visualizer.
    """
    if active_indices is None:
        active_indices = []
    if sorted_indices is None:
        sorted_indices = []

    colors = []
    for i in range(len(values)):
        if i in sorted_indices:
            colors.append("#10B981")  # Green for sorted
        elif i in active_indices:
            colors.append("#F59E0B")  # Yellow/Orange for currently compared/swapping
        else:
            colors.append("#6366F1")  # Default Purple-Blue

    fig = go.Figure(go.Bar(
        x=[f"[{i}]" for i in range(len(values))],
        y=values,
        marker_color=colors,
        text=values,
        textposition="outside",
        textfont=dict(color="white")
    ))

    fig.update_layout(
        yaxis=dict(title="Value", showgrid=False),
        xaxis=dict(title="Array Index"),
        height=320,
        margin=dict(l=20, r=20, t=20, b=30),
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)"
    )
    return fig


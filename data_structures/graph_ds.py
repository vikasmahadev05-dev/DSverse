"""
DSVERSE - Graph Data Structure & Execution Engine.
Academic execution engine supporting Adjacency Matrix & Adjacency List representations,
BFS (with explicit queue), DFS (with explicit stack), and Dijkstra's Shortest Path algorithm.
"""

from typing import List, Dict, Any, Optional

C_GRAPH_STRUCT = """#define MAX_VERTICES 6

// Adjacency Matrix Representation in C
typedef struct {
    int num_vertices;
    int adj_matrix[MAX_VERTICES][MAX_VERTICES];
} GraphMatrix;

// Adjacency List Representation in C
struct AdjListNode {
    int dest;
    int weight;
    struct AdjListNode* next;
};

typedef struct {
    struct AdjListNode* head[MAX_VERTICES];
    int num_vertices;
} GraphList;"""

C_GRAPH_SNIPPETS = {
    "bfs": (
        "void bfs(int adj[MAX_V][MAX_V], int start_v, int n) {\n"
        "    int visited[MAX_V] = {0};\n"
        "    int queue[MAX_V], front = 0, rear = 0;\n"
        "    visited[start_v] = 1;\n"
        "    queue[rear++] = start_v;\n"
        "    while (front < rear) {\n"
        "        int curr = queue[front++];\n"
        "        printf(\"%d \", curr);\n"
        "        for (int i = 0; i < n; i++) {\n"
        "            if (adj[curr][i] && !visited[i]) {\n"
        "                visited[i] = 1;\n"
        "                queue[rear++] = i;\n"
        "            }\n"
        "        }\n"
        "    }\n"
        "}"
    ),
    "dfs": (
        "void dfs_util(int adj[MAX_V][MAX_V], int v, int visited[], int n) {\n"
        "    visited[v] = 1;\n"
        "    printf(\"%d \", v);\n"
        "    for (int i = 0; i < n; i++) {\n"
        "        if (adj[v][i] && !visited[i]) {\n"
        "            dfs_util(adj, i, visited, n);\n"
        "        }\n"
        "    }\n"
        "}"
    ),
    "dijkstra": (
        "void dijkstra(int graph[MAX_V][MAX_V], int src, int n) {\n"
        "    int dist[MAX_V], visited[MAX_V] = {0};\n"
        "    for (int i = 0; i < n; i++) dist[i] = INT_MAX;\n"
        "    dist[src] = 0;\n"
        "    for (int count = 0; count < n - 1; count++) {\n"
        "        int u = min_distance(dist, visited, n);\n"
        "        visited[u] = 1;\n"
        "        for (int v = 0; v < n; v++) {\n"
        "            if (!visited[v] && graph[u][v] && dist[u] != INT_MAX\n"
        "                && dist[u] + graph[u][v] < dist[v]) {\n"
        "                dist[v] = dist[u] + graph[u][v];\n"
        "            }\n"
        "        }\n"
        "    }\n"
        "}"
    )
}


class GraphDS:
    def __init__(self):
        # Default 5-node graph: A(0), B(1), C(2), D(3), E(4)
        self.vertex_labels = ["A", "B", "C", "D", "E"]
        self.n = len(self.vertex_labels)
        # Coordinates for layout
        self.coords = [
            {"x": 100, "y": 140},  # A
            {"x": 280, "y": 70},   # B
            {"x": 460, "y": 140},  # C
            {"x": 380, "y": 280},  # D
            {"x": 180, "y": 280}   # E
        ]
        # Weighted adjacency matrix
        self.adj_matrix: List[List[int]] = [
            [0, 4, 0, 0, 8],  # A connects to B(4), E(8)
            [4, 0, 8, 0, 0],  # B connects to A(4), C(8)
            [0, 8, 0, 7, 0],  # C connects to B(8), D(7)
            [0, 0, 7, 0, 9],  # D connects to C(7), E(9)
            [8, 0, 0, 9, 0]   # E connects to A(8), D(9)
        ]
        self.operation_count = 0

    def _snapshot(
        self,
        active_vertex: Optional[int] = None,
        visited_vertices: Optional[List[int]] = None,
        active_edge: Optional[Dict[str, int]] = None,
        frontier: Optional[List[int]] = None,
        distances: Optional[List[Optional[int]]] = None
    ) -> Dict[str, Any]:
        visited = visited_vertices or []
        front = frontier or []

        vertices = []
        for i in range(self.n):
            dist_val = distances[i] if distances and i < len(distances) else None
            vertices.append({
                "id": i,
                "label": self.vertex_labels[i],
                "x": self.coords[i]["x"],
                "y": self.coords[i]["y"],
                "is_active": i == active_vertex,
                "is_visited": i in visited,
                "is_in_frontier": i in front,
                "distance": dist_val
            })

        edges = []
        for i in range(self.n):
            for j in range(i + 1, self.n):
                w = self.adj_matrix[i][j]
                if w > 0:
                    is_edge_active = False
                    if active_edge:
                        if (active_edge.get("u") == i and active_edge.get("v") == j) or \
                           (active_edge.get("u") == j and active_edge.get("v") == i):
                            is_edge_active = True
                    edges.append({
                        "u": i,
                        "v": j,
                        "weight": w,
                        "is_active": is_edge_active
                    })

        # Adjacency list representation
        adj_list = {}
        for i in range(self.n):
            adj_list[self.vertex_labels[i]] = [
                {"neighbor": self.vertex_labels[j], "weight": self.adj_matrix[i][j]}
                for j in range(self.n) if self.adj_matrix[i][j] > 0
            ]

        return {
            "vertices": vertices,
            "edges": edges,
            "adj_matrix": self.adj_matrix,
            "adj_list": adj_list,
            "vertex_labels": self.vertex_labels
        }

    def get_state(self) -> Dict[str, Any]:
        return {
            **self._snapshot(),
            "c_struct": C_GRAPH_STRUCT
        }

    def reset_default(self) -> Dict[str, Any]:
        self.__init__()
        return self.get_state()

    def run_bfs(self, start_idx: int = 0) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_GRAPH_SNIPPETS["bfs"]

        visited = [False] * self.n
        queue = [start_idx]
        visited[start_idx] = True
        visited_order = [start_idx]

        steps.append({
            "step_number": 1,
            "description": f"Enqueuing start vertex {self.vertex_labels[start_idx]} and marking it as visited.",
            "graph_state": self._snapshot(
                active_vertex=start_idx,
                visited_vertices=list(visited_order),
                frontier=list(queue)
            ),
            "queue_state": [self.vertex_labels[idx] for idx in queue],
            "c_line_number": 4,
            "c_line_explanation": "visited[start_v] = 1; queue[rear++] = start_v; Seed FIFO queue.",
            "log_type": "info",
            "comparisons": 0,
            "traversals": 1
        })

        step_num = 1
        comparisons = 0

        while queue:
            curr = queue.pop(0)
            step_num += 1

            steps.append({
                "step_number": step_num,
                "description": f"Dequeued vertex {self.vertex_labels[curr]}. Inspecting adjacent outgoing edges.",
                "graph_state": self._snapshot(
                    active_vertex=curr,
                    visited_vertices=list(visited_order),
                    frontier=list(queue)
                ),
                "queue_state": [self.vertex_labels[idx] for idx in queue],
                "c_line_number": 7,
                "c_line_explanation": f"int curr = queue[front++]; Processing vertex {self.vertex_labels[curr]}.",
                "log_type": "pointer",
                "comparisons": comparisons,
                "traversals": len(visited_order)
            })

            for neighbor in range(self.n):
                comparisons += 1
                if self.adj_matrix[curr][neighbor] > 0:
                    if not visited[neighbor]:
                        visited[neighbor] = True
                        queue.append(neighbor)
                        visited_order.append(neighbor)
                        step_num += 1

                        steps.append({
                            "step_number": step_num,
                            "description": f"Discovered unvisited neighbor {self.vertex_labels[neighbor]}. Enqueued into FIFO queue.",
                            "graph_state": self._snapshot(
                                active_vertex=neighbor,
                                active_edge={"u": curr, "v": neighbor},
                                visited_vertices=list(visited_order),
                                frontier=list(queue)
                            ),
                            "queue_state": [self.vertex_labels[idx] for idx in queue],
                            "c_line_number": 11,
                            "c_line_explanation": f"visited[{self.vertex_labels[neighbor]}] = 1; queue[rear++] = {neighbor};",
                            "log_type": "traverse",
                            "comparisons": comparisons,
                            "traversals": len(visited_order)
                        })

        steps.append({
            "step_number": step_num + 1,
            "description": f"BFS traversal complete. Order: {' -> '.join([self.vertex_labels[x] for x in visited_order])}.",
            "graph_state": self._snapshot(visited_vertices=list(visited_order)),
            "queue_state": [],
            "c_line_number": 15,
            "c_line_explanation": "Queue is empty. All connected vertices visited.",
            "log_type": "success",
            "comparisons": comparisons,
            "traversals": len(visited_order)
        })

        return {
            "operation": f"BFS Traversal from {self.vertex_labels[start_idx]}",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_GRAPH_STRUCT,
            "complexity": {
                "time_best": "O(V + E)",
                "time_avg": "O(V + E)",
                "time_worst": "O(V + E)",
                "space_auxiliary": "O(V)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": len(visited_order),
                "pointer_assignments": 0,
                "total_nodes": self.n
            }
        }

    def run_dfs(self, start_idx: int = 0) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_GRAPH_SNIPPETS["dfs"]

        visited = [False] * self.n
        visited_order: List[int] = []
        call_stack: List[int] = []
        comparisons = 0

        def _dfs(u: int):
            nonlocal comparisons
            visited[u] = True
            visited_order.append(u)
            call_stack.append(u)

            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Pushed {self.vertex_labels[u]} to recursive call stack. Marked as visited.",
                "graph_state": self._snapshot(
                    active_vertex=u,
                    visited_vertices=list(visited_order)
                ),
                "stack_state": [self.vertex_labels[idx] for idx in call_stack],
                "c_line_number": 2,
                "c_line_explanation": f"visited[{self.vertex_labels[u]}] = 1; printf(\"%d \", {self.vertex_labels[u]});",
                "log_type": "pointer",
                "comparisons": comparisons,
                "traversals": len(visited_order)
            })

            for v in range(self.n):
                comparisons += 1
                if self.adj_matrix[u][v] > 0 and not visited[v]:
                    steps.append({
                        "step_number": len(steps) + 1,
                        "description": f"Traversing edge ({self.vertex_labels[u]} -> {self.vertex_labels[v]}). Recursing deeper.",
                        "graph_state": self._snapshot(
                            active_vertex=v,
                            active_edge={"u": u, "v": v},
                            visited_vertices=list(visited_order)
                        ),
                        "stack_state": [self.vertex_labels[idx] for idx in call_stack],
                        "c_line_number": 6,
                        "c_line_explanation": f"dfs_util(adj, {self.vertex_labels[v]}, visited, n);",
                        "log_type": "traverse",
                        "comparisons": comparisons,
                        "traversals": len(visited_order)
                    })
                    _dfs(v)

            call_stack.pop()

        _dfs(start_idx)

        steps.append({
            "step_number": len(steps) + 1,
            "description": f"DFS complete. Order: {' -> '.join([self.vertex_labels[x] for x in visited_order])}.",
            "graph_state": self._snapshot(visited_vertices=list(visited_order)),
            "stack_state": [],
            "c_line_number": 8,
            "c_line_explanation": "DFS recursion concluded.",
            "log_type": "success",
            "comparisons": comparisons,
            "traversals": len(visited_order)
        })

        return {
            "operation": f"DFS Traversal from {self.vertex_labels[start_idx]}",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_GRAPH_STRUCT,
            "complexity": {
                "time_best": "O(V + E)",
                "time_avg": "O(V + E)",
                "time_worst": "O(V + E)",
                "space_auxiliary": "O(V)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": len(visited_order),
                "pointer_assignments": 0,
                "total_nodes": self.n
            }
        }

    def run_dijkstra(self, start_idx: int = 0) -> Dict[str, Any]:
        self.operation_count += 1
        steps = []
        c_code = C_GRAPH_SNIPPETS["dijkstra"]

        dist = [float('inf')] * self.n
        dist[start_idx] = 0
        visited = [False] * self.n
        comparisons = 0

        steps.append({
            "step_number": 1,
            "description": f"Initialized distance table: dist[{self.vertex_labels[start_idx]}] = 0, all others = ∞.",
            "graph_state": self._snapshot(
                active_vertex=start_idx,
                distances=[int(d) if d != float('inf') else None for d in dist]
            ),
            "c_line_number": 4,
            "c_line_explanation": "dist[src] = 0; All other vertex distances initialized to infinity.",
            "log_type": "info",
            "comparisons": 0,
            "traversals": 1
        })

        for _ in range(self.n):
            # Find min unvisited distance
            min_dist = float('inf')
            u = -1
            for i in range(self.n):
                comparisons += 1
                if not visited[i] and dist[i] < min_dist:
                    min_dist = dist[i]
                    u = i

            if u == -1:
                break

            visited[u] = True

            steps.append({
                "step_number": len(steps) + 1,
                "description": f"Selected vertex {self.vertex_labels[u]} with minimum tentative distance ({dist[u]}). Marked finalized.",
                "graph_state": self._snapshot(
                    active_vertex=u,
                    visited_vertices=[i for i in range(self.n) if visited[i]],
                    distances=[int(d) if d != float('inf') else None for d in dist]
                ),
                "c_line_number": 7,
                "c_line_explanation": f"int u = min_distance(...); Finalized shortest path to vertex {self.vertex_labels[u]}.",
                "log_type": "pointer",
                "comparisons": comparisons,
                "traversals": sum(visited)
            })

            # Relax adjacent edges
            for v in range(self.n):
                weight = self.adj_matrix[u][v]
                if weight > 0 and not visited[v]:
                    comparisons += 1
                    if dist[u] + weight < dist[v]:
                        old_d = dist[v]
                        dist[v] = dist[u] + weight
                        steps.append({
                            "step_number": len(steps) + 1,
                            "description": f"Relaxing edge ({self.vertex_labels[u]} -> {self.vertex_labels[v]}): updated dist[{self.vertex_labels[v]}] from {old_d if old_d != float('inf') else '∞'} to {dist[v]}.",
                            "graph_state": self._snapshot(
                                active_vertex=v,
                                active_edge={"u": u, "v": v},
                                visited_vertices=[i for i in range(self.n) if visited[i]],
                                distances=[int(d) if d != float('inf') else None for d in dist]
                            ),
                            "c_line_number": 11,
                            "c_line_explanation": f"dist[v] = dist[u] + weight; Shorter path discovered via {self.vertex_labels[u]}.",
                            "log_type": "success",
                            "comparisons": comparisons,
                            "traversals": sum(visited)
                        })

        final_dist = [int(d) if d != float('inf') else None for d in dist]
        steps.append({
            "step_number": len(steps) + 1,
            "description": f"Dijkstra shortest path algorithm finalized for source vertex {self.vertex_labels[start_idx]}.",
            "graph_state": self._snapshot(
                visited_vertices=[i for i in range(self.n) if visited[i]],
                distances=final_dist
            ),
            "c_line_number": 14,
            "c_line_explanation": "All shortest path distances computed.",
            "log_type": "success",
            "comparisons": comparisons,
            "traversals": self.n
        })

        return {
            "operation": f"Dijkstra Shortest Path from {self.vertex_labels[start_idx]}",
            "steps": steps,
            "c_code": c_code,
            "c_struct": C_GRAPH_STRUCT,
            "complexity": {
                "time_best": "O(V^2)",
                "time_avg": "O(V^2)",
                "time_worst": "O(V^2)",
                "space_auxiliary": "O(V)"
            },
            "metrics": {
                "comparisons": comparisons,
                "traversals": self.n,
                "pointer_assignments": 0,
                "total_nodes": self.n
            }
        }


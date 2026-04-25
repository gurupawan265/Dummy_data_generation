from typing import List, Dict, Set
from collections import defaultdict, deque
from app.core.schema import RelationshipDefinition

class RelationshipManager:
    @staticmethod
    def get_generation_order(tables: List[str], relationships: List[RelationshipDefinition]) -> List[str]:
        """
        Returns a topologically sorted list of table IDs based on their dependencies.
        Parent tables (no dependencies) come first.
        """
        # Adjacency list: parent -> children
        adj = defaultdict(list)
        # Indegree: number of parents for each table
        indegree = {table_id: 0 for table_id in tables}
        
        for rel in relationships:
            # child depends on parent
            adj[rel.parent_table].append(rel.child_table)
            indegree[rel.child_table] += 1
            
        # Kahn's algorithm for topological sort
        queue = deque([table_id for table_id in tables if indegree[table_id] == 0])
        order = []
        
        while queue:
            u = queue.popleft()
            order.append(u)
            
            for v in adj[u]:
                indegree[v] -= 1
                if indegree[v] == 0:
                    queue.append(v)
                    
        if len(order) != len(tables):
            # There might be a cycle or disconnected components
            # If length mismatch, it's likely a circular dependency
            remaining = set(tables) - set(order)
            if remaining:
                # Fallback: just append remaining if no clear cycle, but log it
                order.extend(list(remaining))
                
        return order

relationship_manager = RelationshipManager()

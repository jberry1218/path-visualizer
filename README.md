# Shortest Path Visualizer
## Description
Shortest Path Visualizer provides a visual representation of how different path algorithms traverse a graph in order to find a path from a start node to an end node.
## How to Use
The user is provided with tools to add start, end, and wall nodes to the grid as well as add weights to the nodes. When the user has finished setting up the grid, they can select a path algorithm and run the algorithm. The grid will display all of the nodes the algorithm visited in the order they were visited. The grid will then display the path found by the algorithm. Upon completion, a summary of the algorithm's findings appear above the grid.
## Tools
* Start: add the start node
* End: add the end node
* Wall: create a wall node that cannot be traversed
* Weight: increase the weight of a node (default is 1)
    * Note that some algorithms are unweighted. These algorithms will not factor weight into distance when choosing which nodes to traverse. However, regardless of whether the chosen algorithm is weighted or unweighted, the summary text will describe the length of the identified path in terms of weighted distance
## Algorithms
* Dijkstra's: a weighted algorithm that traverses a graph by identifying the unvisited node with the shortest weighted distance from the start node
    * Utilizes a priority queue to determine which node to visit next
    * Guaranteed to find the shortest, weighted path
* Depth-First: an unweighted algorithm that works by choosing a random direction then continuing in that direction until it htis the end node or is forced to go back to the last decision point and choose a new path
    * Utilizes a stack to determine which node to visit next
    * Not guaranteed to find the shortest, weighted path
* Breadth-First: an unweighted algorithm that traverses a graph by identifying the unvisited node with the shortest unweighted distance from the start node
    * Utilizes a queue to determine which node to visit next
    * Not guaranteed to find the shortest, weighted path
* A* Search: a weighted algorithm that combines weighted distance with a chosen heuristic to traverse a graph. The chosen heuristic in this algorithm is Euclidean distance
    * Utilizes a priority queue to determine which node to visit next
    * A* search with a Euclidean heuristic is guaranteed to find the shortest, weighted path
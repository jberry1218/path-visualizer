// Global variable declarations
let bodyDiv;
let currentTool = "Start";
let currentAlgorithm = "Breadth-First";
let windWidth;
let windHeight;
let cols;
let rows;
let grid = [];
let startNode;
let startPos;
let endNode;
let endPos;



// Constructor function for node objects, which hold data for grid buttons
function Node(position) {
    this.position = position;
    this.visited = false;
    this.weightedDistance = Infinity;
    this.unweightedDistance = Infinity;
    this.heuristicDistance = Infinity;
    this.isStart = false;
    this.isEnd = false;
    this.isWall = false;
    this.path = [];
    this.weight = 1;
}


// Setup - add grid and EventListeners
document.addEventListener("DOMContentLoaded", () => {

    // Change current tool
    document.querySelector("#start").addEventListener("click", function(){changeTool("Start")});
    document.querySelector("#end").addEventListener("click", function(){changeTool("End")});
    document.querySelector("#wall").addEventListener("click", function(){changeTool("Wall")});
    document.querySelector("#weight").addEventListener("click", function(){changeTool("Weight")});
    document.querySelector("#clear").addEventListener("click", function(){changeTool("Clear")});

    // Change current algorithm
    document.querySelector("#breadth-first").addEventListener("click", function(){changeAlgorithm("Breadth-First")});
    document.querySelector("#depth-first").addEventListener("click", function(){changeAlgorithm("Depth-First")});
    document.querySelector("#dijkstra").addEventListener("click", function(){changeAlgorithm("Dijkstra")});
    document.querySelector("#a-star").addEventListener("click", function(){changeAlgorithm("A* Search")});

    // Run algorithms
    document.querySelector("#run-algorithm").addEventListener("click", runAlgorithm);

    // Reset board
    document.querySelector("#reset").addEventListener("click", function() {location.reload();});

    // Define window width and height
    windWidth = window.innerWidth;
    windHeight = window.innerHeight;

    // Define row and column size for grid based on window size
    cols = Math.floor(windWidth / 22);
    rows = Math.floor(windHeight / 26);

    // Define body container
    bodyDiv = document.querySelector("#body");

    // Create grid
    addNodes();

})


// Change current tool
function changeTool(tool) {

    currentTool = tool;

    let dropdown = document.querySelector("#tool-dropdown");
    dropdown.innerHTML = `<strong>Tool: </strong>${tool}`;

}


// Change current algorithm
function changeAlgorithm(algo) {

    currentAlgorithm = algo;

    let dropdown = document.querySelector("#algorithm-dropdown");
    dropdown.innerHTML = `<strong>Algorithm: </strong>${algo}`;
    
}


// Run algorithm
function runAlgorithm() {

    if (currentAlgorithm === "Depth-First") {
        runDepthFirst();
    } else if (currentAlgorithm === "Dijkstra") {
        runDijkstra();
    } else if (currentAlgorithm === "A* Search") {
        runAStar();
    } else {
        runBreadthFirst();
    }

}


// Add grid of buttons in HTML, add node corresponding to each button
function addNodes() {

    let gridContainer = document.createElement("div");
    gridContainer.id = "grid-container"
    for (let i = 0; i < rows; i++) {
        let gridRow = document.createElement("div");
        gridRow.className = "grid-row";
        for (let j = 0; j < cols; j++) {
            let gridButton = document.createElement("button");
            gridButton.value = `${i}|${j}`;
            gridButton.className = "grid-button";
            gridButton.id = `button${i}_${j}`;
            gridButton.setAttribute('draggable', true);
            gridButton.addEventListener("click", nodeClicked); 
            gridButton.addEventListener("dragover", nodeClicked);
            let node = new Node ([i, j]);
            grid.push(node);
            gridRow.append(gridButton);
        }
        gridContainer.append(gridRow);
    }
    bodyDiv.append(gridContainer);

}


// Return position array from button id
function getPositionFromId(value) {
    
    row = parseInt(value.match(/^\d+/));
    col = parseInt(value.match(/\d+$/));

    return [row, col];
}


// Return node corresponding to known button position
function getNode(arr, pos) {
    return arr.filter(obj => 
        JSON.stringify(obj.position) === JSON.stringify(pos)
    ).shift();
}


// Return button corresponding to known node
function getButton(pos) {
    return document.querySelector(`#button${pos[0]}_${pos[1]}`);
}


// Set button and corresponding node to startNode, endNode, or wallNode
function nodeClicked(e) {

    e.preventDefault();

    if (currentTool === "Start") {

        if (startNode) {
            let prevStartButton = getButton(startPos);
            prevStartButton.style.background = "#FFFFFF";
            startNode.weightedDistance = Infinity;
            startNode.unweightedDistance = Infinity;
            startNode.isStart = false;
        }
        
        this.style.background = "#96e2c4";
        startPos = getPositionFromId(this.value);
        startNode = getNode(grid, startPos);
        startNode.weightedDistance = 0;
        startNode.unweightedDistance = 0;
        startNode.isStart = true;
        startNode.isEnd = false;
        startNode.isWall = false;

        console.log(`Start node set to ${startNode.position}`);

    } else if (currentTool === "End") {

        if (endNode) {
            let prevEndButton = getButton(endPos);
            prevEndButton.style.background = "#FFFFFF";
            endNode.isEnd = false;
        }

        this.style.background = "#BC3350";
        endPos = getPositionFromId(this.value);
        endNode = getNode(grid, endPos);
        endNode.isStart = false;
        endNode.isEnd = true;
        endNode.isWall = false;

        console.log(`End node set to ${endNode.position}`);

    } else if (currentTool === "Wall") {

        let thisPos = getPositionFromId(this.value);
        let thisNode = getNode(grid, thisPos);

        if (!thisNode.isWall) {
            this.style.background = "#000000";
            thisNode.isStart = false;
            thisNode.isEnd = false;
            thisNode.isWall = true;
            this.innerHTML = "";
            thisNode.weight = 1;
        }

    } else if (currentTool === "Weight") {

        let thisPos = getPositionFromId(this.value);
        let thisNode = getNode(grid, thisPos);

        let newWeight = Math.max((thisNode.weight + 1) % 6, 1);

        if (newWeight === 1) {
            this.innerHTML = "";
        } else {
            this.innerHTML = `${newWeight}`;
        }

        thisNode.weight = newWeight;

        if (thisNode.isWall) {
            thisNode.isWall = false;
            this.style.background = "white";
        }

    } else if (currentTool === "Clear") {

        let thisPos = getPositionFromId(this.value);
        let thisNode = getNode(grid, thisPos);
        this.style.background = "white";
        this.innerHTML = "";
        thisNode.isStart = false;
        thisNode.isEnd = false;
        thisNode.isWall = false;
        thisNode.weight = 1;

    }
}


// Run Dijkstra's algorithm
function runDijkstra() {

    let tempGrid = [...grid];

    startNode = tempGrid.filter((obj) => obj.isStart === true).shift();
    endNode = tempGrid.filter((obj) => obj.isEnd === true).shift();

    if (!startNode || !endNode) {
        return confirm("Please set start and end positions.")
    }

    startPos = startNode.position;
    endPos = endNode.position;

    // Initial settings - all nodes unvisited, current node is the start node
    let unvisitedNodes = [...grid];
    let visitedNodes = [];
    let curNode = unvisitedNodes.filter((obj) => obj.isStart === true).shift();
    let curPos = curNode.position;
    
    // Continue cycling through nodes until hit end node or all unvisited nodes are unreachable
    while (endNode.visited === false && curNode.weightedDistance < Infinity) {

        // Find all adjacent nodes
        let upNode = getNode(grid, [curPos[0], curPos[1] + 1]);
        let rightNode = getNode(grid, [curPos[0] + 1, curPos[1]]);
        let downNode = getNode(grid, [curPos[0], curPos[1] - 1]);
        let leftNode = getNode(grid, [curPos[0] - 1, curPos[1]]);

        // Remove previously visited and wall nodes
        let adjNodes = [upNode, rightNode, downNode, leftNode]
            .filter((obj) => obj !== undefined)
            .filter((obj) => obj.visited === false)
            .filter((obj) => obj.isWall === false);

        // Update distance of and shortest path to adjacent nodes
        for (let i = 0; i < adjNodes.length; i++) {
            
            let tempDistance = curNode.weightedDistance + adjNodes[i].weight;

            if (tempDistance < adjNodes[i].weightedDistance) {
                adjNodes[i].weightedDistance = tempDistance;
                if (adjNodes[i] !== endNode) {
                    adjNodes[i].path = curNode.path.concat(adjNodes[i]);
                } else {
                    adjNodes[i].path = curNode.path
                }
            }
        
        }

        // Set current node to visited and remove current node from unvisited set
        curNode.visited = true;
        visitedNodes.push(curNode);
        unvisitedNodes.filter((obj) => obj.visited === false);

        // Set current node to unvisited node with shortest distance
        curNode = unvisitedNodes.sort((a, b) => a.weightedDistance - b.weightedDistance).shift();
        curPos = curNode.position;

    }

    // Delay counter for staggering animations
    let delCount = 1;
    
    // Color nodes in order visited
    for (let i = 0; i < visitedNodes.length; i++) {

        function colorVisitedNode() {
            let node = visitedNodes[i]; 
            let button = getButton(node.position); 
            if (!node.isStart && !node.isEnd) { 
                button.style.background = "#6699cc";
            }  
        }
        
        setTimeout(colorVisitedNode, 50 * delCount);
        delCount++;

    }

    // Color shortest path, if it exists
    if (endNode.weightedDistance < Infinity) {
        for (let i = 0; i < endNode.path.length; i++) {

            function colorShortestPath() {
                let node = endNode.path[i]; 
                let button = getButton(node.position); 
                button.style.background = "#fed8b1";
            }
            
            setTimeout(colorShortestPath, 50 * delCount);
            delCount++;

        }
    }

    // Announce shortest distance
    document.querySelector("#alert").classList.remove("d-none");
    document.querySelector("#alert-head").innerHTML = `${currentAlgorithm}`;
    
    if (endNode.weightedDistance < Infinity) {
        document.querySelector("#alert-body").innerHTML = `
            The end node was found ${endNode.weightedDistance} blocks away from the start node.<br>
            Dijkstra's algorithm guarantees the shortest, weighted path.
        `;
    } else {
        document.querySelector("#alert-body").innerHTML = `
            The end node cannot be reached
        `;
    }

}


// Run depth-first search
function runDepthFirst() {

    let tempGrid = [...grid];

    startNode = tempGrid.filter((obj) => obj.isStart === true).shift();
    endNode = tempGrid.filter((obj) => obj.isEnd === true).shift();

    if (!startNode || !endNode) {
        return confirm("Please set start and end positions.")
    }

    // Initial settings - all nodes are unvisited, start at the start node, move in one of four random directions
    let unvisitedNodes = [...grid];
    let visitedNodes = [];
    tempGrid = [...grid];
    let curNode = tempGrid.filter((obj) => obj.isStart === true).shift();
    let curPos = curNode.position;
    let curDirection = Math.floor(Math.random() * 4);
    let directionTwo = (curDirection + 1) % 4;
    let directionThree = (curDirection + 2) % 4;
    let directionFour = (curDirection + 3) % 4;


    // Return the row and column of an adjacent node in a given direction
    function directionLookup(direction, currentPos) {

        if (direction === 0) {
            return [currentPos[0], currentPos[1] + 1];
        } else if (direction === 1) {
            return [currentPos[0] + 1, currentPos[1]];
        } else if (direction === 2) {
            return [currentPos[0], currentPos[1] - 1];
        } else {
            return [currentPos[0] - 1, currentPos[1]];
        }

    }

    // Return node adjacent to the current node and direction traveled to reach node, if the node is unvisited and not a wall node
    function directionalNode(direction, currentPos) {
        
        let node = getNode(grid, directionLookup(direction, currentPos));

        if (node && node.visited === false && node.isWall === false) {
            return [direction, node, curNode];
        } else {
            return [];
        }

    }

    // Find all adjacent nodes that have not been visited and are not wall nodes; add adjacent node in current direction last
    let nodeStack = [directionalNode(directionTwo, curPos),
        directionalNode(directionThree, curPos),
        directionalNode(directionFour, curPos),
        directionalNode(curDirection, curPos)]
        .filter((obj) => obj.length > 0);;

    // Continue cycling through nodes until hit end node or run out of nodes
    while (endNode.visited === false && nodeStack.length > 0) {

        // Take node off top of stack, which is the adjacent node in the current direction, if it exists
        let nextNodeAndDirection = nodeStack.pop();

        // Update direction based on new node
        curDirection = nextNodeAndDirection[0];
        directionTwo = (curDirection + 1) % 4;
        directionThree = (curDirection + 2) % 4;
        directionFour = (curDirection + 3) % 4;

        // Set path and distance for new node
        if (nextNodeAndDirection[1] !== endNode) {
            nextNodeAndDirection[1].path = nextNodeAndDirection[2].path.concat(nextNodeAndDirection[1]);
        } else {
            nextNodeAndDirection[1].path = nextNodeAndDirection[2].path
        }
        nextNodeAndDirection[1].weightedDistance = nextNodeAndDirection[2].weightedDistance + nextNodeAndDirection[1].weight

        // Set new node to current
        curNode = nextNodeAndDirection[1];
        curPos = curNode.position;

        // Find all adjacent nodes that have not been visited and are not wall nodes; add adjacent node in current direction last
        let adjNodes = [directionalNode(directionTwo, curPos),
            directionalNode(directionThree, curPos),
            directionalNode(directionFour, curPos),
            directionalNode(curDirection, curPos)];

        // Append adjacent nodes to stack of adjacent but unvisited nodes
        nodeStack = nodeStack.concat(adjNodes);
        nodeStack = nodeStack.filter((obj) => obj.length > 0);

        // Mark current node as visited
        curNode.visited = true;
        visitedNodes.push(curNode);
        unvisitedNodes.filter((obj) => obj.visited === false);
        nodeStack.filter((obj) => obj.visited === false); 

    }

    // Delay counter for staggering animations
    let delCount = 1;
    
    // Color nodes in order visited
    for (let i = 0; i < visitedNodes.length; i++) {

        function colorVisitedNode() {
            let node = visitedNodes[i]; 
            let button = getButton(node.position); 
            if (!node.isStart && !node.isEnd) { 
                button.style.background = "#6699cc";
            }  
        }
        
        setTimeout(colorVisitedNode, 50 * delCount);
        delCount++;

    }

    // Color path, if it exists
    if (endNode.visited === true) {
        for (let i = 0; i < endNode.path.length; i++) {

            function colorShortestPath() {
                let node = endNode.path[i]; 
                let button = getButton(node.position); 
                button.style.background = "#fed8b1";
            }
            
            setTimeout(colorShortestPath, 50 * delCount);
            delCount++;

        }
    }

    // Announce shortest distance
    document.querySelector("#alert").classList.remove("d-none");
    document.querySelector("#alert-head").innerHTML = `${currentAlgorithm}`;
    
    if (endNode.weightedDistance < Infinity) {
        document.querySelector("#alert-body").innerHTML = `
            The end node was found ${endNode.weightedDistance} blocks away from the start node.<br>
            Depth-first search does not guarantee the shortest, weighted path.
        `;
    } else {
        document.querySelector("#alert-body").innerHTML = `
            The end node cannot be reached
        `;
    }

}


// Run breadth-first
function runBreadthFirst() {

    let tempGrid = [...grid];

    startNode = tempGrid.filter((obj) => obj.isStart === true).shift();
    endNode = tempGrid.filter((obj) => obj.isEnd === true).shift();

    if (!startNode || !endNode) {
        return confirm("Please set start and end positions.")
    }

    startPos = startNode.position;
    endPos = endNode.position;

    // Initial settings - all nodes unvisited, current node is start node
    let unvisitedNodes = [...grid];
    let visitedNodes = [];
    let curNode = unvisitedNodes.filter((obj) => obj.isStart === true).shift();
    let curPos = curNode.position;
    
    // Continue cycling through nodes until hit end node or all unvisited nodes are unreachable
    while (endNode.visited === false && curNode.unweightedDistance < Infinity) {

        // Find all adjacent nodes
        let upNode = getNode(grid, [curPos[0], curPos[1] + 1]);
        let rightNode = getNode(grid, [curPos[0] + 1, curPos[1]]);
        let downNode = getNode(grid, [curPos[0], curPos[1] - 1]);
        let leftNode = getNode(grid, [curPos[0] - 1, curPos[1]]);

        // Remove previously visited and wall nodes
        let adjNodes = [upNode, rightNode, downNode, leftNode]
            .filter((obj) => obj !== undefined)
            .filter((obj) => obj.visited === false)
            .filter((obj) => obj.isWall === false);

        // Update distance of and shortest path to adjacent nodes
        for (let i = 0; i < adjNodes.length; i++) {
            
            adjNodes[i].weightedDistance = curNode.weightedDistance + adjNodes[i].weight;
            adjNodes[i].unweightedDistance = curNode.unweightedDistance + 1;

            if (adjNodes[i] !== endNode) {
                adjNodes[i].path = curNode.path.concat(adjNodes[i]);
            } else {
                adjNodes[i].path = curNode.path
            }
      
        }

        // Set current node to visited and remove current node from unvisited set
        curNode.visited = true;
        visitedNodes.push(curNode);
        unvisitedNodes.filter((obj) => obj.visited === false);

        // Set current node to unvisited node with shortest unweighted distance
        curNode = unvisitedNodes.sort((a, b) => a.unweightedDistance - b.unweightedDistance).shift();
        curPos = curNode.position;

    }

    // Delay counter for staggering animations
    let delCount = 1;
    
    // Color nodes in order visited
    for (let i = 0; i < visitedNodes.length; i++) {

        function colorVisitedNode() {
            let node = visitedNodes[i]; 
            let button = getButton(node.position); 
            if (!node.isStart && !node.isEnd) { 
                button.style.background = "#6699cc";
            }  
        }
        
        setTimeout(colorVisitedNode, 50 * delCount);
        delCount++;

    }

    // Color path, if it exists
    if (endNode.weightedDistance < Infinity) {
        for (let i = 0; i < endNode.path.length; i++) {

            function colorShortestPath() {
                let node = endNode.path[i]; 
                let button = getButton(node.position); 
                button.style.background = "#fed8b1";
            }
            
            setTimeout(colorShortestPath, 50 * delCount);
            delCount++;

        }
    }

    // Announce shortest distance
    document.querySelector("#alert").classList.remove("d-none");
    document.querySelector("#alert-head").innerHTML = `${currentAlgorithm}`;
    
    if (endNode.weightedDistance < Infinity) {
        document.querySelector("#alert-body").innerHTML = `
            The end node was found ${endNode.weightedDistance} blocks away from the start node.<br>
            Breadth-first search does not guarantee the shortest, weighted path.
        `;
    } else {
        document.querySelector("#alert-body").innerHTML = `
            The end node cannot be reached
        `;
    }

}



// Run A* algorithm
function runAStar() {

    let tempGrid = [...grid];

    startNode = tempGrid.filter((obj) => obj.isStart === true).shift();
    endNode = tempGrid.filter((obj) => obj.isEnd === true).shift();

    if (!startNode || !endNode) {
        return confirm("Please set start and end positions.")
    }

    startPos = startNode.position;
    endPos = endNode.position;

    // Initial settings - all nodes unvisited, current node is the start node
    let unvisitedNodes = [...grid];
    let visitedNodes = [];
    let curNode = unvisitedNodes.filter((obj) => obj.isStart === true).shift();
    let curPos = curNode.position;

    // Euclidean distance calculator (the chosen heuristic for the A* algorithm) 
    function euclideanDistance(pos1, pos2) {
        return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2))
    }
    
    // Continue cycling through nodes until hit end node or all unvisited nodes are unreachable
    while (endNode.visited === false && curNode.weightedDistance < Infinity) {

        // Find all adjacent nodes
        let upNode = getNode(grid, [curPos[0], curPos[1] + 1]);
        let rightNode = getNode(grid, [curPos[0] + 1, curPos[1]]);
        let downNode = getNode(grid, [curPos[0], curPos[1] - 1]);
        let leftNode = getNode(grid, [curPos[0] - 1, curPos[1]]);

        // Remove previously visited and wall nodes
        let adjNodes = [upNode, rightNode, downNode, leftNode]
            .filter((obj) => obj !== undefined)
            .filter((obj) => obj.visited === false)
            .filter((obj) => obj.isWall === false);

        // Update distance of and shortest path to adjacent nodes
        for (let i = 0; i < adjNodes.length; i++) {
            
            let tempHeuristicDistance = curNode.weightedDistance + adjNodes[i].weight + euclideanDistance(adjNodes[i].position, endNode.position);
            let tempWeightedDistance = curNode.weightedDistance + adjNodes[i].weight;

            if (tempWeightedDistance < adjNodes[i].weightedDistance) {
                adjNodes[i].weightedDistance = tempWeightedDistance;
                adjNodes[i].heuristicDistance = tempHeuristicDistance;
                if (adjNodes[i] !== endNode) {
                    adjNodes[i].path = curNode.path.concat(adjNodes[i]);
                } else {
                    adjNodes[i].path = curNode.path
                }
            }
        
        }

        // Set current node to visited and remove current node from unvisited set
        curNode.visited = true;
        visitedNodes.push(curNode);
        unvisitedNodes.filter((obj) => obj.visited === false);

        // Set current node to unvisited node with shortest distance
        curNode = unvisitedNodes.sort((a, b) => a.heuristicDistance - b.heuristicDistance).shift();
        curPos = curNode.position;

    }

    // Delay counter for staggering animations
    let delCount = 1;
    
    // Color nodes in order visited
    for (let i = 0; i < visitedNodes.length; i++) {

        function colorVisitedNode() {
            let node = visitedNodes[i]; 
            let button = getButton(node.position); 
            if (!node.isStart && !node.isEnd) { 
                button.style.background = "#6699cc";
            }  
        }
        
        setTimeout(colorVisitedNode, 50 * delCount);
        delCount++;

    }

    // Color shortest path, if it exists
    if (endNode.weightedDistance < Infinity) {
        for (let i = 0; i < endNode.path.length; i++) {

            function colorShortestPath() {
                let node = endNode.path[i]; 
                let button = getButton(node.position); 
                button.style.background = "#fed8b1";
            }
            
            setTimeout(colorShortestPath, 50 * delCount);
            delCount++;

        }
    }

    // Announce shortest distance
    document.querySelector("#alert").classList.remove("d-none");
    document.querySelector("#alert-head").innerHTML = `${currentAlgorithm}`;
    
    if (endNode.weightedDistance < Infinity) {
        document.querySelector("#alert-body").innerHTML = `
            The end node was found ${endNode.weightedDistance} blocks away from the start node.<br>
            A* search with a Euclidean heuristic guarantees the shortest, weighted path.
        `;
    } else {
        document.querySelector("#alert-body").innerHTML = `
            The end node cannot be reached
        `;
    }

}

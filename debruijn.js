function readsToKmers(k, reads) {
    var kmers = [];
    for (i = 0; i < reads.length; i++) {
        for (j = 0; j < reads[i].length - k + 1; ++j) {
            kmers.push(reads[i].substring(j, j + k));
        }
    }
    return kmers;
}

function validateReadsString(readsString) {
    var validChars = "ACGT\n";
    for (i = 0; i < readsString.length; i++) {
        if (!validChars.includes(readsString[i])) {
            return false;
        }
    }
    return true;
}

function makeGraph(k, reads) {
    var kmers = readsToKmers(k, reads);
    var graph = {};

    for (let i = 0; i < kmers.length; i++) {
        let left = kmers[i].substring(0, kmers[i].length - 1);
        let right = kmers[i].substring(1, kmers[i].length);

        if (left in graph) graph[left].push(right);
        else graph[left] = [right];

        if (!(right in graph)) graph[right] = [];
    }

    return graph;
}


function toNetworkData(graph) {
    var nodesData = [];
    var edgesData = [];

    var keys = Object.keys(graph);
    var edges = {};

    for (let key in graph) {
        nodesData.push({
            id: nodesData.length,
            label: key,
            shape: 'box',
            color: '#000000',
            font: {
                color: 'white'
            }
        });
        graph[key].forEach(function(item, index) {
            let e = key[0] + item;
            if (e in edges) edges[e].count++; // increment count of the edge
            else edges[e] = {
                from: keys.indexOf(key),      // or intialize the edge
                to: keys.indexOf(item),   
                count: 1
            };
        });
    }

    for (let key in edges) {
        edgesData.push({
            from: edges[key].from,
            to: edges[key].to,
            arrows: 'to',
            label: key + "(" + String(edges[key].count) + ")",
            font: {
                align: 'top'
            }
        });
    }

    return {
        nodes: nodesData,
        edges: edgesData
    };
}

function colorNet(networkData){
    var parentCounts = {}; // Object to count occurrences of each 'from key
    var childCounts = {}; // Object to count occurrences of each 'to' key

    // Count occurrences of each 'parent' key
    networkData.edges.forEach(edge => {
        const parentKey = edge.from;
        if (parentCounts[parentKey]) {
            parentCounts[parentKey]++;
        } else {
            parentCounts[parentKey] = 1;
        }        
        const childKey = edge.to;
        if (childCounts[childKey]) {
            childCounts[childKey]++;
        } else {
            childCounts[childKey] = 1;
        }
    });

    // Filter edges that are part of unitig
    var uNodes = networkData.nodes.filter(node => parentCounts[node.id] === 1 && childCounts[node.id] === 1);

    uNodes.forEach(node => {
        networkData.nodes.find(nnode => nnode.id === node.id).color = '#3300ff'
    })
    // merge edges
    

    return networkData
}

function compactNet(networkData){
    compNodes = networkData.nodes.filter(node => node.color !== '#3300ff');
    compNodeIds = new Set(compNodes.map(node => node.id));
    compEdges = networkData.edges.filter(edge => compNodeIds.has(edge.from))
    compEdges.forEach(edge => {
            if(!compNodeIds.has(edge.to)){
                degr = 0
                while(!compNodeIds.has(edge.to)){
                    degr++
                    nextEdge = networkData.edges.find(nxtedge => nxtedge.from === edge.to)
                    edge.to = nextEdge.to;
                    edge.label = edge.label.substring(0,degr) + nextEdge.label
            }}
    })

    return {
        nodes: compNodes,
        edges: compEdges
    }
}


function visualizeNetwork(networkData) {
    // create a network
    var container = document.getElementById('mynetwork');

    // provide the data in the vis format
    var data = {
        nodes: new vis.DataSet(networkData.nodes),
        edges: new vis.DataSet(networkData.edges),
    };

    var options = {
        edges: {
            length: 200, // Adjust the length of the edges (in pixels)
        },
    };
    // initialize your network!
    var network = new vis.Network(container, data, options);
}

function readsMin(reads) {
    return reads.reduce(function (p, v) {
      return ( p.length < v.length ? p : v );
    });
}

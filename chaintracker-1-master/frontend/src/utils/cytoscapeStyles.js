export const cytoscapeStyles = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'width': '60px',
      'height': '60px',
      'font-size': '10px',
      'font-weight': 'bold',
      'text-valign': 'center',
      'text-halign': 'center',
      'background-color': '#18181b', // zinc-900
      'color': '#fff',
      'border-width': '2px',
      'border-color': '#3f3f46', // zinc-700
      'text-outline-width': '2px',
      'text-outline-color': '#000',
    }
  },
  {
    selector: 'node[type="illicit"]',
    style: {
      'background-color': '#ffffff', // white
      'border-color': '#ffffff',
      'color': '#000',
      'text-outline-color': '#fff',
      'shadow-blur': '20px',
      'shadow-color': '#ffffff',
      'shadow-opacity': '0.8',
    }
  },
  {
    selector: 'node[type="licit"]',
    style: {
      'background-color': '#3f3f46', // zinc-700
      'border-color': '#52525b', // zinc-600
    }
  },
  {
    selector: 'node[type="suspicious"]',
    style: {
      'background-color': '#a1a1aa', // zinc-400
      'border-color': '#d4d4d8', // zinc-300
    }
  },
  {
    selector: 'node[type="unknown"]',
    style: {
      'background-color': '#18181b', // zinc-900
      'border-color': '#27272a', // zinc-800
      'border-style': 'dashed',
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 3,
      'line-color': '#3f3f46',
      'target-arrow-color': '#3f3f46',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'arrow-scale': 1.5,
      'opacity': 0.8,
    }
  }
];

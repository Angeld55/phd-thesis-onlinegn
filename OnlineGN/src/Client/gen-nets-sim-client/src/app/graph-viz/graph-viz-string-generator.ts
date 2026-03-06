import { AlgorithmInput, AlgorithmPlace } from './algorithm-input.model';

function generateInvisibleNodes(
  ss: string[],
  transitionName: string,
  inputsSize: number,
): void {
  // Creating the invisible nodes
  for (let i = 0; i < inputsSize; i++) {
    ss.push('\n');
    ss.push(
      `invis_node_${transitionName}_${i}[color = black, shape = point, width = 0.01, height = 0.01, class="invis_node invis_node_${transitionName}_${i}"];`,
    );
    ss.push('\n');
  }
}

function generateEdgeBetweenInvisibleNodesAndTransition(
  ss: string[],
  transitionName: string,
  inputsSize: number,
): void {
  for (let i = 0; i < inputsSize; i++) {
    ss.push('\n');
    ss.push(
      `invis_node_${transitionName}_${i} -> ${transitionName}:w [color = black, class="invis_node_${transitionName}_${i}___${transitionName}"];`,
    );
    ss.push('\n');
  }
}

function generateOutgoingPlacesFromTransition(
  ss: string[],
  destinations: string[],
): void {
  ss.push('{ rank = same; ');
  for (const outputPlace of destinations) {
    ss.push('\n');
    ss.push(`${outputPlace};`);
    ss.push('\n');
  }
  ss.push('}');
  ss.push('\n');
}

function generateOutgoingEdgesFromTransition(
  ss: string[],
  transitionName: string,
  destinations: string[],
): void {
  for (const outputPlace of destinations) {
    ss.push('\n');
    ss.push(
      `${transitionName} -> ${outputPlace} [color = black, class="${transitionName}___${outputPlace}"];`,
    );
    ss.push('\n');
  }
}

function generateTransitionsString(
  ss: string[],
  transitionToOutputs: Map<string, string[]>,
  transitionToInputs: Map<string, string[]>,
): string {
  transitionToOutputs.forEach((outputs, transitionName) => {
    const inputsSize: number =
      transitionToInputs.get(transitionName)?.length || 0;

    const transitionWidth: number = 0.01;

    ss.push('\n');
    ss.push(`subgraph cluster_${transitionName} {`);
    ss.push('\n');
    ss.push('style=invis');
    ss.push('\n');
    ss.push(`subgraph cluster_${transitionName}_0 {`);
    ss.push('\n');
    ss.push(
      `${transitionName}[shape=rect, height=${Math.max(
        outputs.length,
        inputsSize,
      )}, width=${transitionWidth}, label = "", fixedsize=true, class="transition ${transitionName}"];`,
    );
    ss.push('\n');

    generateInvisibleNodes(ss, transitionName, inputsSize);
    generateEdgeBetweenInvisibleNodesAndTransition(
      ss,
      transitionName,
      inputsSize,
    );

    ss.push('}'); // END cluster of subgraph - 2
    ss.push('\n');

    const outputPlaces = transitionToOutputs.get(transitionName) || [];
    generateOutgoingPlacesFromTransition(ss, outputPlaces);
    generateOutgoingEdgesFromTransition(ss, transitionName, outputPlaces);

    ss.push('}'); // END cluster of subgraph - 1
    ss.push('\n');
  });

  return ss.join(''); // Joining the string array into a single string
}

function fillMaps(
  genNet: AlgorithmPlace[],
  transitionToOutputs: Map<string, string[]>,
  transitionToInputs: Map<string, string[]>,
  placeToTransition: Map<string, string>,
): void {
  genNet.forEach((place) => {
    if (place.beginTransition !== undefined) {
      const findItOutputs = transitionToOutputs.get(place.beginTransition);
      if (findItOutputs) {
        findItOutputs.push(place.name);
      } else {
        transitionToOutputs.set(place.beginTransition, [place.name]);
      }
    }

    if (place.endTransition !== undefined) {
      const findItInputs = transitionToInputs.get(place.endTransition);
      if (findItInputs) {
        findItInputs.push(place.name);
      } else {
        transitionToInputs.set(place.endTransition, [place.name]);
      }

      placeToTransition.set(place.name, place.endTransition);
    }
  });
}

function generateCircleNode(res: string[], genNet: AlgorithmPlace[]): void {
  genNet.forEach((place) => {
    res.push('\n');
    res.push(`${place.name} [shape = circle, width=.3, label = "", class="place ${place.name}"];`);
    res.push('\n');
  });
}

function getFirstFreeInvisibleNode(
  transStr: string,
  transitionToFreeInvisNodeIndex: Map<string, number>,
): number {
  const invisNodeIndex: number =
    transitionToFreeInvisNodeIndex.get(transStr) || 0;

  transitionToFreeInvisNodeIndex.set(transStr, invisNodeIndex + 1);

  return invisNodeIndex;
}

function generateOutputEdgesFromPlaces(
  res: string[],
  placeToTransition: Map<string, string>,
): void {
  const transitionToFreeInvisNodeIndex: Map<string, number> = new Map();

  placeToTransition.forEach((transition, place) => {
    const invisNodeIndex: number = getFirstFreeInvisibleNode(
      transition,
      transitionToFreeInvisNodeIndex,
    );

    res.push('\n');
    res.push(
      `${place} -> invis_node_${transition}_${invisNodeIndex} [arrowhead=none, color=black, class="${place}___invis_node_${transition} i${invisNodeIndex}"];`,
    );
    res.push('\n');
  });
}

function isValidInput(
  transitionToOutputs: Map<string, string[]>,
  transitionToInputs: Map<string, string[]>,
  placeToTransition: Map<string, string>, // still not used
): boolean {
  for (const [transitionName, outputs] of transitionToOutputs) {
    if (!transitionToInputs.has(transitionName)) {
      console.log(`Transition ${transitionName} has no input places!`);
      return false;
    }
  }

  // Check transitionToInputs
  for (const [transitionName, inputs] of transitionToInputs) {
    if (!transitionToOutputs.has(transitionName)) {
      console.log(`Transition ${transitionName} has no output places!`);
      return false;
    }
  }

  return true;
}

export function generateGraphVizString(input: AlgorithmInput): string {
  const transitionToOutputs = new Map<string, string[]>();
  const transitionToInputs = new Map<string, string[]>();
  const placeToTransition = new Map<string, string>();

  fillMaps(
    input.places,
    transitionToOutputs,
    transitionToInputs,
    placeToTransition,
  );

  if (
    !isValidInput(transitionToOutputs, transitionToInputs, placeToTransition)
  ) {
    return '';
  }

  const res: string[] = [
    'digraph G { ',
    'rankdir=LR; ',
    'splines=ortho;',
    '\n',
  ];

  generateTransitionsString(res, transitionToOutputs, transitionToInputs);

  generateCircleNode(res, input.places);
  generateOutputEdgesFromPlaces(res, placeToTransition);

  res.push('}');

  return res.join('');
}

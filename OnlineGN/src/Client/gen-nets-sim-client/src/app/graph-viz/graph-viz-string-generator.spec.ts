import { generateGraphVizString } from './graph-viz-string-generator';
import { AlgorithmInput, AlgorithmPlace } from './algorithm-input.model';

describe('generateGraphVizString', () => {
  it('should generate a valid GraphViz string for a simple input', () => {
    const input: AlgorithmInput = {
      places: [
        { name: 'P1', beginTransition: 'T1', endTransition: undefined },
        { name: 'P2', beginTransition: undefined, endTransition: 'T1' },
      ],
    };

    const result = generateGraphVizString(input);

    expect(result).toContain('digraph G {');
    expect(result).toContain('rankdir=LR;');
    expect(result).toContain('splines=ortho;');
    expect(result).toContain('P1 [shape = circle');
    expect(result).toContain('P2 [shape = circle');
    expect(result).toContain('T1[shape=rect');
    expect(result).toContain('P2 -> invis_node_T1_0');
    expect(result).toContain('invis_node_T1_0 -> T1:w');
    expect(result).toContain('T1 -> P1');
    expect(result).toContain('}');
  });

  it('should return an empty string if input is invalid', () => {
    const input: AlgorithmInput = {
      places: [
        { name: 'P1', beginTransition: 'T1', endTransition: undefined },
        { name: 'P2', beginTransition: undefined, endTransition: undefined },
      ],
    };

    const result = generateGraphVizString(input);

    expect(result).toBe('');
  });

  it('should handle empty input gracefully', () => {
    const input: AlgorithmInput = {
      places: [],
    };

    const result = generateGraphVizString(input);

    expect(result).toBe('digraph G { rankdir=LR; splines=ortho;\n}');
  });
});

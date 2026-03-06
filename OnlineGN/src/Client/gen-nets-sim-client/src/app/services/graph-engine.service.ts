import * as d3 from 'd3';
import { GraphNode } from '../models/graph-data.model';
import { translateAlong } from '../d3/animations';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SimulationSettings } from '../models/get-net-settings.model';
import { graphviz } from 'd3-graphviz';
import {
  getTrianglePointsForPolygon,
  TriangleOrientation,
} from '../d3/drawings';
import {
  createPathDFromPoints,
  doubleCompare,
  getPointsFromPath,
  Point,
} from '../d3/drag-behaviour';

export type TokensInPlaces = { [name: string]: number };

@Injectable()
export class GraphEngineServiceFactory {
  public create(selector: string, simulationSettings: SimulationSettings) {
    return new GraphEngineService(selector, simulationSettings);
  }
}

export type MouseHoverEvent = {
  event: any;
  node: {
    name: string;
    type: string;
  };
};

export class GraphEngineService {
  public nodeClicked: Subject<GraphNode> = new Subject<GraphNode>();
  public elementClicked: Subject<any> = new Subject<any>();

  public elementEntered = new Subject<MouseHoverEvent>();
  public elementExited = new Subject<MouseHoverEvent>();

  private svg: any;

  constructor(
    private selector: string,
    private simulationSettings: SimulationSettings,
  ) {
    d3.select(this.selector).selectAll('*').remove();
  }

  public get stepDurationMS(): number {
    return this.simulationSettings.stepDurationMS;
  }

  private setupAfterLoad(
    placeIdToTransitionId:
      | { [placeId: string]: string }
      | undefined = undefined,
  ) {
    this.svg = d3.select(this.selector).select('svg');
    this.svg.attr('width', '100%').attr('height', '100%');
    this.svg.attr('style', 'border: none;');
    if (placeIdToTransitionId) {
      this.cleanInvisibleNodes(placeIdToTransitionId);
    }
    this.svg
      .selectAll('g.node.transition,g.node.place,g.edge')
      .on('click', (event: any, d: any) => this.onElementClick(event, d));

    this.svg
      .selectAll('g.node.transition')
      .on('mouseenter', (event: any, d: any) =>
        this.elementEntered.next({ event, node: this.getNode(event) }),
      )
      .on('mouseleave', (event: any, d: any) =>
        this.elementExited.next({ event, node: this.getNode(event) }),
      );
  }

  private addTokensCountLabels() {
    this.svg
      .selectAll('.node.place')
      .append('text')
      .attr('x', (d: any) => {
        const txt = d.children.find((c: any) => c.tag === 'ellipse');
        return txt.center.x;
      })
      .attr('y', (d: any) => {
        const txt = d.children.find((c: any) => c.tag === 'ellipse');
        return parseFloat(txt.center.y) + 4;
      })
      .attr('class', 'node-tokens-count')
      .attr('text-anchor', 'middle')
      .text('0')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px');
  }

  private addPlaceNameLabels() {
    this.svg
      .selectAll('.node.place')
      .append('text')
      .attr('x', (d: any) => {
        const ellipse = d.children.find((c: any) => c.tag === 'ellipse');
        return ellipse.center.x;
      })
      .attr('y', (d: any) => {
        const ellipse = d.children.find((c: any) => c.tag === 'ellipse');
        return parseFloat(ellipse.center.y) - 13;
      })
      .attr('class', 'node-name')
      .text((d: any) => d.key)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px');
  }

  private addTransitionNameLabels() {
    this.svg
      .selectAll('.node.transition')
      .append('text')
      .attr('x', (d: any) => {
        const polygon = d.children.find((c: any) => c.tag === 'polygon');
        return polygon.center.x;
      })
      .attr('y', (d: any) => {
        const polygon = d.children.find((c: any) => c.tag === 'polygon');
        return polygon.bbox.y - 10;
      })
      .text((d: any) => d.key)
      .attr('class', 'transition-name')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px');

    this.svg
      .selectAll('.node.transition')
      .append('polygon')
      .attr('class', 'triangle')
      .attr('points', (d: any) => {
        const polygon = d.children.find((c: any) => c.tag === 'polygon');
        return getTrianglePointsForPolygon(
          polygon.center.x,
          polygon.bbox.y,
          7.5,
          7.5,
          TriangleOrientation.Bottom,
        );
      });
  }

  public loadFromDotString(
    dotString: string,
    callback: Function,
    placeIdToTransitionId: {
      [placeId: string]: string;
    },
  ): void {
    d3.select(this.selector).append('g');
    graphviz(this.selector + '>g', {
      zoom: true,
      zoomScaleExtent: [0.1, 100],
      zoomTranslateExtent: [
        [-10000, -10000],
        [10000, 10000],
      ],
    }).renderDot(dotString, () => {
      this.setupAfterLoad(placeIdToTransitionId);
      this.addPlaceNameLabels();
      this.addTransitionNameLabels();
      this.addTokensCountLabels();
      callback();
    });
  }

  public loadFromSvg(csv: string, callback: Function): void {
    d3.select(this.selector).append('g').html(csv);
    this.addZoomBehaviour();

    this.setupAfterLoad();
    // the labels are already in the svg
    callback();
  }

  // reinvented the wheel
  private addZoomBehaviour() {
    const g = d3.select(this.selector).select('svg').select('g');
    function handleZoom(e: any) {
      g.attr('transform', e.transform);
    }
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 100])
      .translateExtent([
        [-10000, -10000],
        [10000, 10000],
      ])
      .on('zoom', handleZoom);

    const initialTransform = parseTransform(g.attr('transform'));
    const transform = d3.zoomIdentity
      .translate(initialTransform.translate.x, initialTransform.translate.y)
      .scale(initialTransform.scale);
    d3.select('svg').call(zoom.transform as any, transform);
    d3.select('svg').call(zoom as any);
  }

  public updateNodesCount(nodes: TokensInPlaces) {
    for (const nodeId in nodes) {
      this.svg
        .select(`.${nodeId}`)
        .select('.node-tokens-count')
        .text(nodes[nodeId]);
    }
  }

  public animate(
    fromNodeId: string,
    toNodeId: string,
    text: string,
    callback: Function = () => {},
  ): void {
    const group = this.createMovingCircle(text);

    let path: any = this.svg
      .select(`.edge.${fromNodeId}___${toNodeId}`)
      .select('path');

    group
      .transition()
      .duration(this.simulationSettings.stepDurationMS / 2)
      .attrTween('transform', translateAlong(path.node()))
      .on('end', () => {
        group.remove();
        callback();
      });
  }

  private createMovingCircle(text: string) {
    const group = this.svg.select('g.graph').append('g');

    group
      .append('circle')
      .attr('r', 10)
      .attr('fill', 'white')
      .attr('stroke', 'orange')
      .attr('stroke-width', 3);

    group
      .append('text')
      .attr('dy', 3)
      .attr('class', 'node-tokens-count')
      .attr('text-anchor', 'middle')
      .attr('fill', 'red')
      .text(text)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px');

    return group;
  }

  private onElementClick(event: any, d: any): void {
    if (event.defaultPrevented) return; // dragged

    if (!event.currentTarget.classList.contains('edge')) {
      this.onNodeClick(event, d);
    }

    this.elementClicked.next(event.currentTarget);
  }

  private onNodeClick(event: any, d: any): void {
    if (event.defaultPrevented) return; // dragged

    this.nodeClicked.next(this.getNode(event));
  }

  public getNode(event: any) {
    const node = event.currentTarget;
    // node {transition|place} {name}
    const [_, type, name] = node.classList.value.split(' ');
    return {
      name,
      type,
    };
  }

  public getPlaceCentre(classList: string): Point {
    const selector = GraphEngineService.getSelectorFromClassString(classList);
    const place = this.svg.select(`${selector}>ellipse`);

    return {
      x: parseFloat(place.attr('cx')),
      y: parseFloat(place.attr('cy')),
    };
  }

  public setPlaceCentre(classList: string, point: Point): void {
    const selector = GraphEngineService.getSelectorFromClassString(classList);
    const place = this.svg.select(`${selector}`);

    // change ellipse position
    place.select('ellipse').attr('cx', point.x).attr('cy', point.y);

    place
      .select('.node-tokens-count')
      .attr('x', point.x)
      .attr('y', point.y + 4);

    place
      .select('.node-name')
      .attr('x', point.x)
      .attr('y', point.y - 13);
  }

  public getEdgePoints(classList: string): Point[] {
    const selector = GraphEngineService.getSelectorFromClassString(classList);
    const path = this.svg.select(`${selector}>path`);

    const d = path.attr('d');

    return getPointsFromPath(d);
  }

  public setEdgePoints(classList: string, points: Point[]) {
    const selector = GraphEngineService.getSelectorFromClassString(classList);
    const edge = this.svg.select(`${selector}`);

    edge.select('path').attr('d', createPathDFromPoints(points));

    const lastPoint = points[points.length - 1];
    edge
      .select('polygon')
      .attr(
        'points',
        getTrianglePointsForPolygon(
          lastPoint.x,
          lastPoint.y,
          10,
          3.5,
          TriangleOrientation.Right,
        ),
      );
  }

  public getTransitionTopLeft(classList: string): Point {
    const selector = GraphEngineService.getSelectorFromClassString(classList);
    const transition = this.svg.select(`${selector}>polygon`);
    const points = GraphEngineService.getPolygonPoints(transition);

    return GraphEngineService.getTopLeftPoint(points);
  }

  public setTransitionTopLeft(classList: string, point: Point) {
    const selector = GraphEngineService.getSelectorFromClassString(classList);
    const transition = this.svg.select(`${selector}`);
    const polygon = transition.select('polygon');

    const points = GraphEngineService.getPolygonPoints(polygon);
    const topLeft = GraphEngineService.getTopLeftPoint(points);

    const xDiff = point.x - topLeft.x;
    const yDiff = point.y - topLeft.y;

    points.forEach((p: Point, i: number) => {
      points[i] = { x: p.x + xDiff, y: p.y + yDiff };
    });

    polygon.attr('points', points.map((p: Point) => `${p.x},${p.y}`).join(' '));

    transition
      .select('.transition-name')
      .attr('x', point.x)
      .attr('y', point.y - 10);

    transition
      .select('.triangle')
      .attr(
        'points',
        getTrianglePointsForPolygon(
          point.x + 0.35,
          point.y,
          7.5,
          7.5,
          TriangleOrientation.Bottom,
        ),
      );
  }

  private static getTopLeftPoint(points: Point[]): Point {
    return points.reduce((prev: Point, curr: Point) => {
      return prev.x <= curr.x && prev.y <= curr.y ? prev : curr;
    });
  }
  private static getBottomRightPoint(points: Point[]): Point {
    return points.reduce((prev: Point, curr: Point) => {
      return prev.x >= curr.x && prev.y >= curr.y ? prev : curr;
    });
  }

  private static getPolygonPoints(polygon: any): Point[] {
    const points = polygon.attr('points').split(' ');
    return points.map((p: string) => {
      const [x, y] = p.split(',');
      return { x: parseFloat(x), y: parseFloat(y) };
    });
  }

  private static getSelectorFromClassString(classList: string): string {
    return '.' + classList.split(' ').join('.');
  }

  private cleanInvisibleNodes(placeIdToTransitionId: {
    [placeId: string]: string;
  }) {
    for (const placeId in placeIdToTransitionId) {
      const transitionId = placeIdToTransitionId[placeId];

      const placeToInvisEdgeGroup = this.svg.select(
        `.edge.${placeId}___invis_node_${transitionId}`,
      );
      const placeToInvisEdgePath = placeToInvisEdgeGroup.select('path').node();
      const indexStrMatch = placeToInvisEdgeGroup
        .attr('class')
        .match(/i[0-9]+/);

      if (indexStrMatch) {
        const indexStr: string = indexStrMatch[0].replace('i', '');

        const invisToTransitionPath = this.svg
          .select(
            `.edge.invis_node_${[transitionId]}_${indexStr}___${transitionId}`,
          )
          .select('path')
          .node();

        const combinedD = this.createCombinedD(
          placeToInvisEdgePath,
          invisToTransitionPath,
        );

        this.createEdge(placeId, transitionId, combinedD);

        // remove old edges and invisible nodes
        this.svg
          .select(
            `.edge.invis_node_${[transitionId]}_${indexStr}___${transitionId}`,
          )
          .remove();
        this.svg
          .select(`.edge.${placeId}___invis_node_${transitionId}`)
          .remove();
        this.svg.selectAll('.invis_node').remove();
      }
    }
  }

  public createCombinedD(firstPath: any, secondPath: any): string {
    const startPoints = getPointsFromPath(firstPath.getAttribute('d'));
    const lastPointToInvis = startPoints[startPoints.length - 1];
    const endPoints = getPointsFromPath(secondPath.getAttribute('d'));
    // fix the last point of the first path
    lastPointToInvis.y = endPoints[0].y;
    startPoints.push(endPoints[1]);
    return createPathDFromPoints(startPoints);
  }

  public createEdge(from: string, to: string, d: string) {
    const newGroup = this.svg
      .select('g.graph')
      .append('g')
      .attr('class', `edge ${from}___${to}`);
    newGroup
      .append('path')
      .attr('d', d)
      .attr('fill', 'none')
      .attr('stroke', 'black');
    const points = getPointsFromPath(d);
    const lastPoint = points[points.length - 1];
    newGroup
      .append('polygon')
      .attr('stroke', 'black')
      .attr('fill', 'black')
      .attr(
        'points',
        getTrianglePointsForPolygon(
          lastPoint.x,
          lastPoint.y,
          10,
          3.5,
          TriangleOrientation.Right,
        ),
      );
  }

  public getTransitionLength(classList: string): number {
    const selector = GraphEngineService.getSelectorFromClassString(classList);
    const polygon = this.svg.select(`${selector}>polygon`);

    const points = GraphEngineService.getPolygonPoints(polygon);
    const topLeftPoint = GraphEngineService.getTopLeftPoint(points);
    const bottomRightPoint = GraphEngineService.getBottomRightPoint(points);

    return Math.abs(topLeftPoint.y - bottomRightPoint.y);
  }

  public setTransitionLength(classList: string, length: number) {
    const selector = GraphEngineService.getSelectorFromClassString(classList);
    const polygon = this.svg.select(`${selector}>polygon`);

    const points = GraphEngineService.getPolygonPoints(polygon);
    const topLeft = GraphEngineService.getTopLeftPoint(points);

    points.forEach((p: Point, i: number) => {
      if (!doubleCompare(p.y, topLeft.y)) {
        // if not top point
        points[i] = { x: p.x, y: topLeft.y + length };
      }
    });

    polygon.attr('points', points.map((p: Point) => `${p.x},${p.y}`).join(' '));
  }
}

function parseTransform(transformString: string) {
  const translateRegex = /translate\(([^)]+)\)/;
  const scaleRegex = /scale\(([^)]+)\)/;

  const translateMatch = transformString.match(translateRegex);
  const scaleMatch = transformString.match(scaleRegex);

  const translate = translateMatch
    ? translateMatch[1].split(',').map(Number)
    : [0, 0];
  const scale = scaleMatch ? Number(scaleMatch[1]) : 1;

  return {
    translate: {
      x: translate[0],
      y: translate[1],
    },
    scale: scale,
  };
}

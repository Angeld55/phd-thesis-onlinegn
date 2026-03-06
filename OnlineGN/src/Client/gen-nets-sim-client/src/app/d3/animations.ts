// Returns an attrTween for translating along the specified path element.
export function translateAlong(path: any) {
  const l = path.getTotalLength();
  return (d: any, i: any, a: any) => {
    return (t: any) => {
      const p = path.getPointAtLength(t * l);
      return 'translate(' + p.x + ',' + p.y + ')';
    };
  };
}

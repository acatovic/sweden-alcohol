"""Trace colored line centres from the supplied raster, not original CAN observations.
Axes calibrated manually against visible chart boundaries. Missing pixels interpolate.
"""
from PIL import Image
import json, statistics
from pathlib import Path
im=Image.open(Path(__file__).parents[1]/'public/graph.png').convert('RGB')
checks={
 'total':lambda r,g,b:g>75 and g>r*1.3 and g>b*1.2,
 'spirits':lambda r,g,b:b>120 and b>r*1.5 and b>g*1.4,
 'beer':lambda r,g,b:r>160 and g>135 and b<145 and r>b*1.5,
 'wine':lambda r,g,b:r>145 and r>g*1.65 and r>b*1.65,
}
traces={}
for key,check in checks.items():
 points={}
 for x in range(55,435):
  ys=[y for y in range(43 if x<254 else 65,261) if check(*im.getpixel((x,y)))]
  if ys: points[x]=statistics.median(ys)
 def value(x):
  a=max((i for i in points if i<=x),default=min(points))
  b=min((i for i in points if i>=x),default=max(points))
  y=points[a] if a==b else points[a]+(points[b]-points[a])*(x-a)/(b-a)
  return round(max(0,(260-y)*12/218),2)
 traces[key]=[value(55+(year-1861)*379/145) for year in range(1861,2007)]
rows=[{'year':year,**{key:values[year-1861] for key,values in traces.items()}} for year in range(1861,2007)]
out=Path(__file__).parents[1]/'app/data.json'
out.write_text(json.dumps(rows,separators=(',',':'))+'\n')
print(f'Traced {len(rows)} approximate annual positions from supplied PNG.')
for year in [1861,1875,1917,1918,1955,1976,2006]: print(rows[year-1861])

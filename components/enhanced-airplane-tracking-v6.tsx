'use client'

import { useState, useEffect } from "react"
import { ArrowUp, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

type PlaneType = {
  id: number
  x: number
  y: number
  r: number
  a: number
  v: number
  d: number
  selected: boolean
}

export function EnhancedAirplaneTrackingV6() {
  const [planes, setPlanes] = useState<PlaneType[]>([
    { id: 1, x: 3, y: 4, r: 5, a: 53.13, v: 100, d: 0, selected: false },
    { id: 2, x: 5, y: 2, r: 5.39, a: 21.80, v: 150, d: 180, selected: false },
    { id: 3, x: 4, y: 4, r: 5.66, a: 45, v: 120, d: 90, selected: false },
    { id: 4, x: 6, y: 6, r: 8.49, a: 45, v: 80, d: 270, selected: false },
    { id: 5, x: 2, y: 3, r: 3.61, a: 56.31, v: 200, d: 45, selected: false },
  ])

  const [newPlane, setNewPlane] = useState({ x: 0, y: 0, r: 0, a: 0, v: 0, d: 0 })
  const [inputMode, setInputMode] = useState<'cartesian' | 'polar'>('cartesian')
  const [transformValues, setTransformValues] = useState({ 
    x: 0, 
    y: 0, 
    angle: 0, 
    scaleX: 1,
    scaleY: 1 
  })
  const [report, setReport] = useState("")
  const [nearAirportDistance, setNearAirportDistance] = useState(0)
  const [nearPlanesDistance, setNearPlanesDistance] = useState(0)
  const [collisionTime, setCollisionTime] = useState(0)
  const [rotateCenter, setRotateCenter] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (inputMode === 'cartesian') {
      const r = Math.sqrt(newPlane.x ** 2 + newPlane.y ** 2)
      const a = (Math.atan2(newPlane.y, newPlane.x) * 180 / Math.PI + 360) % 360
      setNewPlane(prev => ({ ...prev, r: parseFloat(r.toFixed(2)), a: parseFloat(a.toFixed(2)) }))
    } else {
      const x = newPlane.r * Math.cos(newPlane.a * Math.PI / 180)
      const y = newPlane.r * Math.sin(newPlane.a * Math.PI / 180)
      setNewPlane(prev => ({ ...prev, x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) }))
    }
  }, [newPlane.x, newPlane.y, newPlane.r, newPlane.a, inputMode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewPlane(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  const handleTransformInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTransformValues(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  const handleRotateCenterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRotateCenter(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  const handleAddPlane = () => {
    const newId = planes.length > 0 ? Math.max(...planes.map(p => p.id)) + 1 : 1
    setPlanes(prev => [...prev, { id: newId, ...newPlane, selected: false }])
    setNewPlane({ x: 0, y: 0, r: 0, a: 0, v: 0, d: 0 })
    setReport(`Novo avião adicionado com ID ${newId}`)
  }

  const handleSelectPlane = (id: number) => {
    setPlanes(planes.map(plane => 
      plane.id === id ? { ...plane, selected: !plane.selected } : plane
    ))
  }

  const handleDeleteSelected = () => {
    const deletedCount = planes.filter(p => p.selected).length
    setPlanes(planes.filter(plane => !plane.selected))
    setReport(`${deletedCount} avião(ões) excluído(s)`)
  }

  const handleTranslate = () => {
    setPlanes(planes.map(plane => 
      plane.selected ? { 
        ...plane, 
        x: plane.x + transformValues.x, 
        y: plane.y + transformValues.y 
      } : plane
    ))
    setReport(`Aviões selecionados transladados por (${transformValues.x}, ${transformValues.y})`)
    setTransformValues(prev => ({ ...prev, x: 0, y: 0 }))
  }

  const handleScale = () => {
    setPlanes(planes.map(plane => 
      plane.selected ? { 
        ...plane, 
        x: plane.x * transformValues.scaleX, 
        y: plane.y * transformValues.scaleY 
      } : plane
    ))
    setReport(`Aviões selecionados escalonados por fator X: ${transformValues.scaleX}, Y: ${transformValues.scaleY}`)
    setTransformValues(prev => ({ ...prev, scaleX: 1, scaleY: 1 }))
  }

  const handleRotate = () => {
    const angle = transformValues.angle * (Math.PI / 180)
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    setPlanes(planes.map(plane => 
      plane.selected ? { 
        ...plane, 
        x: (plane.x - rotateCenter.x) * cos - (plane.y - rotateCenter.y) * sin + rotateCenter.x, 
        y: (plane.x - rotateCenter.x) * sin + (plane.y - rotateCenter.y) * cos + rotateCenter.y
      } : plane
    ))
    setReport(`Aviões selecionados rotacionados por ${transformValues.angle} graus em torno de (${rotateCenter.x}, ${rotateCenter.y})`)
    setTransformValues(prev => ({ ...prev, angle: 0 }))
    setRotateCenter({ x: 0, y: 0 })
  }

  const handlePlanesNearAirport = () => {
    const nearPlanes = planes.filter(plane => 
      Math.sqrt(plane.x * plane.x + plane.y * plane.y) <= nearAirportDistance
    )
    setPlanes(planes.map(plane => ({
      ...plane,
      selected: nearPlanes.some(p => p.id === plane.id)
    })))
    setReport(`${nearPlanes.length} avião(ões) próximo(s) ao aeroporto`)
    setNearAirportDistance(0)
  }

  const handleNearPlanes = () => {
    const nearPairs: [PlaneType, PlaneType][] = []
    for (let i = 0; i < planes.length; i++) {
      for (let j = i + 1; j < planes.length; j++) {
        const dx = planes[i].x - planes[j].x
        const dy = planes[i].y - planes[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance <= nearPlanesDistance) {
          nearPairs.push([planes[i], planes[j]])
        }
      }
    }
    const nearPlaneIds = new Set(nearPairs.flat().map(p => p.id))
    setPlanes(planes.map(plane => ({
      ...plane,
      selected: nearPlaneIds.has(plane.id)
    })))
    const pairReports = nearPairs.map(([p1, p2]) => `Aviões ${p1.id} e ${p2.id} estão próximos`)
    setReport(pairReports.join('. ') || 'Nenhum par de aviões próximos encontrado')
    setNearPlanesDistance(0)
  }

  const handleCollisionTime = () => {
    const collisions: { plane1: PlaneType; plane2: PlaneType; time: number; point: { x: number; y: number } }[] = [];

    for (let i = 0; i < planes.length; i++) {
        for (let j = i + 1; j < planes.length; j++) {
            const p1 = planes[i];
            const p2 = planes[j];

            // Convert angles to radians and calculate direction vectors
            const angle1 = (p1.d * Math.PI) / 180;
            const angle2 = (p2.d * Math.PI) / 180;

            // Calculate velocity components
            const v1x = p1.v * Math.cos(angle1);
            const v1y = p1.v * Math.sin(angle1);
            const v2x = p2.v * Math.cos(angle2);
            const v2y = p2.v * Math.sin(angle2);

            let x: number, y: number;

            // Detect if any trajectory is vertical
            if (v1x === 0 && v2x === 0) {
                // Both trajectories are vertical and parallel, check if they are collinear
                if (p1.x === p2.x) {
                    // Planes are on the same vertical line, check if they move towards each other
                    const t1 = Math.abs((p2.y - p1.y) / v1y);
                    const t2 = Math.abs((p2.y - p1.y) / v2y);

                    if (t1 <= collisionTime && t2 <= collisionTime && Math.abs(t1 - t2) < 0.1) {
                        collisions.push({
                            plane1: p1,
                            plane2: p2,
                            time: Math.min(t1, t2),
                            point: { x: p1.x, y: (p1.y + p2.y) / 2 }
                        });
                    }
                }
                continue;
            } else if (v1x === 0) {
                // Plane 1 has a vertical trajectory
                x = p1.x;
                y = (v2y / v2x) * (x - p2.x) + p2.y;
            } else if (v2x === 0) {
                // Plane 2 has a vertical trajectory
                x = p2.x;
                y = (v1y / v1x) * (x - p1.x) + p1.y;
            } else {
                // Both planes have non-vertical trajectories
                const m1 = v1y / v1x;
                const m2 = v2y / v2x;
                const b1 = p1.y - m1 * p1.x;
                const b2 = p2.y - m2 * p2.x;

                if (Math.abs(m1 - m2) < 0.0001) {
                    // Trajectories are parallel, check if collinear
                    if (Math.abs(b1 - b2) < 0.0001) {
                        // Planes are on the same line, check if they move towards each other
                        const t1 = Math.abs((p2.x - p1.x) / v1x);
                        const t2 = Math.abs((p2.x - p1.x) / v2x);

                        if (t1 <= collisionTime && t2 <= collisionTime && Math.abs(t1 - t2) < 0.1) {
                            collisions.push({
                                plane1: p1,
                                plane2: p2,
                                time: Math.min(t1, t2),
                                point: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
                            });
                        }
                    }
                    continue;
                }

                // Calculate intersection point
                x = (b2 - b1) / (m1 - m2);
                y = m1 * x + b1;
            }

            // Check if each plane is moving towards the intersection point
            if ((x - p1.x) * v1x < 0 || (x - p2.x) * v2x < 0) continue;

            // Calculate time to reach intersection
            const t1 = v1x !== 0 ? (x - p1.x) / v1x : (y - p1.y) / v1y;
            const t2 = v2x !== 0 ? (x - p2.x) / v2x : (y - p2.y) / v2y;

            // Check if times are positive, nearly simultaneous, and within collision time limit
            if (t1 > 0 && t2 > 0 && Math.abs(t1 - t2) < 0.1 && t1 <= collisionTime && t2 <= collisionTime) {
                collisions.push({
                    plane1: p1,
                    plane2: p2,
                    time: t1,
                    point: { x, y }
                });
            }
        }
    }

    // Process collision results
    if (collisions.length > 0) {
        collisions.sort((a, b) => a.time - b.time);
        const collisionReports = collisions.map(c => 
            `Aviões ${c.plane1.id} e ${c.plane2.id} colidirão em ${c.time.toFixed(2)} segundos no ponto (${c.point.x.toFixed(2)}, ${c.point.y.toFixed(2)})`
        );
        setReport(collisionReports.join('. '));
    } else {
        setReport("Nenhuma colisão detectada dentro do tempo especificado.");
    }

    setCollisionTime(0);
};



  return (
    <div className="container mx-auto p-2 grid gap-2 grid-cols-12 h-screen">
      <div className="col-span-3 space-y-2">
        <RadioGroup defaultValue="cartesian" className="flex space-x-4 mb-4" onValueChange={(value) => setInputMode(value as 'cartesian' | 'polar')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cartesian" id="cartesian" />
            <Label htmlFor="cartesian">Cartesiano</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="polar" id="polar" />
            <Label htmlFor="polar">Polar</Label>
          </div>
        </RadioGroup>

        {inputMode === 'cartesian' ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="x">X</Label>
              <Input id="x" type="number" name="x" value={newPlane.x} onChange={handleInputChange} placeholder="X" />
            </div>
            <div>
              <Label htmlFor="y">Y</Label>
              <Input id="y" type="number" name="y" value={newPlane.y} onChange={handleInputChange} placeholder="Y" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="r">Raio</Label>
              <Input id="r" type="number" name="r" value={newPlane.r} onChange={handleInputChange} placeholder="Raio" />
            </div>
            <div>
              <Label htmlFor="a">Ângulo</Label>
              <Input id="a" type="number" name="a" value={newPlane.a} onChange={handleInputChange} placeholder="Ângulo" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="v">Velocidade</Label>
            <Input id="v" type="number" name="v" value={newPlane.v} onChange={handleInputChange} placeholder="Velocidade" />
          </div>
          <div>
            <Label htmlFor="d">Direção</Label>
            <Input id="d" type="number" name="d" value={newPlane.d} onChange={handleInputChange} placeholder="Direção" />
          </div>
        </div>

        {inputMode === 'cartesian' ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="calculated-r">Raio (calculado)</Label>
              <Input id="calculated-r" type="number" value={newPlane.r} readOnly />
            </div>
            <div>
              <Label htmlFor="calculated-a">Ângulo (calculado)</Label>
              <Input id="calculated-a" type="number" value={newPlane.a} readOnly />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="calculated-x">X (calculado)</Label>
              <Input id="calculated-x" type="number" value={newPlane.x} readOnly />
            </div>
            <div>
              <Label htmlFor="calculated-y">Y (calculado)</Label>
              <Input id="calculated-y" type="number" value={newPlane.y} readOnly />
            </div>
          </div>
        )}

        <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handleAddPlane}>Inserir</Button>
        
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-1">
            <div>
              <Label htmlFor="translate-x">X</Label>
              <Input id="translate-x" type="number" name="x" value={transformValues.x} onChange={handleTransformInputChange} placeholder="X" className="text-xs" />
            </div>
            <div>
              <Label htmlFor="translate-y">Y</Label>
              <Input id="translate-y" type="number" name="y" value={transformValues.y} onChange={handleTransformInputChange} placeholder="Y" className="text-xs" />
            </div>
          </div>
          <Button size="sm" className="w-full" onClick={handleTranslate}>Transladar</Button>
        </div>
        
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-1">
            <div>
              <Label htmlFor="scale-x">Escala X</Label>
              <Input 
                id="scale-x" 
                type="number" 
                name="scaleX" 
                value={transformValues.scaleX} 
                onChange={handleTransformInputChange} 
                placeholder="Escala X" 
                className="text-xs" 
              />
            </div>
            <div>
              <Label htmlFor="scale-y">Escala Y</Label>
              <Input 
                id="scale-y" 
                type="number" 
                name="scaleY" 
                value={transformValues.scaleY} 
                onChange={handleTransformInputChange} 
                placeholder="Escala Y" 
                className="text-xs" 
              />
            </div>
          </div>
          <Button size="sm" className="w-full" onClick={handleScale}>Escalonar</Button>
        </div>
        
        <div className="space-y-1">
          <div>
            <Label htmlFor="rotate-angle">Ângulo</Label>
            <Input id="rotate-angle" type="number" name="angle" value={transformValues.angle} onChange={handleTransformInputChange} placeholder="Ângulo" className="text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div>
              <Label htmlFor="rotate-center-x">Centro X</Label>
              <Input id="rotate-center-x" type="number" name="x" value={rotateCenter.x} onChange={handleRotateCenterChange} placeholder="Centro X" className="text-xs" />
            </div>
            <div>
              <Label htmlFor="rotate-center-y">Centro Y</Label>
              <Input id="rotate-center-y" type="number" name="y" value={rotateCenter.y} onChange={handleRotateCenterChange} placeholder="Centro Y" className="text-xs" />
            </div>
          </div>
          <Button size="sm" className="w-full" onClick={handleRotate}>Rotacionar</Button>
        </div>
      </div>
{/* aqui */}
      <div className="col-span-6 relative border rounded-lg overflow-hidden" style={{ aspectRatio: '1/1' }}>
        <div className="absolute inset-0 grid grid-cols-17 grid-rows-17">
          {Array.from({ length: 289 }).map((_, i) => (
            <div key={i} className="border border-gray-100" />
          ))}
        </div>
        {planes.map((plane) => (
          <div
            key={plane.id}
            className={`absolute ${plane.selected ? 'ring-2 ring-blue-500' : ''}`}
            style={{
              left: `${((plane.x + 8) / 16) * 100}%`,
              top: `${((8 - plane.y) / 16) * 100}%`,
              transform: `translate(-50%, -50%) rotate(${90 - plane.d}deg)`,
            }}
          >
            <ArrowUp className={`w-3 h-3 ${plane.selected ? 'text-blue-500' : 'text-black'}`} />
          </div>
        ))}
        <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-red-500 rounded-full" style={{ transform: 'translate(-50%, -50%)' }} />
      </div>

      <div className="col-span-3 space-y-2">
        <div className="overflow-auto h-[calc(100vh-18rem)]">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>ID</TableHead>
                <TableHead>X</TableHead>
                <TableHead>Y</TableHead>
                <TableHead>R</TableHead>
                <TableHead>A</TableHead>
                <TableHead>V</TableHead>
                <TableHead>D</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planes.map((plane) => (
                <TableRow key={plane.id}>
                  <TableCell className="p-1">
                    <Checkbox checked={plane.selected} onCheckedChange={() => handleSelectPlane(plane.id)} />
                  </TableCell>
                  <TableCell className="p-1">{plane.id}</TableCell>
                  <TableCell className="p-1">{plane.x.toFixed(2)}</TableCell>
                  <TableCell className="p-1">{plane.y.toFixed(2)}</TableCell>
                  <TableCell className="p-1">{plane.r.toFixed(2)}</TableCell>
                  <TableCell className="p-1">{plane.a.toFixed(2)}</TableCell>
                  <TableCell className="p-1">{plane.v.toFixed(2)}</TableCell>
                  <TableCell className="p-1">{plane.d.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Button size="sm" variant="destructive" className="w-full" onClick={handleDeleteSelected}>
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir Selecionados
        </Button>
        <div className="h-20 border rounded-lg p-2 overflow-auto">
          <h3 className="text-sm font-semibold mb-1">Relatório</h3>
          <p className="text-xs">{report}</p>
        </div>
      </div>

      <div className="col-span-12 grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Input 
            type="number" 
            placeholder="Distância do aeroporto" 
            className="text-xs" 
            value={nearAirportDistance} 
            onChange={(e) => setNearAirportDistance(parseFloat(e.target.value) || 0)}
          />
          <Button size="sm" variant="destructive" className="w-full" onClick={handlePlanesNearAirport}>
            Aviões próximos ao aeroporto
          </Button>
        </div>
        <div className="space-y-1">
          <Input 
            type="number" 
            placeholder="Distância entre aviões" 
            className="text-xs" 
            value={nearPlanesDistance} 
            onChange={(e) => setNearPlanesDistance(parseFloat(e.target.value) || 0)}
          />
          <Button size="sm" variant="destructive" className="w-full" onClick={handleNearPlanes}>
            Aviões próximos entre si
          </Button>
        </div>
        <div className="space-y-1">
          <Input 
            type="number" 
            placeholder="Tempo mín. de colisão" 
            className="text-xs" 
            value={collisionTime} 
            onChange={(e) => setCollisionTime(parseFloat(e.target.value) || 0)}
          />
          <Button size="sm" variant="destructive" className="w-full" onClick={handleCollisionTime}>
            Calcular tempo de colisão
          </Button>
        </div>
      </div>
    </div>
  )
}
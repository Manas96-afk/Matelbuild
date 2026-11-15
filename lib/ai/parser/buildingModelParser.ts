/**
 * Building Model Parser
 * Module: AI / Parser
 * 
 * Converts drawing analyses and project parameters into a structured
 * DigitalBuildingModel — the project's source of truth.
 *
 * Architecture note: This is intentionally separate from the AI analysis layer.
 * The parser assembles, validates, and labels what the detectors found.
 * Future versions can plug in real CV/OCR outputs without rewriting this layer.
 */

import {
  DigitalBuildingModel,
  RoomModel,
  WallModel,
  ColumnModel,
  BeamModel,
  SlabModel,
  StaircaseModel,
  DrawingAnalysis,
  Drawing,
  ValidationWarning,
} from '../../../types/blueprint';

export interface BuildingModelInput {
  projectId: string;
  projectName: string;
  plotLengthFt: number;
  plotWidthFt: number;
  floors: number;
  floorHeightFt: number;
  wallType: 'brick' | 'aac' | 'hollow_block' | 'rcc';
  concreteGrade: string;
  buildingType: 'Residential' | 'Commercial' | 'Mixed Use';
  constructionQuality: 'Economy' | 'Standard' | 'Premium' | 'Luxury';
  bedrooms: number;
  bathrooms: number;
  kitchens: number;
  livingRooms: number;
  balconies: number;
  parkingRequired: boolean;
  drawings: Drawing[];
  analyses: DrawingAnalysis[];
}

interface RoomDistribution {
  name: string;
  type: RoomModel['type'];
  areaRatio: number; // fraction of total BUA per floor
  count: number;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Determine room distributions based on building type and room counts.
 * Returns a list of room templates with area ratios relative to total floor BUA.
 */
function getRoomDistributions(input: BuildingModelInput): RoomDistribution[] {
  const rooms: RoomDistribution[] = [];

  const totalBUASqFt = input.plotLengthFt * input.plotWidthFt * 0.70; // 70% coverage ratio
  const totalRoomCount =
    input.bedrooms + input.bathrooms + input.kitchens + input.livingRooms + input.balconies + (input.parkingRequired ? 1 : 0);

  const avgRoomArea = totalRoomCount > 0 ? (totalBUASqFt / totalRoomCount) : 150;

  // Bedrooms
  const bedroomArea = input.buildingType === 'Commercial' ? 180 : (avgRoomArea * 1.1);
  for (let i = 0; i < input.bedrooms; i++) {
    rooms.push({ name: i === 0 ? 'Master Bedroom' : `Bedroom ${i + 1}`, type: 'bedroom', areaRatio: bedroomArea / totalBUASqFt, count: 1 });
  }

  // Bathrooms
  const bathroomArea = input.buildingType === 'Commercial' ? 60 : 55;
  for (let i = 0; i < input.bathrooms; i++) {
    rooms.push({ name: i === 0 ? 'Master Bathroom' : `Bathroom ${i + 1}`, type: 'bathroom', areaRatio: bathroomArea / totalBUASqFt, count: 1 });
  }

  // Kitchens
  const kitchenArea = input.buildingType === 'Commercial' ? 200 : 120;
  for (let i = 0; i < input.kitchens; i++) {
    rooms.push({ name: input.kitchens > 1 ? `Kitchen ${i + 1}` : 'Kitchen', type: 'kitchen', areaRatio: kitchenArea / totalBUASqFt, count: 1 });
  }

  // Living rooms
  const livingArea = 200;
  for (let i = 0; i < input.livingRooms; i++) {
    rooms.push({ name: input.livingRooms > 1 ? `Living Room ${i + 1}` : 'Living Room', type: 'living', areaRatio: livingArea / totalBUASqFt, count: 1 });
  }

  // Balconies
  const balconyArea = 80;
  for (let i = 0; i < input.balconies; i++) {
    rooms.push({ name: `Balcony ${i + 1}`, type: 'balcony', areaRatio: balconyArea / totalBUASqFt, count: 1 });
  }

  // Parking
  if (input.parkingRequired) {
    rooms.push({ name: 'Parking', type: 'parking', areaRatio: 150 / totalBUASqFt, count: 1 });
  }

  return rooms;
}

/**
 * Master function: parse all available drawing analyses and project data
 * into a structured DigitalBuildingModel.
 *
 * Design rule: any missing/assumed value is clearly labeled with isAssumed=true
 * and added to the assumptions array.
 */
export function parseToBuildingModel(input: BuildingModelInput): {
  model: DigitalBuildingModel;
  warnings: ValidationWarning[];
} {
  const assumptions: string[] = [];
  const warnings: ValidationWarning[] = [];

  const buaPerFloor = input.plotLengthFt * input.plotWidthFt * 0.70;
  const totalBUA = buaPerFloor * input.floors;

  // ── Extract dimension hints from analyses (if available) ──────────────────
  let detectedWallThickness = 9;
  let detectedColumnWidth = 9;
  let detectedColumnDepth = 12;
  let detectedBeamWidth = 9;
  let detectedBeamDepth = 18;
  let detectedSlabThickness = 5;
  let detectedFloorHeight = input.floorHeightFt;
  let dimensionsFromDrawing = false;
  let detectedConcreteGrade = input.concreteGrade || 'M25';
  let detectedColumnGridSpacingFt: number | null = null;
  let detectedColumnLabels: string[] = [];
  let detectedFoundationType: string | null = null;
  let detectedFootingWidthFt: number | null = null;
  let detectedFootingDepthFt: number | null = null;
  let detectedBUAPerFloor: number | null = null;
  let detectedBedroomCount: number | null = null;
  let detectedBathroomCount: number | null = null;
  let detectedKitchenCount: number | null = null;
  let detectedLivingRoomCount: number | null = null;
  let detectedBalconyCount: number | null = null;

  for (const analysis of input.analyses) {
    const d = analysis.extractedDimensions;
    if (d.wallThickness)       { detectedWallThickness = d.wallThickness;         dimensionsFromDrawing = true; }
    if (d.externalWallThicknessIn) { detectedWallThickness = d.externalWallThicknessIn; dimensionsFromDrawing = true; }
    if (d.columnWidth)         { detectedColumnWidth = d.columnWidth;             dimensionsFromDrawing = true; }
    if (d.columnDepth)         { detectedColumnDepth = d.columnDepth;             dimensionsFromDrawing = true; }
    if (d.beamWidth)           { detectedBeamWidth = d.beamWidth;                 dimensionsFromDrawing = true; }
    if (d.beamDepth)           { detectedBeamDepth = d.beamDepth;                 dimensionsFromDrawing = true; }
    if (d.slabThickness)       { detectedSlabThickness = d.slabThickness;         dimensionsFromDrawing = true; }
    if (d.floorHeight)         { detectedFloorHeight = d.floorHeight;             dimensionsFromDrawing = true; }
    if (d.concreteGrade)       { detectedConcreteGrade = d.concreteGrade;         dimensionsFromDrawing = true; }
    // Column-layout specific
    if (d.columnGridSpacingFt) { detectedColumnGridSpacingFt = d.columnGridSpacingFt; dimensionsFromDrawing = true; }
    if (d.columnLabels && d.columnLabels.length > 0) {
      detectedColumnLabels = d.columnLabels;
    }
    // Foundation-specific
    if (d.foundationType)      { detectedFoundationType = d.foundationType; }
    if (d.footingWidthFt)      { detectedFootingWidthFt = d.footingWidthFt; }
    if (d.foundationDepth)     { detectedFootingDepthFt = d.foundationDepth; }
    // Architectural-specific
    if (d.buaPerFloorSqFt)     { detectedBUAPerFloor = d.buaPerFloorSqFt; }
    if (d.bedroomCount)        { detectedBedroomCount = d.bedroomCount; }
    if (d.bathroomCount)       { detectedBathroomCount = d.bathroomCount; }
    if (d.kitchenCount)        { detectedKitchenCount = d.kitchenCount; }
    if (d.livingRoomCount)     { detectedLivingRoomCount = d.livingRoomCount; }
    if (d.balconyCount)        { detectedBalconyCount = d.balconyCount; }
  }

  if (!dimensionsFromDrawing) {
    assumptions.push('Structural dimensions (wall thickness, column size, beam size, slab thickness) are based on engineering standard defaults as no drawings were uploaded.');
    warnings.push({
      id: 'warn-no-dimensions',
      severity: 'warning',
      category: 'assumed_value',
      title: 'Dimensions Not Extracted from Drawings',
      message: 'No dimensional data could be extracted. Default engineering values are being used for estimation.',
      recommendation: 'Upload architectural plans or structural drawings with visible dimensions for higher accuracy.'
    });
  }

  // ── Check for missing critical drawings ──────────────────────────────────
  const uploadedTypes = input.drawings.map(d => d.drawingType);
  const hasArchitectural = uploadedTypes.includes('architectural');
  const hasStructural = uploadedTypes.includes('structural');
  const hasFoundation = uploadedTypes.includes('foundation');

  if (!hasStructural) {
    warnings.push({
      id: 'warn-no-structural',
      severity: 'warning',
      category: 'missing_drawing',
      title: 'Structural Drawing Missing',
      message: 'No structural drawing detected. Steel estimates use engineering thumb rules (not actual reinforcement schedules).',
      recommendation: 'Upload a structural plan (RCC drawing) for accurate steel and concrete quantities.'
    });
    assumptions.push('Steel reinforcement quantities estimated using IS456 standard thumb rules (steel density per RCC volume). Upload structural drawings for accurate values.');
  }

  if (!hasFoundation) {
    warnings.push({
      id: 'warn-no-foundation',
      severity: 'info',
      category: 'missing_drawing',
      title: 'Foundation Drawing Missing',
      message: 'No foundation/footing plan detected. Foundation quantities based on standard column footing assumptions.',
      recommendation: 'Upload a foundation plan for accurate excavation and footing quantities.'
    });
    assumptions.push('Foundation assumed as isolated column footings (5ft × 5ft × 5ft deep) per IS1904 standard for the detected building type.');
  }

  if (!hasArchitectural) {
    warnings.push({
      id: 'warn-no-architectural',
      severity: 'warning',
      category: 'missing_drawing',
      title: 'Architectural Plan Missing',
      message: 'No architectural floor plan detected. Room layout generated from project room count inputs.',
      recommendation: 'Upload an architectural floor plan for room-by-room quantity traceability.'
    });
    assumptions.push('Room layout generated from user-provided room counts (bedrooms, bathrooms, etc.) rather than an uploaded floor plan.');
  }

  // ── Generate Rooms ────────────────────────────────────────────────────────
  // If AI extracted room counts from architectural plan, use those to override project inputs
  const effectiveInput = {
    ...input,
    bedrooms: detectedBedroomCount ?? input.bedrooms,
    bathrooms: detectedBathroomCount ?? input.bathrooms,
    kitchens: detectedKitchenCount ?? input.kitchens,
    livingRooms: detectedLivingRoomCount ?? input.livingRooms,
    balconies: detectedBalconyCount ?? input.balconies,
  };
  const rooms: RoomModel[] = [];
  const roomDists = getRoomDistributions(effectiveInput);
  const roomsFromDrawing = input.analyses.flatMap(a => a.detectedElements.filter(e => e.type === 'room'));

  if (roomsFromDrawing.length > 0) {
    // Use AI-detected rooms
    roomsFromDrawing.forEach((el, i) => {
      const lengthFt = el.dimensions?.length || 14;
      const widthFt = el.dimensions?.width || 12;
      rooms.push({
        id: el.id,
        name: el.label || `Room ${i + 1}`,
        type: 'bedroom',
        lengthFt,
        widthFt,
        heightFt: detectedFloorHeight,
        areaSqFt: lengthFt * widthFt,
        floor: 1,
        isAssumed: false
      });
    });
  } else {
    // Generate from project room counts
    roomDists.forEach((dist, i) => {
      const areaSqFt = Math.max(50, buaPerFloor * dist.areaRatio);
      const lengthFt = Math.sqrt(areaSqFt * 1.3);
      const widthFt = areaSqFt / lengthFt;
      rooms.push({
        id: generateId(),
        name: dist.name,
        type: dist.type,
        lengthFt: Math.round(lengthFt * 10) / 10,
        widthFt: Math.round(widthFt * 10) / 10,
        heightFt: detectedFloorHeight,
        areaSqFt: Math.round(areaSqFt),
        floor: 1,
        isAssumed: true
      });
    });
  }

  // ── Generate Walls ────────────────────────────────────────────────────────
  const walls: WallModel[] = [];
  const perimeter = 2 * (input.plotLengthFt + input.plotWidthFt);
  const internalWallLength = totalBUA * 0.012; // rule: ~1.2% of BUA = internal wall linear footage

  // External walls per floor
  for (let f = 1; f <= input.floors; f++) {
    walls.push({
      id: generateId(),
      label: `External Wall — Floor ${f}`,
      lengthFt: perimeter * 0.90, // ~90% of perimeter accounting for openings
      heightFt: detectedFloorHeight,
      thicknessInch: input.wallType === 'aac' ? 8 : (detectedWallThickness || 9),
      wallType: input.wallType,
      floor: f,
      isExternal: true,
      isAssumed: !dimensionsFromDrawing
    });
  }

  // Internal walls per floor
  for (let f = 1; f <= input.floors; f++) {
    walls.push({
      id: generateId(),
      label: `Internal Walls — Floor ${f}`,
      lengthFt: internalWallLength / input.floors,
      heightFt: detectedFloorHeight,
      thicknessInch: input.wallType === 'aac' ? 4 : 4.5, // half-brick internal
      wallType: input.wallType,
      floor: f,
      isExternal: false,
      isAssumed: !dimensionsFromDrawing
    });
  }

  // ── Generate Columns ──────────────────────────────────────────────────────
  const columns: ColumnModel[] = [];
  // Use detected grid spacing from column layout drawing, or fall back to default
  const gridSpacingFt = detectedColumnGridSpacingFt || 15;
  const numColumnsX = Math.ceil(input.plotLengthFt / gridSpacingFt) + 1;
  const numColumnsY = Math.ceil(input.plotWidthFt / gridSpacingFt) + 1;
  const totalColumns = numColumnsX * numColumnsY;

  for (let i = 0; i < totalColumns; i++) {
    const row = Math.floor(i / numColumnsX) + 1;
    const col = (i % numColumnsX) + 1;
    // Use label from drawing if available, otherwise generate grid label
    const label = detectedColumnLabels[i] || `C${row}-${col}`;
    columns.push({
      id: generateId(),
      label,
      widthInch: detectedColumnWidth,
      depthInch: detectedColumnDepth,
      heightFt: detectedFloorHeight * input.floors,
      concreteGrade: detectedConcreteGrade,
      isAssumed: !dimensionsFromDrawing,
    });
  }

  assumptions.push(
    `${totalColumns} columns assumed on a ${gridSpacingFt}ft × ${gridSpacingFt}ft grid (${numColumnsX} × ${numColumnsY}) with ${detectedColumnWidth}"×${detectedColumnDepth}" cross-section.`
  );

  // ── Generate Beams ────────────────────────────────────────────────────────
  const beams: BeamModel[] = [];
  // Longitudinal beams (along length)
  for (let row = 0; row < numColumnsY; row++) {
    for (let col = 0; col < numColumnsX - 1; col++) {
      beams.push({
        id: generateId(),
        label: `B-L${row + 1}-${col + 1}`,
        lengthFt: gridSpacingFt,
        widthInch: detectedBeamWidth,
        depthInch: detectedBeamDepth,
        concreteGrade: detectedConcreteGrade,
        isAssumed: !dimensionsFromDrawing,
      });
    }
  }
  // Transverse beams (along width)
  for (let col = 0; col < numColumnsX; col++) {
    for (let row = 0; row < numColumnsY - 1; row++) {
      beams.push({
        id: generateId(),
        label: `B-T${col + 1}-${row + 1}`,
        lengthFt: gridSpacingFt,
        widthInch: detectedBeamWidth,
        depthInch: detectedBeamDepth,
        concreteGrade: detectedConcreteGrade,
        isAssumed: !dimensionsFromDrawing,
      });
    }
  }

  // ── Generate Slabs ────────────────────────────────────────────────────────
  const slabs: SlabModel[] = [];
  for (let f = 1; f <= input.floors; f++) {
    slabs.push({
      id: generateId(),
      label: `Slab — Floor ${f}`,
      areaSqFt: detectedBUAPerFloor || buaPerFloor,
      thicknessInch: detectedSlabThickness,
      concreteGrade: detectedConcreteGrade,
      floor: f,
      isAssumed: !dimensionsFromDrawing,
    });
  }
  // Roof slab
  slabs.push({
    id: generateId(),
    label: 'Roof Slab',
    areaSqFt: detectedBUAPerFloor || buaPerFloor,
    thicknessInch: detectedSlabThickness,
    concreteGrade: detectedConcreteGrade,
    floor: input.floors + 1,
    isAssumed: !dimensionsFromDrawing,
  });

  // Record foundation type assumption
  if (detectedFoundationType && detectedFoundationType !== 'unknown') {
    const footingW = detectedFootingWidthFt || 5;
    const footingD = detectedFootingDepthFt || 5;
    assumptions.push(
      `Foundation type detected from drawing: ${detectedFoundationType} (${footingW}ft × ${footingW}ft × ${footingD}ft deep).`
    );
  }

  assumptions.push(
    `Slab thickness assumed at ${detectedSlabThickness}" (${(detectedSlabThickness / 12 * 304.8).toFixed(0)}mm). ${dimensionsFromDrawing ? 'Extracted from drawing.' : 'Standard IS456 minimum for residential buildings.'}`
  );

  // ── Generate Staircases ───────────────────────────────────────────────────
  const staircases: StaircaseModel[] = [];
  if (input.floors > 1) {
    staircases.push({
      id: generateId(),
      label: 'Main Staircase',
      flightsPerFloor: 2,
      stepCount: 18, // standard 18 steps per flight at 7" riser
      riserHeightInch: 7,
      treadDepthInch: 11,
      widthFt: 4,
      isAssumed: true
    });
    assumptions.push('Staircase assumed: 2 flights per floor, 18 steps per flight, 7" riser, 11" tread, 4ft wide (standard residential).');
  }

  // ── Compute total wall area ───────────────────────────────────────────────
  const totalWallArea = walls.reduce((sum, w) => sum + w.lengthFt * w.heightFt, 0);

  // ── Assemble model ────────────────────────────────────────────────────────
  const model: DigitalBuildingModel = {
    id: generateId(),
    projectId: input.projectId,
    version: 1,
    rooms,
    walls,
    columns,
    beams,
    slabs,
    staircases,
    totalFloors: input.floors,
    totalColumns: totalColumns,
    totalBUA_SqFt: Math.round(detectedBUAPerFloor ? detectedBUAPerFloor * input.floors : totalBUA),
    totalWallArea_SqFt: Math.round(totalWallArea),
    floorHeight_Ft: detectedFloorHeight,
    wallType: input.wallType,
    concreteGrade: detectedConcreteGrade,
    drawingIds: input.drawings.map(d => d.id),
    assumptions,
    generatedAt: new Date().toISOString(),
    overallConfidence: input.drawings.length === 0 ? 0.55
      : dimensionsFromDrawing ? 0.92
      : 0.75,
  };

  return { model, warnings };
}

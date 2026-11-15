import { BIMLiteBuildingModel } from './buildingModelGenerator';

export interface ConfidenceScores {
  overallConfidence: number;
  roomConfidence: number;
  wallConfidence: number;
  columnConfidence: number;
  beamConfidence: number;
  openingConfidence: number;
  lowConfidenceItems: Array<{
    category: 'Room' | 'Wall' | 'Column' | 'Beam' | 'Opening';
    name: string;
    score: number;
    description: string;
  }>;
}

export const ConfidenceEngine = {
  calculateConfidence(model: BIMLiteBuildingModel): ConfidenceScores {
    // Rooms average
    const roomScores = model.rooms.map(r => r.confidence);
    const roomConfidence = roomScores.length > 0 
      ? roomScores.reduce((sum, s) => sum + s, 0) / roomScores.length 
      : 0.95;

    // Walls average
    const wallScores = model.walls.map(w => w.confidence);
    const wallConfidence = wallScores.length > 0 
      ? wallScores.reduce((sum, s) => sum + s, 0) / wallScores.length 
      : 0.96;

    // Columns average
    const colScores = model.columns.map(c => c.confidence);
    const columnConfidence = colScores.length > 0 
      ? colScores.reduce((sum, s) => sum + s, 0) / colScores.length 
      : 0.92;

    // Beams average
    const beamScores = model.beams.map(b => b.confidence);
    const beamConfidence = beamScores.length > 0 
      ? beamScores.reduce((sum, s) => sum + s, 0) / beamScores.length 
      : 0.94;

    // Openings average
    const openingScores = model.openings.map(o => o.confidence);
    const openingConfidence = openingScores.length > 0 
      ? openingScores.reduce((sum, s) => sum + s, 0) / openingScores.length 
      : 0.93;

    // Calculate overall confidence score
    const overallConfidence = (
      roomConfidence +
      wallConfidence +
      columnConfidence +
      beamConfidence +
      openingConfidence
    ) / 5;

    // Identify low-confidence items (below 92%)
    const lowConfidenceItems: ConfidenceScores['lowConfidenceItems'] = [];

    model.rooms.forEach(r => {
      if (r.confidence < 0.92) {
        lowConfidenceItems.push({
          category: 'Room',
          name: r.name,
          score: r.confidence,
          description: `Room size detection bounds have lower reliability. Verify width and length.`
        });
      }
    });

    model.walls.forEach(w => {
      if (w.confidence < 0.93) {
        lowConfidenceItems.push({
          category: 'Wall',
          name: `${w.isExternal ? 'External' : 'Partition'} Wall (${w.id})`,
          score: w.confidence,
          description: `Wall coordinates could contain slight scaling offset.`
        });
      }
    });

    model.columns.forEach(c => {
      if (c.confidence < 0.92) {
        lowConfidenceItems.push({
          category: 'Column',
          name: `Column ${c.id}`,
          score: c.confidence,
          description: `Cross section grid intersection is unclear. Check structural thickness.`
        });
      }
    });

    model.openings.forEach(o => {
      if (o.confidence < 0.92) {
        lowConfidenceItems.push({
          category: 'Opening',
          name: `${o.type} (${o.id})`,
          score: o.confidence,
          description: `Opening width matches boundary check but depth coordinates might require verification.`
        });
      }
    });

    return {
      overallConfidence,
      roomConfidence,
      wallConfidence,
      columnConfidence,
      beamConfidence,
      openingConfidence,
      lowConfidenceItems
    };
  }
};

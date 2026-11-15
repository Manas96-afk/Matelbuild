import { Project } from '../../types';
import { BIMLiteBuildingModel } from '../ai/blueprint-analyzer/buildingModelGenerator';

export interface ValidationWarning {
  id: string;
  type: 'missing_rooms' | 'dimension_mismatch' | 'wall_mismatch' | 'floor_mismatch';
  severity: 'warning' | 'info' | 'error';
  title: string;
  message: string;
}

export const QuantityValidationService = {
  validate(project: Project, model: BIMLiteBuildingModel): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // 1. Missing Rooms Validation
    // Count bedrooms in model
    const modelBedrooms = model.rooms.filter(r => r.type === 'Bedroom').length;
    if (project.bedrooms > modelBedrooms) {
      warnings.push({
        id: 'warn-rooms-bed',
        type: 'missing_rooms',
        severity: 'warning',
        title: 'Missing Bedrooms in Blueprint',
        message: `Project settings request ${project.bedrooms} bedrooms, but only ${modelBedrooms} were detected on the drawing layout.`
      });
    }

    // Count bathrooms in model
    const modelBathrooms = model.rooms.filter(r => r.type === 'Bathroom').length;
    if (project.bathrooms > modelBathrooms) {
      warnings.push({
        id: 'warn-rooms-bath',
        type: 'missing_rooms',
        severity: 'warning',
        title: 'Missing Bathrooms in Blueprint',
        message: `Project settings request ${project.bathrooms} bathrooms, but only ${modelBathrooms} were detected on the drawing layout.`
      });
    }

    // Count kitchens in model
    const modelKitchens = model.rooms.filter(r => r.type === 'Kitchen').length;
    if (project.kitchens > modelKitchens) {
      warnings.push({
        id: 'warn-rooms-kitchen',
        type: 'missing_rooms',
        severity: 'info',
        title: 'Kitchen Count Mismatch',
        message: `Project settings request ${project.kitchens} kitchens, but only ${modelKitchens} were detected on the drawing layout.`
      });
    }

    // 2. Plot Dimensions vs Slab Dimensions
    const slab = model.slabs[0];
    if (slab) {
      // Slab boundaries should fit within plot length and width.
      // If slab is larger than plot dimensions, flag an error
      if (slab.length > project.plotLength || slab.width > project.plotWidth) {
        warnings.push({
          id: 'warn-dim-plot-size',
          type: 'dimension_mismatch',
          severity: 'error',
          title: 'Slab Exceeds Plot Limits',
          message: `Building slab dimension (${slab.length}ft x ${slab.width}ft) exceeds target plot dimensions (${project.plotLength}ft x ${project.plotWidth}ft).`
        });
      }
    }

    // 3. Wall Mismatch & Wall Thickness validation
    const walls = model.walls;
    if (walls.length > 0) {
      // Check if project requests specific wall types, and check model walls
      const modelWallMaterial = walls[0].material; // e.g. 'Brick Wall' or 'AAC Block Wall'
      const projectWallType = project.wallType || 'Brick Wall';

      let projectWallKey: string = 'Brick Wall';
      if (projectWallType.includes('AAC')) {
        projectWallKey = 'AAC Block Wall';
      }

      if (modelWallMaterial !== projectWallKey) {
        warnings.push({
          id: 'warn-wall-type',
          type: 'wall_mismatch',
          severity: 'warning',
          title: 'Wall Material Mismatch',
          message: `Project layout settings specify '${projectWallType}', but parsed blueprint walls are set to '${modelWallMaterial}'.`
        });
      }
    }

    // 4. Floor Count Mismatch
    // Check if model has elements on higher floors, vs project floors
    const projectFloors = Number(project.floors);
    const maxModelFloor = Math.max(...model.rooms.map(r => r.floor), ...model.walls.map(w => w.floor), 1);
    if (projectFloors !== maxModelFloor) {
      warnings.push({
        id: 'warn-floor-mismatch',
        type: 'floor_mismatch',
        severity: 'warning',
        title: 'Floor Count Mismatch',
        message: `Project is configured for G+${projectFloors - 1} (${projectFloors} Floor${projectFloors > 1 ? 's' : ''}), but the drawing model only contains parsed data for ${maxModelFloor} floor${maxModelFloor > 1 ? 's' : ''}.`
      });
    }

    return warnings;
  }
};

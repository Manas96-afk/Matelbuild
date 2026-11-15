import { createClient } from '@supabase/supabase-js';
import { Project, MaterialRateRow, FullEstimationReport, Blueprint, AIBuildingModel, UserProfile } from '../../types';
import { Drawing, DrawingAnalysis, DigitalBuildingModel } from '../../types/blueprint';
import { getValue, setValue, deleteValue } from './indexedDB';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
  supabaseUrl.trim() !== '' && 
  supabaseUrl !== 'your-supabase-url' &&
  supabaseAnonKey.trim() !== '' && 
  supabaseAnonKey !== 'your-supabase-anon-key';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

// Initial Mock Data to populate LocalStorage if empty
const MOCK_PROJECTS: Project[] = [
  {
    id: 'mock-proj-1',
    userId: 'mock-user-id',
    projectName: 'Villa Vista',
    plotLength: 50,
    plotWidth: 30,
    unit: 'Feet',
    plotType: 'Residential',
    floors: 2,
    quality: 'Standard',
    bedrooms: 3,
    bathrooms: 3,
    kitchens: 1,
    livingRooms: 1,
    balconies: 2,
    parkingRequired: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-proj-2',
    userId: 'mock-user-id',
    projectName: 'Downtown Office Space',
    plotLength: 20,
    plotWidth: 15,
    unit: 'Meter',
    plotType: 'Commercial',
    floors: 3,
    quality: 'Premium',
    bedrooms: 0,
    bathrooms: 4,
    kitchens: 2,
    livingRooms: 2,
    balconies: 0,
    parkingRequired: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Helper to initialize localStorage projects if empty
function getLocalStorageProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('buildora_projects');
  if (!stored) {
    localStorage.setItem('buildora_projects', JSON.stringify(MOCK_PROJECTS));
    return MOCK_PROJECTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return MOCK_PROJECTS;
  }
}

function saveLocalStorageProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('buildora_projects', JSON.stringify(projects));
}

function getLocalStorageBlueprints(): Blueprint[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('buildora_blueprints');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalStorageBlueprints(blueprints: Blueprint[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('buildora_blueprints', JSON.stringify(blueprints));
}

function getLocalStorageAIBuildingModels(): AIBuildingModel[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('buildora_ai_building_models');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalStorageAIBuildingModels(models: AIBuildingModel[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('buildora_ai_building_models', JSON.stringify(models));
}


// Unified Database Provider Interface
export const db = {
  // Fetch all projects for a user
  async getProjects(userId: string): Promise<Project[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase getProjects error, falling back to LocalStorage:', error);
        return getLocalStorageProjects().filter(p => p.userId === userId);
      }
      
      // Map database columns to PlotDetails/BuildingDetails structure
      return (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        projectName: row.projectName,
        plotLength: Number(row.plotLength),
        plotWidth: Number(row.plotWidth),
        unit: row.unit,
        plotType: row.plotType,
        floors: Number(row.floors),
        quality: row.quality,
        bedrooms: Number(row.bedrooms),
        bathrooms: Number(row.bathrooms),
        kitchens: Number(row.kitchens),
        livingRooms: Number(row.livingRooms),
        balconies: Number(row.balconies),
        parkingRequired: row.parkingRequired,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        state: row.state || undefined,
        city: row.city || undefined,
        floorHeight: row.floorHeight ? Number(row.floorHeight) : undefined,
        wallType: row.wallType || undefined,
        pccGrade: row.pccGrade || undefined,
        rccGrade: row.rccGrade || undefined,
        flooringType: row.flooringType || undefined,
        wastageOption: row.wastageOption ? Number(row.wastageOption) : undefined,
        country: row.country || undefined,
      }));
    } else {
      // LocalStorage Mode
      return getLocalStorageProjects().filter(p => p.userId === userId);
    }
  },

  // Fetch single project by ID
  async getProjectById(id: string, userId: string): Promise<Project | null> {
    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Supabase getProjectById error, falling back to LocalStorage:', error);
        const localList = getLocalStorageProjects();
        return localList.find(p => p.id === id && p.userId === userId) || null;
      }

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        projectName: data.projectName,
        plotLength: Number(data.plotLength),
        plotWidth: Number(data.plotWidth),
        unit: data.unit,
        plotType: data.plotType,
        floors: Number(data.floors),
        quality: data.quality,
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        kitchens: Number(data.kitchens),
        livingRooms: Number(data.livingRooms),
        balconies: Number(data.balconies),
        parkingRequired: data.parkingRequired,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        state: data.state || undefined,
        city: data.city || undefined,
        floorHeight: data.floorHeight ? Number(data.floorHeight) : undefined,
        wallType: data.wallType || undefined,
        pccGrade: data.pccGrade || undefined,
        rccGrade: data.rccGrade || undefined,
        flooringType: data.flooringType || undefined,
        wastageOption: data.wastageOption ? Number(data.wastageOption) : undefined,
        country: data.country || undefined,
      };
    } else {
      const localList = getLocalStorageProjects();
      return localList.find(p => p.id === id && p.userId === userId) || null;
    }
  },

  // Create a new project
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const timestamp = new Date().toISOString();
    
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: project.userId,
          projectName: project.projectName,
          plotLength: project.plotLength,
          plotWidth: project.plotWidth,
          unit: project.unit,
          plotType: project.plotType,
          floors: project.floors,
          quality: project.quality,
          bedrooms: project.bedrooms,
          bathrooms: project.bathrooms,
          kitchens: project.kitchens,
          livingRooms: project.livingRooms,
          balconies: project.balconies,
          parkingRequired: project.parkingRequired,
          state: project.state,
          city: project.city,
          floorHeight: project.floorHeight,
          wallType: project.wallType,
          pccGrade: project.pccGrade,
          rccGrade: project.rccGrade,
          flooringType: project.flooringType,
          wastageOption: project.wastageOption,
          country: project.country,
          created_at: timestamp,
          updated_at: timestamp
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase createProject error, falling back to LocalStorage:', JSON.stringify(error, null, 2));
      } else if (data) {
        return {
          id: data.id,
          userId: data.user_id,
          projectName: data.projectName,
          plotLength: Number(data.plotLength),
          plotWidth: Number(data.plotWidth),
          unit: data.unit,
          plotType: data.plotType,
          floors: Number(data.floors),
          quality: data.quality,
          bedrooms: Number(data.bedrooms),
          bathrooms: Number(data.bathrooms),
          kitchens: Number(data.kitchens),
          livingRooms: Number(data.livingRooms),
          balconies: Number(data.balconies),
          parkingRequired: data.parkingRequired,
          state: data.state || undefined,
          city: data.city || undefined,
          floorHeight: data.floorHeight ? Number(data.floorHeight) : undefined,
          wallType: data.wallType || undefined,
          pccGrade: data.pccGrade || undefined,
          rccGrade: data.rccGrade || undefined,
          flooringType: data.flooringType || undefined,
          wastageOption: data.wastageOption ? Number(data.wastageOption) : undefined,
          country: data.country || undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    // LocalStorage Fallback (or if error occurred)
    const newProject: Project = {
      ...project,
      id: 'proj-' + Math.random().toString(36).substring(2, 9),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const localList = getLocalStorageProjects();
    localList.unshift(newProject);
    saveLocalStorageProjects(localList);
    return newProject;
  },

  // Update a project
  async updateProject(id: string, userId: string, project: Partial<Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Project | null> {
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      const dbUpdate: any = {};
      if (project.projectName !== undefined) dbUpdate.projectName = project.projectName;
      if (project.plotLength !== undefined) dbUpdate.plotLength = project.plotLength;
      if (project.plotWidth !== undefined) dbUpdate.plotWidth = project.plotWidth;
      if (project.unit !== undefined) dbUpdate.unit = project.unit;
      if (project.plotType !== undefined) dbUpdate.plotType = project.plotType;
      if (project.floors !== undefined) dbUpdate.floors = project.floors;
      if (project.quality !== undefined) dbUpdate.quality = project.quality;
      if (project.bedrooms !== undefined) dbUpdate.bedrooms = project.bedrooms;
      if (project.bathrooms !== undefined) dbUpdate.bathrooms = project.bathrooms;
      if (project.kitchens !== undefined) dbUpdate.kitchens = project.kitchens;
      if (project.livingRooms !== undefined) dbUpdate.livingRooms = project.livingRooms;
      if (project.balconies !== undefined) dbUpdate.balconies = project.balconies;
      if (project.parkingRequired !== undefined) dbUpdate.parkingRequired = project.parkingRequired;
      if (project.state !== undefined) dbUpdate.state = project.state;
      if (project.city !== undefined) dbUpdate.city = project.city;
      if (project.floorHeight !== undefined) dbUpdate.floorHeight = project.floorHeight;
      if (project.wallType !== undefined) dbUpdate.wallType = project.wallType;
      if (project.pccGrade !== undefined) dbUpdate.pccGrade = project.pccGrade;
      if (project.rccGrade !== undefined) dbUpdate.rccGrade = project.rccGrade;
      if (project.flooringType !== undefined) dbUpdate.flooringType = project.flooringType;
      if (project.wastageOption !== undefined) dbUpdate.wastageOption = project.wastageOption;
      if (project.country !== undefined) dbUpdate.country = project.country;
      dbUpdate.updated_at = timestamp;

      const { data, error } = await supabase
        .from('projects')
        .update(dbUpdate)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Supabase updateProject error, falling back to LocalStorage:', error);
      } else if (data) {
        return {
          id: data.id,
          userId: data.user_id,
          projectName: data.projectName,
          plotLength: Number(data.plotLength),
          plotWidth: Number(data.plotWidth),
          unit: data.unit,
          plotType: data.plotType,
          floors: Number(data.floors),
          quality: data.quality,
          bedrooms: Number(data.bedrooms),
          bathrooms: Number(data.bathrooms),
          kitchens: Number(data.kitchens),
          livingRooms: Number(data.livingRooms),
          balconies: Number(data.balconies),
          parkingRequired: data.parkingRequired,
          state: data.state || undefined,
          city: data.city || undefined,
          floorHeight: data.floorHeight ? Number(data.floorHeight) : undefined,
          wallType: data.wallType || undefined,
          pccGrade: data.pccGrade || undefined,
          rccGrade: data.rccGrade || undefined,
          flooringType: data.flooringType || undefined,
          wastageOption: data.wastageOption ? Number(data.wastageOption) : undefined,
          country: data.country || undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    // LocalStorage Fallback (or if error occurred)
    const localList = getLocalStorageProjects();
    const index = localList.findIndex(p => p.id === id && p.userId === userId);
    if (index === -1) return null;

    const updatedProject: Project = {
      ...localList[index],
      ...project,
      updatedAt: timestamp,
    } as Project;

    localList[index] = updatedProject;
    saveLocalStorageProjects(localList);
    return updatedProject;
  },

  // Delete a project
  async deleteProject(id: string, userId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Supabase deleteProject error, falling back to LocalStorage:', error);
      } else {
        return true;
      }
    }

    // LocalStorage Fallback
    const localList = getLocalStorageProjects();
    const filtered = localList.filter(p => !(p.id === id && p.userId === userId));
    const wasDeleted = filtered.length !== localList.length;
    saveLocalStorageProjects(filtered);
    return wasDeleted;
  },

  // Fetch country rates
  async getCountryRates(country: string): Promise<MaterialRateRow[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('country_rates')
        .select(`
          country,
          economy_rate,
          standard_rate,
          premium_rate,
          updated_at,
          materials (
            id,
            name,
            unit
          )
        `)
        .eq('country', country);

      if (error) {
        console.error('Supabase getCountryRates error:', error);
        return [];
      }

      if (data) {
        return data.map((row: any) => ({
          materialId: row.materials.id,
          materialName: row.materials.name,
          unit: row.materials.unit,
          economyRate: Number(row.economy_rate),
          standardRate: Number(row.standard_rate),
          premiumRate: Number(row.premium_rate),
          luxuryRate: Number(row.luxury_rate || row.premium_rate * 1.3),
          updatedAt: row.updated_at
        }));
      }
    }
    
    // LocalStorage fallback
    const stored = typeof window !== 'undefined' ? localStorage.getItem(`buildora_rates_${country}`) : null;
    if (stored) {
      try { return JSON.parse(stored); } catch { }
    }
    return [];
  },

  // Save project estimate
  async saveEstimate(projectId: string, report: FullEstimationReport): Promise<boolean> {
    if (isSupabaseConfigured && supabase && isValidUUID(projectId)) {
      const { error } = await supabase
        .from('estimates')
        .upsert({
          project_id: projectId,
          material_summary: report.quantities,
          cost_summary: {} // empty object to satisfy Supabase schema constraint
        }, { onConflict: 'project_id' });

      if (error) {
        console.error('Supabase saveEstimate error:', error);
        return false;
      }
      return true;
    }

    // LocalStorage Fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem(`buildora_estimate_${projectId}`, JSON.stringify(report));
      return true;
    }
    return false;
  },

  // Get project estimate by project ID
  async getEstimateByProjectId(projectId: string): Promise<FullEstimationReport | null> {
    if (isSupabaseConfigured && supabase && isValidUUID(projectId)) {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is single row not found error
          console.error('Supabase getEstimateByProjectId error:', error);
        }
      } else if (data) {
        return {
          quantities: data.material_summary as any,
          builtUpAreaSqFt: Number(data.material_summary?.area?.builtUpAreaSqFt || 0)
        } as FullEstimationReport;
      }
    }

    // LocalStorage Fallback
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`buildora_estimate_${projectId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  // Fetch blueprints by project ID
  async getBlueprints(projectId: string): Promise<Blueprint[]> {
    if (isSupabaseConfigured && supabase && isValidUUID(projectId)) {
      const { data, error } = await supabase
        .from('blueprints')
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });
      if (error) {
        console.error('Supabase getBlueprints error, falling back to LocalStorage:', error);
      } else if (data) {
        return data.map((row: any) => ({
          id: row.id,
          projectId: row.project_id,
          fileUrl: row.file_url,
          fileType: row.file_type,
          uploadedAt: row.uploaded_at
        }));
      }
    }
    return getLocalStorageBlueprints().filter(b => b.projectId === projectId);
  },

  // Save blueprint metadata
  async saveBlueprint(blueprint: Omit<Blueprint, 'id' | 'uploadedAt'>): Promise<Blueprint> {
    const timestamp = new Date().toISOString();
    if (isSupabaseConfigured && supabase && isValidUUID(blueprint.projectId)) {
      const { data, error } = await supabase
        .from('blueprints')
        .insert({
          project_id: blueprint.projectId,
          file_url: blueprint.fileUrl,
          file_type: blueprint.fileType,
          uploaded_at: timestamp
        })
        .select()
        .single();
      if (error) {
        console.error('Supabase saveBlueprint error, falling back to LocalStorage:', error);
      } else if (data) {
        return {
          id: data.id,
          projectId: data.project_id,
          fileUrl: data.file_url,
          fileType: data.file_type,
          uploadedAt: data.uploaded_at
        };
      }
    }
    const newBlueprint: Blueprint = {
      ...blueprint,
      id: 'bp-' + Math.random().toString(36).substring(2, 9),
      uploadedAt: timestamp
    };
    const local = getLocalStorageBlueprints();
    local.unshift(newBlueprint);
    saveLocalStorageBlueprints(local);
    return newBlueprint;
  },

  // Fetch AI building model by project ID
  async getAIBuildingModel(projectId: string): Promise<AIBuildingModel | null> {
    if (isSupabaseConfigured && supabase && isValidUUID(projectId)) {
      const { data, error } = await supabase
        .from('ai_building_models')
        .select('*')
        .eq('project_id', projectId)
        .single();
      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Supabase getAIBuildingModel error:', error);
        }
      } else if (data) {
        return {
          id: data.id,
          projectId: data.project_id,
          buildingJson: data.building_json,
          confidenceScore: Number(data.confidence_score),
          createdAt: data.created_at
        };
      }
    }
    const local = getLocalStorageAIBuildingModels();
    return local.find(m => m.projectId === projectId) || null;
  },

  // Save AI building model (Upsert based on project ID)
  async saveAIBuildingModel(projectId: string, buildingJson: any, confidenceScore: number): Promise<AIBuildingModel> {
    const timestamp = new Date().toISOString();
    if (isSupabaseConfigured && supabase && isValidUUID(projectId)) {
      const { data, error } = await supabase
        .from('ai_building_models')
        .upsert({
          project_id: projectId,
          building_json: buildingJson,
          confidence_score: confidenceScore,
          created_at: timestamp
        }, { onConflict: 'project_id' })
        .select()
        .single();
      if (error) {
        console.error('Supabase saveAIBuildingModel error, falling back to LocalStorage:', error);
      } else if (data) {
        return {
          id: data.id,
          projectId: data.project_id,
          buildingJson: data.building_json,
          confidenceScore: Number(data.confidence_score),
          createdAt: data.created_at
        };
      }
    }
    const local = getLocalStorageAIBuildingModels();
    const index = local.findIndex(m => m.projectId === projectId);
    const updatedModel: AIBuildingModel = {
      id: index !== -1 ? local[index].id : 'model-' + Math.random().toString(36).substring(2, 9),
      projectId,
      buildingJson,
      confidenceScore,
      createdAt: timestamp
    };
    if (index !== -1) {
      local[index] = updatedModel;
    } else {
      local.push(updatedModel);
    }
    saveLocalStorageAIBuildingModels(local);
    return updatedModel;
  },

  // Delete AI building model
  async deleteAIBuildingModel(projectId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase && isValidUUID(projectId)) {
      const { error } = await supabase
        .from('ai_building_models')
        .delete()
        .eq('project_id', projectId);
      if (error) {
        console.error('Supabase deleteAIBuildingModel error, falling back to LocalStorage:', error);
      } else {
        return true;
      }
    }
    const local = getLocalStorageAIBuildingModels();
    const filtered = local.filter(m => m.projectId !== projectId);
    const deleted = filtered.length !== local.length;
    saveLocalStorageAIBuildingModels(filtered);
    return deleted;
  },

  // Update profile
  async updateProfile(id: string, profile: { name: string }): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ name: profile.name })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('Supabase updateProfile error:', error);
        return null;
      }
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        createdAt: data.created_at
      };
    } else {
      // LocalStorage update
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('buildora_current_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          const updated = { ...u, name: profile.name };
          localStorage.setItem('buildora_current_user', JSON.stringify(updated));
          
          // Also update in registered list
          const registeredStr = localStorage.getItem('buildora_registered_users') || '[]';
          const registeredUsers = JSON.parse(registeredStr);
          const idx = registeredUsers.findIndex((user: any) => user.id === id);
          if (idx !== -1) {
            registeredUsers[idx].name = profile.name;
            localStorage.setItem('buildora_registered_users', JSON.stringify(registeredUsers));
          }
          return updated;
        }
      }
      return null;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DRAWINGS (per-project drawing records)
  // ─────────────────────────────────────────────────────────────────────────

  async getDrawings(projectId: string): Promise<Drawing[]> {
    if (typeof window === 'undefined') return [];
    try {
      const idbDrawings = await getValue<Drawing[]>('drawings', projectId);
      if (idbDrawings) {
        return idbDrawings;
      }
    } catch (e) {
      console.error('Failed to get drawings from IndexedDB, trying localStorage:', e);
    }

    const localKey = `buildora_drawings_${projectId}`;
    const stored = localStorage.getItem(localKey);
    if (!stored) return [];
    try {
      const drawings = JSON.parse(stored);
      try {
        await setValue('drawings', projectId, drawings);
        localStorage.removeItem(localKey);
      } catch (err) {
        console.error('Failed to migrate drawings to IndexedDB:', err);
      }
      return drawings;
    } catch {
      return [];
    }
  },

  async saveDrawing(drawing: Drawing): Promise<Drawing> {
    if (typeof window === 'undefined') return drawing;
    const list = await this.getDrawings(drawing.projectId);
    const idx = list.findIndex(d => d.id === drawing.id);
    if (idx !== -1) {
      list[idx] = drawing;
    } else {
      list.unshift(drawing);
    }

    try {
      await setValue('drawings', drawing.projectId, list);
    } catch (e) {
      console.error('Failed to save drawing to IndexedDB, falling back to localStorage:', e);
      localStorage.setItem(`buildora_drawings_${drawing.projectId}`, JSON.stringify(list));
    }
    return drawing;
  },

  async deleteDrawing(projectId: string, drawingId: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const list = await this.getDrawings(projectId);
    const filtered = list.filter(d => d.id !== drawingId);
    const deleted = filtered.length !== list.length;

    try {
      await setValue('drawings', projectId, filtered);
    } catch (e) {
      console.error('Failed to delete drawing from IndexedDB, falling back to localStorage:', e);
      localStorage.setItem(`buildora_drawings_${projectId}`, JSON.stringify(filtered));
    }
    return deleted;
  },

  async saveAllDrawings(projectId: string, drawings: Drawing[]): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      await setValue('drawings', projectId, drawings);
    } catch (e) {
      console.error('Failed to save all drawings to IndexedDB, falling back to localStorage:', e);
      localStorage.setItem(`buildora_drawings_${projectId}`, JSON.stringify(drawings));
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DRAWING ANALYSES (AI analysis results per drawing)
  // ─────────────────────────────────────────────────────────────────────────

  async getDrawingAnalyses(projectId: string): Promise<DrawingAnalysis[]> {
    if (typeof window === 'undefined') return [];
    try {
      const idbAnalyses = await getValue<DrawingAnalysis[]>('analyses', projectId);
      if (idbAnalyses) {
        return idbAnalyses;
      }
    } catch (e) {
      console.error('Failed to get analyses from IndexedDB, trying localStorage:', e);
    }

    const localKey = `buildora_analyses_${projectId}`;
    const stored = localStorage.getItem(localKey);
    if (!stored) return [];
    try {
      const analyses = JSON.parse(stored);
      try {
        await setValue('analyses', projectId, analyses);
        localStorage.removeItem(localKey);
      } catch (err) {
        console.error('Failed to migrate analyses to IndexedDB:', err);
      }
      return analyses;
    } catch {
      return [];
    }
  },

  async saveDrawingAnalysis(analysis: DrawingAnalysis): Promise<DrawingAnalysis> {
    if (typeof window === 'undefined') return analysis;
    const list = await this.getDrawingAnalyses(analysis.projectId);
    const idx = list.findIndex(a => a.id === analysis.id);
    if (idx !== -1) {
      list[idx] = analysis;
    } else {
      list.push(analysis);
    }

    try {
      await setValue('analyses', analysis.projectId, list);
    } catch (e) {
      console.error('Failed to save analysis to IndexedDB, falling back to localStorage:', e);
      localStorage.setItem(`buildora_analyses_${analysis.projectId}`, JSON.stringify(list));
    }
    return analysis;
  },

  async saveAllAnalyses(projectId: string, analyses: DrawingAnalysis[]): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      await setValue('analyses', projectId, analyses);
    } catch (e) {
      console.error('Failed to save all analyses to IndexedDB, falling back to localStorage:', e);
      localStorage.setItem(`buildora_analyses_${projectId}`, JSON.stringify(analyses));
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DIGITAL BUILDING MODEL (the structured project source-of-truth)
  // ─────────────────────────────────────────────────────────────────────────

  async getDigitalBuildingModel(projectId: string): Promise<DigitalBuildingModel | null> {
    if (typeof window === 'undefined') return null;
    try {
      const idbModel = await getValue<DigitalBuildingModel>('digital_models', projectId);
      if (idbModel) {
        return idbModel;
      }
    } catch (e) {
      console.error('Failed to get digital building model from IndexedDB, trying localStorage:', e);
    }

    const localKey = `buildora_digital_model_${projectId}`;
    const stored = localStorage.getItem(localKey);
    if (!stored) return null;
    try {
      const model = JSON.parse(stored);
      try {
        await setValue('digital_models', projectId, model);
        localStorage.removeItem(localKey);
      } catch (err) {
        console.error('Failed to migrate digital building model to IndexedDB:', err);
      }
      return model;
    } catch {
      return null;
    }
  },

  async saveDigitalBuildingModel(model: DigitalBuildingModel): Promise<DigitalBuildingModel> {
    if (typeof window === 'undefined') return model;
    try {
      await setValue('digital_models', model.projectId, model);
    } catch (e) {
      console.error('Failed to save digital building model to IndexedDB, falling back to localStorage:', e);
      localStorage.setItem(`buildora_digital_model_${model.projectId}`, JSON.stringify(model));
    }
    return model;
  },

  async deleteDigitalBuildingModel(projectId: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      await deleteValue('digital_models', projectId);
      localStorage.removeItem(`buildora_digital_model_${projectId}`);
    } catch (e) {
      console.error('Failed to delete digital building model from IndexedDB:', e);
      localStorage.removeItem(`buildora_digital_model_${projectId}`);
    }
  },

};




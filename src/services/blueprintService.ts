import { db } from '../../lib/db';
import { Blueprint, AIBuildingModel } from '../../types';
import { BuildingModelGenerator, BIMLiteBuildingModel } from '../ai/blueprint-analyzer/buildingModelGenerator';
import { ConfidenceEngine, ConfidenceScores } from '../ai/blueprint-analyzer/confidenceEngine';

export const BlueprintService = {
  // Simulate drawing analysis
  async uploadAndAnalyze(
    projectId: string,
    fileName: string,
    fileType: string,
    templateName: string = 'default',
    projectParams: {
      wallType?: 'Brick Wall' | 'AAC Block Wall';
      concreteGrade?: 'M20' | 'M25' | 'M30';
    } = {}
  ): Promise<{
    blueprint: Blueprint;
    model: AIBuildingModel;
    confidence: ConfidenceScores;
  }> {
    // 1. Register file upload meta in db
    const fileUrl = `/uploads/blueprints/${projectId}/${Date.now()}_${fileName}`;
    const blueprint = await db.saveBlueprint({
      projectId,
      fileUrl,
      fileType
    });

    // 2. Trigger AI Building Model parsing
    const buildingModelJson = BuildingModelGenerator.generateModel(projectId, templateName, projectParams);
    
    // 3. Compute confidence details
    const confidence = ConfidenceEngine.calculateConfidence(buildingModelJson);
    
    // 4. Store parsed model in DB
    const model = await db.saveAIBuildingModel(
      projectId,
      buildingModelJson,
      confidence.overallConfidence
    );

    return {
      blueprint,
      model,
      confidence
    };
  },

  // Save / update custom edited building model (e.g. from manual edits)
  async saveBuildingModel(
    projectId: string,
    buildingModel: BIMLiteBuildingModel,
    confidenceScore: number
  ): Promise<AIBuildingModel> {
    return await db.saveAIBuildingModel(projectId, buildingModel, confidenceScore);
  },

  // Retrieve building model for project
  async getBuildingModel(projectId: string): Promise<AIBuildingModel | null> {
    return await db.getAIBuildingModel(projectId);
  },

  // Remove building model (to clear overrides)
  async deleteBuildingModel(projectId: string): Promise<boolean> {
    return await db.deleteAIBuildingModel(projectId);
  }
};

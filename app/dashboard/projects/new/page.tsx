'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import { db } from '../../../../lib/db';
import { EstimateService } from '../../../../lib/services/estimateService';
import { ProjectForm } from '../../../../components/projects/ProjectForm';
import { Project } from '../../../../types';

export default function NewProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    data: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    drawings?: any[]
  ) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const newProject = await db.createProject({
        ...data,
        userId: user.id,
      });

      if (drawings && drawings.length > 0) {
        const drawingsForDB = drawings.map(({ previewImages: _p, ...d }: any) => ({
          ...d,
          projectId: newProject.id,
        }));
        await db.saveAllDrawings(newProject.id, drawingsForDB);
      }

      // Generate and save estimate to populate database immediately
      const estimate = await EstimateService.generateFullEstimate(newProject);
      await EstimateService.saveProjectEstimate(newProject.id, estimate);
      
      // Redirect to the newly created project estimation sheet
      router.push(`/dashboard/projects/${newProject.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="py-4">
      <ProjectForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
